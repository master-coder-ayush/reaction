"use client";

import { useEffect, useState } from "react";
import { GUEST_CORRECT_IDS_KEY } from "@/lib/constants";

export type ModuleTotals = {
  /** All reaction ids in this chapter (Module 1). */
  reactionIds: number[];
  /** Named reaction ids in this chapter (Module 2). */
  namedReactionIds: number[];
  /** Total mechanism count (Module 3 — no per-reaction id tracking). */
  mechanismTotal: number;
  /** Total pathway count (Module 4 — no per-pathway id tracking). */
  pathwayTotal: number;
};

function readCorrectIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(GUEST_CORRECT_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((n): n is number => typeof n === "number"));
  } catch {
    return new Set();
  }
}

function Bar({ done, total, label }: { done: number; total: number; label: string }) {
  if (total === 0) return null;
  const pct = Math.round((done / total) * 100);
  const complete = pct === 100;
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${complete ? "bg-primary" : "bg-primary/60"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Client component — reads guest correct ids from localStorage and renders
 * per-module progress bars for the chapter overview page.
 */
export function GuestModuleProgress({ totals }: { totals: ModuleTotals }) {
  const [correctIds, setCorrectIds] = useState<Set<number> | null>(null);

  useEffect(() => {
    setCorrectIds(readCorrectIds());
  }, []);

  // Avoid SSR/hydration mismatch — render nothing until localStorage is read.
  if (correctIds === null) return null;

  const mod1Done = totals.reactionIds.filter((id) => correctIds.has(id)).length;
  const mod2Done = totals.namedReactionIds.filter((id) => correctIds.has(id)).length;

  return (
    <div className="space-y-0">
      {/* Module 1 */}
      {totals.reactionIds.length > 0 && (
        <Bar
          done={mod1Done}
          total={totals.reactionIds.length}
          label={`${mod1Done} / ${totals.reactionIds.length} reactions correct`}
        />
      )}
      {/* Module 2 */}
      {totals.namedReactionIds.length > 0 && (
        <Bar
          done={mod2Done}
          total={totals.namedReactionIds.length}
          label={`${mod2Done} / ${totals.namedReactionIds.length} named reactions correct`}
        />
      )}
      {/* Module 3 — no per-reaction tracking for guests */}
      {totals.mechanismTotal > 0 && (
        <p className="text-[10px] text-muted-foreground mt-1">
          {totals.mechanismTotal} mechanism{totals.mechanismTotal !== 1 ? "s" : ""} available
        </p>
      )}
      {/* Module 4 — no per-pathway tracking for guests */}
      {totals.pathwayTotal > 0 && (
        <p className="text-[10px] text-muted-foreground mt-1">
          {totals.pathwayTotal} pathway{totals.pathwayTotal !== 1 ? "s" : ""} available
        </p>
      )}
    </div>
  );
}
