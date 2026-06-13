import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userStats } from "@/db/schema";

// ---------------------------------------------------------------------------
// Streak logic (PLAN.md §5 "Streaks", Sprint 2 §2.6)
//
//  - Completing ≥1 reaction per calendar day keeps the streak alive.
//  - Same-day repeat → no change.
//  - Yesterday → streak += 1.
//  - Older gap → consume a streak freeze if available, else reset to 1.
//  - Earn a freeze at each 7-day milestone (capped at MAX_FREEZES).
// ---------------------------------------------------------------------------

export const MAX_FREEZES = 2;
export const STREAK_MILESTONES = [7, 30, 100] as const;

/** A calendar day as `YYYY-MM-DD` (matches the `date` column format). */
export type DateString = string;

/** Today as a `YYYY-MM-DD` string in the server's local calendar. */
export function todayString(now: Date = new Date()): DateString {
  return toDateString(now);
}

function toDateString(d: Date): DateString {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole-day difference `a − b` (positive when `a` is later). */
export function dayDiff(a: DateString, b: DateString): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const aMs = Date.parse(`${a}T00:00:00Z`);
  const bMs = Date.parse(`${b}T00:00:00Z`);
  return Math.round((aMs - bMs) / msPerDay);
}

export type StreakState = {
  streakCurrent: number;
  streakLongest: number;
  streakFreezeCount: number;
  lastActivityDate: DateString | null;
};

export type StreakOutcome = StreakState & {
  /** What happened, for the dashboard / toasts. */
  status: "unchanged" | "incremented" | "freeze_used" | "reset" | "started";
  /** A milestone reached on this update (7 / 30 / 100), if any. */
  milestoneReached: number | null;
  /** True if this update granted a streak freeze. */
  freezeAwarded: boolean;
};

/**
 * Pure transition function — given the prior streak state and today's date,
 * compute the next state. No DB access, so it's trivially testable and shared
 * by the live updater below.
 */
export function nextStreakState(
  prev: StreakState,
  today: DateString = todayString()
): StreakOutcome {
  const last = prev.lastActivityDate;

  // First-ever activity, or no recorded activity yet.
  if (!last) {
    return award({
      ...prev,
      streakCurrent: 1,
      streakLongest: Math.max(prev.streakLongest, 1),
      lastActivityDate: today,
      status: "started",
    });
  }

  const diff = dayDiff(today, last);

  // Already counted today.
  if (diff <= 0) {
    return {
      ...prev,
      status: "unchanged",
      milestoneReached: null,
      freezeAwarded: false,
    };
  }

  // Consecutive day → extend.
  if (diff === 1) {
    const streakCurrent = prev.streakCurrent + 1;
    return award({
      ...prev,
      streakCurrent,
      streakLongest: Math.max(prev.streakLongest, streakCurrent),
      lastActivityDate: today,
      status: "incremented",
    });
  }

  // Gap of 2+ days. Try to spend a freeze to bridge it.
  if (prev.streakFreezeCount > 0) {
    const streakCurrent = prev.streakCurrent + 1;
    return award({
      ...prev,
      streakCurrent,
      streakLongest: Math.max(prev.streakLongest, streakCurrent),
      streakFreezeCount: prev.streakFreezeCount - 1,
      lastActivityDate: today,
      status: "freeze_used",
    });
  }

  // No freeze — streak is broken, start a new one at 1.
  return award({
    ...prev,
    streakCurrent: 1,
    streakLongest: Math.max(prev.streakLongest, 1),
    lastActivityDate: today,
    status: "reset",
  });
}

/**
 * Apply milestone rewards to a freshly-advanced streak: every 7-day milestone
 * grants a freeze (capped), and 7/30/100 are flagged for badge triggers.
 */
function award(
  s: StreakState & { status: StreakOutcome["status"] }
): StreakOutcome {
  let freezeAwarded = false;
  let streakFreezeCount = s.streakFreezeCount;

  // 7-day milestone freeze: only on the exact day a multiple of 7 is hit.
  if (
    (s.status === "incremented" || s.status === "freeze_used") &&
    s.streakCurrent > 0 &&
    s.streakCurrent % 7 === 0 &&
    streakFreezeCount < MAX_FREEZES
  ) {
    streakFreezeCount += 1;
    freezeAwarded = true;
  }

  const milestoneReached =
    STREAK_MILESTONES.find((m) => m === s.streakCurrent) ?? null;

  return {
    streakCurrent: s.streakCurrent,
    streakLongest: s.streakLongest,
    streakFreezeCount,
    lastActivityDate: s.lastActivityDate,
    status: s.status,
    milestoneReached,
    freezeAwarded,
  };
}

/**
 * Read the user's current streak state and report what the next update *would*
 * be without writing — used by the dashboard to render "Streak lost 😔" /
 * freeze prompts on load. (The actual write happens via `checkAndUpdateStreak`
 * when a reaction is answered.)
 */
export function projectBrokenStreak(
  prev: StreakState,
  today: DateString = todayString()
): { broken: boolean; canFreeze: boolean } {
  const last = prev.lastActivityDate;
  if (!last) return { broken: false, canFreeze: false };
  const diff = dayDiff(today, last);
  // diff 0 = today, 1 = streak still alive (acted yesterday). 2+ = at risk.
  const broken = diff >= 2 && prev.streakCurrent > 0;
  return { broken, canFreeze: broken && prev.streakFreezeCount > 0 };
}

/**
 * Live streak updater — call after any reaction is answered. Loads the user's
 * stats, computes the transition, and persists it. Returns the outcome so the
 * caller can fire milestone badges / toasts.
 *
 * NOTE: requires a live DB connection (DATABASE_URL). The pure helpers above
 * can be used/tested without one.
 */
export async function checkAndUpdateStreak(
  userId: number,
  today: DateString = todayString()
): Promise<StreakOutcome> {
  const [stats] = await db
    .select({
      streakCurrent: userStats.streakCurrent,
      streakLongest: userStats.streakLongest,
      streakFreezeCount: userStats.streakFreezeCount,
      lastActivityDate: userStats.lastActivityDate,
    })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) {
    throw new Error(`No user_stats row for user ${userId}`);
  }

  const outcome = nextStreakState(
    {
      streakCurrent: stats.streakCurrent,
      streakLongest: stats.streakLongest,
      streakFreezeCount: stats.streakFreezeCount,
      lastActivityDate: stats.lastActivityDate,
    },
    today
  );

  if (outcome.status !== "unchanged") {
    await db
      .update(userStats)
      .set({
        streakCurrent: outcome.streakCurrent,
        streakLongest: outcome.streakLongest,
        streakFreezeCount: outcome.streakFreezeCount,
        lastActivityDate: outcome.lastActivityDate,
      })
      .where(eq(userStats.userId, userId));
  }

  return outcome;
}
