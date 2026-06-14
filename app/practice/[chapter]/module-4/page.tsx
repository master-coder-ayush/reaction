import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { pathwayCards } from "@/db/schema";
import { AppShell } from "@/components/AppShell";
import { PathwayList } from "@/components/PathwayList";
import { loadChapterPathways } from "@/lib/pathway";
import { loadLoggedInDashboard } from "@/lib/dashboard";
import { CHAPTERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const ch = CHAPTERS.find((c) => c.id === Number(chapter));
  if (!ch) return { title: "Module 4" };
  return {
    title: `Module 4 · ${ch.name}`,
    description: `Reaction Pathway Challenge — trace multi-step synthesis pathways through ${ch.name} (Class ${ch.classLevel}). Earn XP for each correct step.`,
    openGraph: {
      title: `${ch.name} Module 4 · Level Up Chemistry`,
      description: `Multi-step ${ch.name} synthesis pathways. Trace the route and earn XP.`,
    },
  };
}

// Module 4 — Reaction Pathway Challenge (Sprint 6 §6.1).
// Route: /practice/[chapter]/module-4. Lists the chapter's pathways; selecting
// one plays a step-by-step conversion that awards +20 XP per step and a +80 XP
// completion bonus, saves a pathway card, and fires the Pathway Pioneer badge.
// Public: guests play with XP credited to localStorage (no persistence).

export default async function Module4Page({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: chapterParam } = await params;
  const chapterId = Number(chapterParam);
  const validChapter = Number.isInteger(chapterId) && chapterId >= 1;

  const session = await auth();
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  const { categoryName, pathways } = validChapter
    ? await loadChapterPathways(chapterId)
    : { categoryName: null, pathways: [] };

  let completedIds: number[] = [];
  let xp = 0;
  if (userId != null) {
    const [cards, dash] = await Promise.all([
      db
        .select({ pathwayId: pathwayCards.pathwayId })
        .from(pathwayCards)
        .where(eq(pathwayCards.userId, userId)),
      loadLoggedInDashboard(userId),
    ]);
    completedIds = cards.map((c) => c.pathwayId);
    xp = dash.xp;
  }

  const chapterMeta = CHAPTERS.find((c) => c.id === chapterId);

  return (
    <AppShell isGuest={isGuest} xp={xp} username={session?.user?.username}>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-4">
          <Link
            href={validChapter ? `/learn/${chapterId}` : "/learn"}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {chapterMeta?.name ?? "Chapter"}
          </Link>
          <h1 className="mt-1 text-xl font-bold tracking-tight">
            {chapterMeta?.name ?? categoryName ?? "Practice"} · Module 4
          </h1>
          <p className="text-sm text-muted-foreground">
            Reaction Pathway Challenge
          </p>
          <div className="mt-1 flex gap-3 text-xs">
            <Link href={`/practice/${chapterId}/module-3`} className="font-medium text-muted-foreground hover:text-foreground">
              ← Module 3
            </Link>
            <Link href={`/boss/${chapterId}`} className="font-medium text-primary hover:underline">
              Boss Level →
            </Link>
          </div>
        </div>

        {!validChapter ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
            That chapter doesn&apos;t exist.{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Back to the chapter map
            </Link>
            .
          </div>
        ) : (
          <PathwayList
            pathways={pathways}
            completedIds={completedIds}
            isGuest={isGuest}
          />
        )}
      </main>
    </AppShell>
  );
}
