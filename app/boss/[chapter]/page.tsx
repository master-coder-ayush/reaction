import Link from "next/link";
import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { BossEntry } from "@/components/BossEntry";
import { attemptsToday, loadBossQuestions } from "@/lib/boss";
import { bossBadgeByChapter, isChapterUnlocked } from "@/lib/chapters";
import { loadLoggedInDashboard } from "@/lib/dashboard";
import { CHAPTERS } from "@/lib/constants";
import { db } from "@/db";
import { badges } from "@/db/schema";
import { eq } from "drizzle-orm";

// Boss level — Route: /boss/[chapter], where [chapter] is the category
// order_index (chapter id). Gated for logged-in users: the chapter must be
// unlocked (previous boss cleared). Guests are never gated (Sprint 5 §5.1–5.2).

export default async function BossPage({
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

  const chapterMeta = CHAPTERS.find((c) => c.id === chapterId);
  const xp = userId != null ? (await loadLoggedInDashboard(userId)).xp : 0;

  const unlocked = validChapter
    ? await isChapterUnlocked(userId, chapterId)
    : false;

  // Load questions + attempt count + the badge name for the reward preview.
  let body: React.ReactNode;
  if (!validChapter || !chapterMeta) {
    body = (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
        That chapter doesn&apos;t exist.{" "}
        <Link href="/learn" className="text-primary hover:underline">
          Back to the chapter map
        </Link>
        .
      </div>
    );
  } else if (!unlocked) {
    const prev = CHAPTERS.find((c) => c.id === chapterMeta.unlockedBy);
    body = (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="text-3xl">🔒</div>
        <h1 className="mt-2 text-lg font-semibold">{chapterMeta.name} is locked</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Clear the {prev?.name ?? "previous chapter"} Boss Level to unlock this
          chapter.
        </p>
        {prev && (
          <Link
            href={`/boss/${prev.id}`}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Go to {prev.name} Boss →
          </Link>
        )}
      </div>
    );
  } else {
    const { categoryName, questions } = await loadBossQuestions(chapterId);
    const attemptsUsed =
      userId != null ? await attemptsToday(userId, chapterId) : 0;

    // Reward-preview badge name: this chapter's boss-clear badge.
    const byChapter = await bossBadgeByChapter();
    const badgeId = byChapter.get(chapterId);
    let badgeName: string | null = null;
    if (badgeId != null) {
      const [b] = await db
        .select({ name: badges.name })
        .from(badges)
        .where(eq(badges.id, badgeId))
        .limit(1);
      badgeName = b?.name ?? null;
    }

    body = (
      <BossEntry
        chapter={chapterId}
        chapterName={chapterMeta.name ?? categoryName ?? "Boss Level"}
        questions={questions}
        badgeName={badgeName}
        attemptsUsed={attemptsUsed}
        isGuest={isGuest}
      />
    );
  }

  return (
    <>
      {isGuest && <GuestBanner />}
      <Nav isGuest={isGuest} xp={xp} username={session?.user?.username} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{body}</main>
    </>
  );
}
