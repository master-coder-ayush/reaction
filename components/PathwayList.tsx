"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { PathwaySession } from "@/components/PathwaySession";
import { PathwayChain } from "@/components/PathwayChain";
import type { PathwayDTO } from "@/lib/pathway-client";

// ---------------------------------------------------------------------------
// PathwayList (Sprint 6 §6.1). The Module 4 entry: a card per chapter pathway
// ("Convert Start → End", difficulty stars, estimated steps). Selecting one
// opens the step-by-step PathwaySession; finishing returns to the list. Client
// component so it can hold the "which pathway is active" state.
// ---------------------------------------------------------------------------

/** Rough difficulty stars from step count (more steps = harder). */
function stars(stepCount: number): string {
  const n = Math.min(3, Math.max(1, stepCount - 1));
  return "★".repeat(n) + "☆".repeat(3 - n);
}

export function PathwayList({
  pathways,
  completedIds,
  isGuest,
}: {
  pathways: PathwayDTO[];
  /** Pathway ids the user already holds a card for (logged-in). */
  completedIds: number[];
  isGuest: boolean;
}) {
  const [active, setActive] = useState<PathwayDTO | null>(null);
  const completed = useMemo(() => new Set(completedIds), [completedIds]);

  // Every compound name in the chapter — the distractor pool for the session.
  const allCompounds = useMemo(
    () =>
      Array.from(
        new Set(pathways.flatMap((p) => p.steps.map((s) => s.compoundName)))
      ),
    [pathways]
  );

  if (active) {
    return (
      <PathwaySession
        pathway={active}
        allCompounds={allCompounds}
        isGuest={isGuest}
        onExit={() => setActive(null)}
      />
    );
  }

  if (pathways.length === 0) {
    return (
      <div className="card-soft p-6 text-center">
        <div className="text-3xl">🧭</div>
        <h2 className="mt-2 text-lg font-extrabold tracking-tight">No pathways yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This chapter doesn&apos;t have any pathway challenges yet. Check back
          soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {pathways.map((p) => {
        const stepCount = p.steps.length - 1;
        const done = completed.has(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p)}
            className="card-soft p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-soft-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  Convert {p.startCompound} → {p.endCompound}
                </h3>
                {p.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                )}
              </div>
              {done && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary-border">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> Card earned
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-muted-foreground">
              <span
                className="inline-flex items-center gap-0.5 text-warning"
                aria-label="difficulty"
              >
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                {stars(stepCount)}
              </span>
              <span>
                {stepCount} step{stepCount === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-3 overflow-x-auto opacity-80">
              <PathwayChain steps={p.steps} revealed={1} compact />
            </div>
          </button>
        );
      })}
    </div>
  );
}
