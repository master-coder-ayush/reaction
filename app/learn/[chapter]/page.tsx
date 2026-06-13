import Link from "next/link";
import { auth } from "@/auth";
import { Nav } from "@/components/Nav";
import { GuestBanner } from "@/components/GuestBanner";
import { ReactionTree } from "@/components/ReactionTree";
import { loadTree } from "@/lib/tree";
import { loadChapterProgress, loadLoggedInDashboard } from "@/lib/dashboard";
import { isChapterUnlocked } from "@/lib/chapters";
import { CHAPTERS, reactionColorVar } from "@/lib/constants";

// Chapter overview (Sprint 6 §6.3–6.4). Route: /learn/[chapter].
// Shows the chapter title + description, the interactive Visual Reaction Tree,
// the module selection (Modules 1, 2, 4 + a Boss Level button when eligible),
// and progress (X/Y reactions mastered). The reaction tree is public — guests
// view everything without auth.

// Edge color legend (PLAN.md §"Color Coding"). Static reference shown under the
// tree so students can read the color semantics.
const LEGEND: { label: string; color: string }[] = [
  { label: "Oxidation", color: "red" },
  { label: "Reduction", color: "green" },
  { label: "Addition", color: "blue" },
  { label: "Elimination", color: "orange" },
  { label: "Substitution", color: "purple" },
  { label: "Nucleophilic", color: "teal" },
  { label: "Electrophilic", color: "yellow" },
];

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
      <>
        {isGuest && <GuestBanner />}
        <Nav isGuest={isGuest} username={session?.user?.username} />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
            That chapter doesn&apos;t exist.{" "}
            <Link href="/learn" className="text-primary hover:underline">
              Back to the chapter map
            </Link>
            .
          </div>
        </main>
      </>
    );
  }

  const tree = await loadTree(chapterId);

  let xp = 0;
  let mastered = 0;
  let total = 0;
  let bossEligible = false;
  if (userId != null) {
    const [dash, prog] = await Promise.all([
      loadLoggedInDashboard(userId),
      loadChapterProgress(userId),
    ]);
    xp = dash.xp;
    const cp = prog.chapterProgress[chapterId];
    mastered = cp?.mastered ?? 0;
    total = cp?.total ?? 0;
    bossEligible = await isChapterUnlocked(userId, chapterId);
  } else {
    // Guests can attempt boss levels (result not saved) and aren't gated.
    bossEligible = true;
  }

  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const bossReady = total > 0 && mastered >= total;

  return (
    <>
      {isGuest && <GuestBanner />}
      <Nav isGuest={isGuest} xp={xp} username={session?.user?.username} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link
          href="/learn"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Chapter Map
        </Link>

        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {chapterMeta.name}
            </h1>
            {tree.categoryName && (
              <p className="text-sm text-muted-foreground">
                Class {chapterMeta.classLevel} · Organic Chemistry
              </p>
            )}
          </div>
          {bossReady && (
            <span className="animate-pulse rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600">
              ⚔️ Boss Level Ready
            </span>
          )}
        </div>

        {/* Progress (logged-in). */}
        {userId != null && total > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {mastered}/{total} reactions mastered
              </span>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
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
            className="inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted"
          >
            📋 Conversion Chart (Study Aid)
          </Link>
        </div>

        {/* Reaction tree. */}
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-bold tracking-tight">
            Reaction Tree
          </h2>
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
            />
            <ModuleCard
              href={`/practice/${chapterId}/module-2`}
              icon="🏷️"
              title="Module 2 · Name the Reaction"
              desc="Identify the named reaction from the equation."
            />
            <ModuleCard
              href={`/practice/${chapterId}/module-3`}
              icon="🧩"
              title="Module 3 · Drag & Drop"
              desc="Label the mechanism by dragging the pieces."
            />
            <ModuleCard
              href={`/practice/${chapterId}/module-4`}
              icon="🧭"
              title="Module 4 · Pathway Challenge"
              desc="Follow a multi-step conversion, step by step."
            />
            <ModuleCard
              href={`/boss/${chapterId}`}
              icon="⚔️"
              title="Boss Level"
              desc={
                bossEligible
                  ? "20 questions, 10 minutes. Clear it to advance."
                  : "Clear the previous chapter to unlock."
              }
              disabled={!bossEligible}
              pulse={bossReady}
            />
          </div>
        </section>
      </main>
    </>
  );
}

function ModuleCard({
  href,
  icon,
  title,
  desc,
  disabled = false,
  pulse = false,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  disabled?: boolean;
  pulse?: boolean;
}) {
  const inner = (
    <div
      className={`flex h-full items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm transition-colors ${
        disabled
          ? "border-border opacity-60"
          : "border-border hover:border-primary"
      } ${pulse ? "animate-pulse border-amber-400" : ""}`}
    >
      <span className="text-2xl" aria-hidden>
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
  if (disabled) return inner;
  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}
