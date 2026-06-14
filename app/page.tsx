export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your Level Up Chemistry dashboard — daily streak, XP progress, reaction of the day, and quick access to all practice modules.",
  openGraph: {
    title: "Level Up Chemistry — Master Organic Chemistry",
    description:
      "Free gamified Organic Chemistry practice for Class 11 & 12. Earn XP, unlock reaction cards, tackle boss levels and escape rooms.",
  },
  alternates: {
    canonical: "https://levelupchemistry.vercel.app",
  },
};
import {
  Sparkles,
  GraduationCap,
  Zap,
  KeyRound,
  Layers,
  Trophy,
  Flame,
  Star,
  TrendingUp,
  BookOpen,
  CalendarCheck,
  ArrowRight,
  Lock,
  Share2,
} from "lucide-react";
import { auth } from "@/auth";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { SectionHeader } from "@/components/ui/section-header";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { LevelUpToast } from "@/components/LevelUpToast";
import { StreakCard } from "@/components/StreakCard";
import { XPProgressBar } from "@/components/XPProgressBar";
import { ReactionOfTheDay } from "@/components/ReactionOfTheDay";
import { LeaderboardRankChip } from "@/components/LeaderboardRankChip";
import { ContinueCard } from "@/components/ContinueCard";
import { ChapterMap } from "@/components/ChapterMap";
import { ProfileShareCard } from "@/components/ProfileShareCard";
import { DashboardLeaderboard } from "@/components/DashboardLeaderboard";
import { loadDailyChallenge, loadLoggedInDashboard } from "@/lib/dashboard";
import { ensureLeaderboardSnapshot, loadLeaderboard } from "@/lib/leaderboard";

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
  if (userId != null) await ensureLeaderboardSnapshot(userId);
  const weekly = await loadLeaderboard("weekly", "all", userId, 3);

  const displayName = session?.user?.name ?? session?.user?.username ?? null;
  // "Continue learning" target: where the logged-in user left off, else /learn.
  const continueHref =
    data != null
      ? `/practice/${data.continueChapter.id}/module-1`
      : "/learn";

  // Colorful quick-action tiles → existing routes (one accent hue each).
  const quickActions = [
    {
      href: continueHref,
      label: "Continue learning",
      desc: data?.continueChapter.name ?? "Pick up a chapter",
      icon: GraduationCap,
      accent: "green" as const,
      chip: "bg-primary-soft text-primary-border",
    },
    {
      href: "/timed",
      label: "Timed Challenge",
      desc: "60-second burst",
      icon: Zap,
      accent: "orange" as const,
      chip: "bg-warn-soft text-warn-border",
    },
    {
      href: "/escape-room",
      label: "Escape Room",
      desc: "Beat the clock",
      icon: KeyRound,
      accent: "purple" as const,
      chip: "bg-accent-soft text-accent-border",
    },
    {
      href: "/cards",
      label: "Reaction Cards",
      desc: "Your collection",
      icon: Layers,
      accent: "pink" as const,
      chip: "bg-pink-soft text-pink-border",
    },
  ];

  return (
    <AppShell
      isGuest={isGuest}
      xp={data?.xp ?? 0}
      username={session?.user?.username}
    >
      <LevelUpToast />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-6">
        {!isGuest && welcome === "1" && (
          <WelcomeBanner
            name={session!.user.name ?? session!.user.username}
            transferredXp={data?.xp ?? 0}
          />
        )}

        {/* Gradient welcome banner */}
        <section className="fade-rise gradient-brand shadow-soft-lg relative overflow-hidden rounded-2xl p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur sm:inline-flex">
              <Sparkles className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {isGuest
                  ? "Welcome, guest!"
                  : `Welcome back, ${displayName ?? "chemist"}!`}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-white/90 sm:text-base">
                {isGuest
                  ? "Explore reactions, play challenges, and master organic chemistry — no sign-up needed."
                  : "Ready to level up? Keep your streak alive and conquer the next reaction."}
              </p>
              {isGuest && (
                <Link
                  href="/signup"
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-extrabold text-primary-border shadow-soft transition hover:-translate-y-0.5"
                >
                  Create your free account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <SectionHeader
            icon={<Sparkles className="h-5 w-5 text-accent" />}
            title="Quick actions"
            subtitle="Jump straight into a mode"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map(({ href, label, desc, icon: Icon, accent, chip }) => (
              <Link key={href} href={href} className="group">
                <Card accent={accent} hover className="h-full">
                  <span className={`icon-chip ${chip}`} aria-hidden>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-extrabold tracking-tight">{label}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {desc}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Learning statistics */}
        <section>
          <SectionHeader
            icon={<TrendingUp className="h-5 w-5 text-primary" />}
            title="Learning statistics"
            subtitle="Your progress at a glance"
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              tone="green"
              icon={<Star className="h-5 w-5" />}
              label="Total XP"
              value={(data?.xp ?? 0).toLocaleString()}
            />
            <StatCard
              tone="blue"
              icon={<TrendingUp className="h-5 w-5" />}
              label="Level"
              value={data?.level ?? 1}
            />
            <StatCard
              tone="orange"
              icon={<Flame className="h-5 w-5" />}
              label="Day streak"
              value={data?.streakCurrent ?? 0}
            />
            <StatCard
              tone="amber"
              icon={<Trophy className="h-5 w-5" />}
              label="Weekly rank"
              value={data?.weeklyRank != null ? `#${data.weeklyRank}` : "—"}
            />
          </div>
        </section>

        {/* Daily challenge / progress / streak / leaderboard */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / main column */}
          <div className="space-y-6 lg:col-span-2">
            {!isGuest && data && <XPProgressBar xp={data.xp} />}

            <div>
              <SectionHeader
                icon={<CalendarCheck className="h-5 w-5 text-warning" />}
                title="Daily challenge"
                subtitle="Today's Reaction of the Day"
              />
              <ReactionOfTheDay
                challenge={daily.challenge}
                completed={daily.completed}
                bonusXp={daily.bonusXp}
                isGuest={isGuest}
              />
            </div>

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
        <section>
          <SectionHeader
            icon={<BookOpen className="h-5 w-5 text-secondary" />}
            title="Chapters"
            subtitle="Work through the syllabus, chapter by chapter"
          />
          <ChapterMap
            isGuest={isGuest}
            progress={data?.chapterProgress}
            unlocked={data?.unlocked}
          />
        </section>

        {/* Profile share section */}
        <section>
          <SectionHeader
            icon={<Share2 className="h-5 w-5 text-accent" />}
            title="Share your profile"
            subtitle="Show off your chemistry progress"
          />
          {!isGuest && session?.user?.username ? (
            <ProfileShareCard username={session.user.username} />
          ) : (
            <div className="card-soft p-4 flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Lock className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground">
                  Sign up to get your unique shareable profile link
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track your progress and share it with friends
                </p>
              </div>
              <Link
                href="/signup"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
              >
                Sign up
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </main>
    </AppShell>
  );
}
