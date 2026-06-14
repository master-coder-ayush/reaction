export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Swords, ClipboardList, CheckCircle2 } from "lucide-react";
import { and, count, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { AppShell } from "@/components/AppShell";
import { ReactionTree } from "@/components/ReactionTree";
import { GuestModuleProgress, type ModuleTotals } from "@/components/GuestModuleProgress";
import { loadTree } from "@/lib/tree";
import { loadChapterProgress, loadLoggedInDashboard } from "@/lib/dashboard";
import { CHAPTERS, reactionColorVar } from "@/lib/constants";
import {
  badges,
  categories,
  mechanisms,
  pathwayCards,
  reactionPathways,
  reactions,
  userBadges,
  userProgress,
} from "@/db/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const ch = CHAPTERS.find((c) => c.id === Number(chapter));
  if (!ch) return { title: "Chapter" };
  return {
    title: ch.name,
    description: `Practice ${ch.name} reactions for Class ${ch.classLevel} — explore the reaction tree, track your progress across all 4 modules.`,
    openGraph: {
      title: `${ch.name} · Level Up Chemistry`,
      description: `Master ${ch.name} reactions for Class ${ch.classLevel} Organic Chemistry.`,
    },
  };
}

const LEGEND: { label: string; color: string }[] = [
  { label: "Oxidation", color: "red" },
  { label: "Reduction", color: "green" },
  { label: "Addition", color: "blue" },
  { label: "Elimination", color: "orange" },
  { label: "Substitution", color: "purple" },
  { label: "Nucleophilic", color: "teal" },
  { label: "Electrophilic", color: "yellow" },
];

type ModuleProgress = {
  done: number;
  total: number;
  label: string;
};

export default async function ChapterOverviewPage({
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

  if (!validChapter || !chapterMeta) {
    return (
      <AppShell isGuest={isGuest} username={session?.user?.username}>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          <div className="card-soft p-6 text-center text-sm text-muted-foreground">
            That chapter doesn&apos;t exist.{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Back to the chapter map
            </Link>
            .
          </div>
        </main>
      </AppShell>
    );
  }

  const tree = await loadTree(chapterId);

  // --- Always load totals (needed for guests too) ---
  let moduleTotals: ModuleTotals = {
    reactionIds: [],
    namedReactionIds: [],
    mechanismTotal: 0,
    pathwayTotal: 0,
  };

  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.orderIndex, chapterId))
    .limit(1);

  if (cat) {
    const [allReactions, [{ totalMech }], [{ totalPathways }]] = await Promise.all([
      db
        .select({ id: reactions.id, isNameReaction: reactions.isNameReaction })
        .from(reactions)
        .where(eq(reactions.categoryId, cat.id)),
      db
        .select({ totalMech: count(mechanisms.id) })
        .from(mechanisms)
        .where(eq(mechanisms.categoryId, cat.id)),
      db
        .select({ totalPathways: count(reactionPathways.id) })
        .from(reactionPathways)
        .where(eq(reactionPathways.categoryId, cat.id)),
    ]);

    moduleTotals = {
      reactionIds: allReactions.map((r) => r.id),
      namedReactionIds: allReactions.filter((r) => r.isNameReaction).map((r) => r.id),
      mechanismTotal: totalMech ?? 0,
      pathwayTotal: totalPathways ?? 0,
    };
  }

  // --- Logged-in user specific data ---
  let xp = 0;
  let mastered = 0;
  const total = moduleTotals.reactionIds.length;
  let mod1: ModuleProgress | null = null;
  let mod2: ModuleProgress | null = null;
  let mod3: ModuleProgress | null = null;
  let mod4: ModuleProgress | null = null;
  let bossCleared = false;

  if (userId != null && cat) {
    const [dash, prog] = await Promise.all([
      loadLoggedInDashboard(userId),
      loadChapterProgress(userId),
    ]);
    xp = dash.xp;
    const cp = prog.chapterProgress[chapterId];
    mastered = cp?.mastered ?? 0;

    mod1 = { done: mastered, total, label: `${mastered} / ${total} reactions mastered` };

    const [{ doneNamed }] = await db
      .select({ doneNamed: sql<number>`count(*)::int` })
      .from(userProgress)
      .innerJoin(reactions, eq(userProgress.reactionId, reactions.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(reactions.categoryId, cat.id),
          eq(reactions.isNameReaction, true),
          sql`${userProgress.correctCount} >= 1`
        )
      );

    const t2 = moduleTotals.namedReactionIds.length;
    const d2 = doneNamed ?? 0;
    mod2 = { done: d2, total: t2, label: `${d2} / ${t2} named reactions answered` };

    const t3 = moduleTotals.mechanismTotal;
    mod3 = { done: 0, total: t3, label: t3 > 0 ? `${t3} mechanism${t3 !== 1 ? "s" : ""} available` : "No mechanisms yet" };

    const pathwayIds = (
      await db
        .select({ id: reactionPathways.id })
        .from(reactionPathways)
        .where(eq(reactionPathways.categoryId, cat.id))
    ).map((r) => r.id);

    let completedPathways = 0;
    if (pathwayIds.length > 0) {
      const [{ completed }] = await db
        .select({ completed: sql<number>`count(*)::int` })
        .from(pathwayCards)
        .where(
          and(
            eq(pathwayCards.userId, userId),
            sql`${pathwayCards.pathwayId} = ANY(${sql.raw(`ARRAY[${pathwayIds.join(",")}]`)})`
          )
        );
      completedPathways = completed ?? 0;
    }

    const t4 = moduleTotals.pathwayTotal;
    mod4 = { done: completedPathways, total: t4, label: `${completedPathways} / ${t4} pathways completed` };

    const [bossBadge] = await db
      .select({ id: badges.id })
      .from(badges)
      .where(
        and(
          eq(badges.requirementType, "boss_cleared"),
          eq(badges.requirementValue, chapterId)
        )
      )
      .limit(1);

    if (bossBadge) {
      const [held] = await db
        .select({ badgeId: userBadges.badgeId })
        .from(userBadges)
        .where(
          and(
            eq(userBadges.userId, userId),
            eq(userBadges.badgeId, bossBadge.id)
          )
        )
        .limit(1);
      bossCleared = !!held;
    }
  }

  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const bossReady = !isGuest && total > 0 && mastered >= total;

  return (
    <AppShell isGuest={isGuest} xp={xp} username={session?.user?.username}>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Chapter Map
        </Link>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {chapterMeta.name}
            </h1>
            {tree.categoryName && (
              <p className="text-sm text-muted-foreground">
                Class {chapterMeta.classLevel} · Organic Chemistry
              </p>
            )}
          </div>
          {bossReady && !bossCleared && (
            <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-xs font-bold text-warn-border">
              <Swords className="h-3.5 w-3.5" />
              Boss Level Ready
            </span>
          )}
          {bossCleared && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-border">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Chapter Cleared
            </span>
          )}
        </div>

        {/* Overall chapter progress (logged-in). */}
        {userId != null && total > 0 && (
          <div className="card-soft mt-4 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold">{mastered} / {total} reactions mastered</span>
              <span className="font-semibold text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Study aids. */}
        <div className="mt-4">
          <Link
            href={`/learn/${chapterId}/chart`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-sm font-semibold shadow-soft hover:bg-muted"
          >
            <ClipboardList className="h-4 w-4 text-info" />
            Conversion Chart (Study Aid)
          </Link>
        </div>

        {/* Reaction tree. */}
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-bold tracking-tight">Reaction Tree</h2>
          <ReactionTree tree={tree} />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {LEGEND.map((l) => (
              <span key={l.label} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: reactionColorVar(l.color) }}
                />
                {l.label}
              </span>
            ))}
          </div>
        </section>

        {/* Module selection. */}
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold tracking-tight">Practice</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModuleCard
              href={`/practice/${chapterId}/module-1`}
              icon="🧱"
              title="Module 1 · Build the Reaction"
              desc="Pick the reactant, reagent, and product."
              progress={userId != null ? mod1 : null}
              guestProgress={isGuest ? <GuestModuleProgress totals={{ ...moduleTotals, mechanismTotal: 0, pathwayTotal: 0, namedReactionIds: [] }} /> : null}
            />
            <ModuleCard
              href={`/practice/${chapterId}/module-2`}
              icon="🏷️"
              title="Module 2 · Name the Reaction"
              desc="Identify the named reaction from the equation."
              progress={userId != null ? mod2 : null}
              guestProgress={isGuest ? <GuestModuleProgress totals={{ reactionIds: [], namedReactionIds: moduleTotals.namedReactionIds, mechanismTotal: 0, pathwayTotal: 0 }} /> : null}
            />
            <ModuleCard
              href={`/practice/${chapterId}/module-3`}
              icon="🧩"
              title="Module 3 · Drag & Drop"
              desc="Label the mechanism by dragging the pieces."
              progress={userId != null ? mod3 : null}
              guestProgress={isGuest ? <GuestModuleProgress totals={{ reactionIds: [], namedReactionIds: [], mechanismTotal: moduleTotals.mechanismTotal, pathwayTotal: 0 }} /> : null}
            />
            <ModuleCard
              href={`/practice/${chapterId}/module-4`}
              icon="🧭"
              title="Module 4 · Pathway Challenge"
              desc="Follow a multi-step conversion, step by step."
              progress={userId != null ? mod4 : null}
              guestProgress={isGuest ? <GuestModuleProgress totals={{ reactionIds: [], namedReactionIds: [], mechanismTotal: 0, pathwayTotal: moduleTotals.pathwayTotal }} /> : null}
            />
            <ModuleCard
              href={`/boss/${chapterId}`}
              icon={bossCleared ? "✅" : "⚔️"}
              title="Boss Level"
              desc={
                bossCleared
                  ? "Cleared! Play again to improve your score."
                  : "20 questions, 10 minutes."
              }
              pulse={bossReady && !bossCleared}
              cleared={bossCleared}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function ModuleCard({
  href,
  icon,
  title,
  desc,
  progress,
  guestProgress,
  disabled = false,
  pulse = false,
  cleared = false,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  progress?: ModuleProgress | null;
  guestProgress?: React.ReactNode;
  disabled?: boolean;
  pulse?: boolean;
  cleared?: boolean;
}) {
  const pct =
    progress && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : null;
  const complete = pct === 100;

  const inner = (
    <div
      className={`flex h-full flex-col gap-2 rounded-2xl border bg-card p-4 shadow-sm transition-colors ${
        disabled
          ? "border-border opacity-60"
          : complete || cleared
          ? "border-primary/40 bg-primary-soft/20"
          : "border-border hover:border-primary"
      } ${pulse ? "animate-pulse border-amber-400" : ""}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden>{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
        </div>
        {(complete || cleared) && (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
        )}
      </div>

      {/* Logged-in progress bar */}
      {progress && progress.total > 0 && pct !== null && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">{progress.label}</span>
            <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${complete ? "bg-primary" : "bg-primary/60"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
      {progress && progress.total > 0 && progress.done === 0 && progress.label.includes("available") && (
        <p className="text-[10px] text-muted-foreground">{progress.label}</p>
      )}

      {/* Guest progress (client-rendered from localStorage) */}
      {guestProgress}
    </div>
  );

  if (disabled) return inner;
  return <Link href={href} className="block">{inner}</Link>;
}
