import Link from "next/link";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { MechanismList } from "@/components/MechanismList";
import { loadChapterMechanisms } from "@/lib/mechanism";
import { loadLoggedInDashboard } from "@/lib/dashboard";
import { CHAPTERS } from "@/lib/constants";

// Module 3 — Drag & Drop Mechanism (Sprint 7 §7.1).
// Route: /practice/[chapter]/module-3. Drag (or tap) mechanism labels onto the
// diagram's slots. All correct → +30 XP + story; after 3 wrong attempts the
// answer is revealed. Public: guests play with XP credited to localStorage.

export default async function Module3Page({
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

  const { categoryName, mechanisms } = validChapter
    ? await loadChapterMechanisms(chapterId)
    : { categoryName: null, mechanisms: [] };

  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;
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
            {chapterMeta?.name ?? categoryName ?? "Practice"} · Module 3
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag &amp; Drop Mechanism
          </p>
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
          <MechanismList mechanisms={mechanisms} isGuest={isGuest} />
        )}
      </main>
    </AppShell>
  );
}
