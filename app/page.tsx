import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { LevelUpToast } from "@/components/LevelUpToast";
import { StreakCard } from "@/components/StreakCard";
import { XPProgressBar } from "@/components/XPProgressBar";
import { ReactionOfTheDay } from "@/components/ReactionOfTheDay";
import { LeaderboardRankChip } from "@/components/LeaderboardRankChip";
import { ContinueCard } from "@/components/ContinueCard";
import { ChapterMap } from "@/components/ChapterMap";
import { DashboardLeaderboard } from "@/components/DashboardLeaderboard";
import { loadDailyChallenge, loadLoggedInDashboard } from "@/lib/dashboard";
import { loadLeaderboard } from "@/lib/leaderboard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const session = await auth();
  const { welcome } = await searchParams;
  const isGuest = !session?.user?.id;
  const userId = isGuest ? null : Number(session!.user.id);

  // Same layout, two data shapes (Sprint 2 §2.1).
  const daily = await loadDailyChallenge(userId);
  const data = userId != null ? await loadLoggedInDashboard(userId) : null;

  // Dashboard leaderboard widget (Sprint 4 §4.5): top 3 weekly + own row.
  const weekly = await loadLeaderboard("weekly", "all", userId, 3);

  return (
    <>
      <LevelUpToast />
      {isGuest && <GuestBanner />}
      <Nav
        isGuest={isGuest}
        xp={data?.xp ?? 0}
        username={session?.user?.username}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {!isGuest && welcome === "1" && (
          <div className="mb-6">
            <WelcomeBanner
              name={session!.user.name ?? session!.user.username}
              transferredXp={data?.xp ?? 0}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / main column */}
          <div className="space-y-6 lg:col-span-2">
            {!isGuest && data && <XPProgressBar xp={data.xp} />}

            <ReactionOfTheDay
              challenge={daily.challenge}
              completed={daily.completed}
              bonusXp={daily.bonusXp}
              isGuest={isGuest}
            />

            {!isGuest && data && (
              <ContinueCard
                chapterId={data.continueChapter.id}
                chapterName={data.continueChapter.name}
              />
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {!isGuest && data ? (
              <>
                <StreakCard
                  streakCurrent={data.streakCurrent}
                  streakFreezeCount={data.streakFreezeCount}
                  doneToday={data.doneToday}
                  broken={data.broken}
                  canFreeze={data.canFreeze}
                  atRisk={
                    !data.doneToday &&
                    data.streakCurrent > 0 &&
                    new Date().getHours() >= 18
                  }
                />
                <div>
                  <LeaderboardRankChip rank={data.weeklyRank} isGuest={false} />
                </div>
                <DashboardLeaderboard
                  top={weekly.rows}
                  me={weekly.me}
                  isGuest={false}
                />
              </>
            ) : (
              <>
                {/* Guest: streak hidden; leaderboard replaced with sign-up prompt. */}
                <div>
                  <LeaderboardRankChip isGuest />
                </div>
                <DashboardLeaderboard top={weekly.rows} me={null} isGuest />
              </>
            )}
          </div>
        </div>

        {/* Chapter map: visible and fully clickable for guests (nothing locked). */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Chapters</h2>
          <ChapterMap
            isGuest={isGuest}
            progress={data?.chapterProgress}
            unlocked={data?.unlocked}
          />
        </section>
      </main>
    </>
  );
}
