import Link from "next/link";
import { and, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProgress } from "@/db/schema";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { PracticeSession } from "@/components/PracticeSession";
import { loadChapterReactions } from "@/lib/practice";
import { loadLoggedInDashboard } from "@/lib/dashboard";
import { CHAPTERS } from "@/lib/constants";

// Module 1 — Build the Reaction (MCQ). Route: /practice/[chapter]/module-1
// where [chapter] is the category order_index (the chapter id used in the map).
// Public: guests practise with no auth redirect (Sprint 3 §3.5).

export default async function Module1Page({
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

  const { categoryName, reactions } = validChapter
    ? await loadChapterReactions(chapterId)
    : { categoryName: null, reactions: [] };

  // Logged-in: load prior attempt counts (for weighted selection) and mastered
  // reactions (so we only flag *fresh* card unlocks in the summary).
  let attemptsById: Record<number, number> = {};
  let masteredIds: number[] = [];
  let xp = 0;

  if (userId != null && reactions.length > 0) {
    const ids = reactions.map((r) => r.id);
    const rows = await db
      .select({
        reactionId: userProgress.reactionId,
        attempts: userProgress.attempts,
        mastered: userProgress.mastered,
      })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          inArray(userProgress.reactionId, ids)
        )
      );
    attemptsById = Object.fromEntries(
      rows.map((r) => [r.reactionId, r.attempts])
    );
    masteredIds = rows.filter((r) => r.mastered).map((r) => r.reactionId);
  }

  if (userId != null) {
    xp = (await loadLoggedInDashboard(userId)).xp;
  }

  const chapterMeta = CHAPTERS.find((c) => c.id === chapterId);

  return (
    <>
      {isGuest && <GuestBanner />}
      <Nav isGuest={isGuest} xp={xp} username={session?.user?.username} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Chapter Map
            </Link>
            <h1 className="mt-1 text-xl font-bold tracking-tight">
              {chapterMeta?.name ?? categoryName ?? "Practice"} · Module 1
            </h1>
            <p className="text-sm text-muted-foreground">Build the Reaction</p>
          </div>
          {/* Reference drawer trigger — content lands in Sprint 8. */}
          <button
            type="button"
            aria-label="Reference charts (coming soon)"
            disabled
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground disabled:opacity-50"
            title="Reference charts — coming soon"
          >
            📚
          </button>
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
          <PracticeSession
            chapterId={chapterId}
            categoryName={categoryName}
            reactions={reactions}
            isGuest={isGuest}
            attemptsById={attemptsById}
            masteredIds={masteredIds}
          />
        )}
      </main>
    </>
  );
}
