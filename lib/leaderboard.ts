import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { leaderboardSnapshots, userStats, users } from "@/db/schema";
import { LEVELS } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Leaderboard (Sprint 4 §4.2). Strategy: a lightweight "cron-less" snapshot —
// on each xp/award we upsert the caller's row into the daily / weekly / monthly
// snapshot for the current period (see upsertLeaderboardSnapshots). Reads rank
// by XP within a period. All-Time ranks straight off user_stats.
// ---------------------------------------------------------------------------

export type Period = "daily" | "weekly" | "monthly" | "all-time";
export type ClassFilter = "all" | "11" | "12";

export const PERIODS: readonly Period[] = [
  "daily",
  "weekly",
  "monthly",
  "all-time",
];

const PERIOD_TYPE: Record<Exclude<Period, "all-time">, string> = {
  daily: "daily",
  weekly: "weekly",
  monthly: "monthly",
};

/** ISO-week number (1-53) for a date, per the ISO-8601 Thursday rule. */
function isoWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // Mon=1..Sun=7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return { year: date.getUTCFullYear(), week };
}

/** The period key (e.g. 2026-06-13 / 2026-W24 / 2026-06) for a date. */
export function periodKey(
  type: Exclude<Period, "all-time">,
  now: Date = new Date()
): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  switch (type) {
    case "daily":
      return `${y}-${m}-${d}`;
    case "weekly": {
      const { year, week } = isoWeek(now);
      return `${year}-W${String(week).padStart(2, "0")}`;
    }
    case "monthly":
      return `${y}-${m}`;
  }
}

/**
 * Upsert the user's snapshot rows for today's daily / weekly / monthly periods
 * with their latest XP total. Called on each xp/award. (Rank is left null here —
 * it's computed on read, which keeps writes cheap.)
 */
export async function upsertLeaderboardSnapshots(
  userId: number,
  xp: number,
  now: Date = new Date()
): Promise<void> {
  const rows = (["daily", "weekly", "monthly"] as const).map((type) => ({
    userId,
    xp,
    periodType: PERIOD_TYPE[type],
    periodKey: periodKey(type, now),
  }));

  for (const row of rows) {
    await db
      .insert(leaderboardSnapshots)
      .values(row)
      .onConflictDoUpdate({
        target: [
          leaderboardSnapshots.userId,
          leaderboardSnapshots.periodType,
          leaderboardSnapshots.periodKey,
        ],
        set: { xp: row.xp, updatedAt: new Date() },
      });
  }
}

export type LeaderboardRow = {
  userId: number;
  rank: number;
  username: string;
  classLevel: string;
  xp: number;
  level: number;
  levelTitle: string;
  streak: number;
};

export type LeaderboardResult = {
  rows: LeaderboardRow[];
  /** The caller's own row, even if outside the top N (null for guests). */
  me: LeaderboardRow | null;
};

const levelTitle = (level: number) =>
  LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1].title;

/**
 * Load the leaderboard for a period + class filter: the top `limit` rows plus
 * the caller's own row (ranked even if outside the top). Daily/weekly/monthly
 * read from snapshots; all-time reads from user_stats.
 */
export async function loadLeaderboard(
  period: Period,
  classFilter: ClassFilter,
  callerId: number | null,
  limit = 50
): Promise<LeaderboardResult> {
  if (period === "all-time") {
    return loadAllTime(classFilter, callerId, limit);
  }

  const type = PERIOD_TYPE[period];
  const key = periodKey(period);

  const classCond =
    classFilter === "all" ? undefined : eq(users.classLevel, classFilter);

  const base = db
    .select({
      userId: users.id,
      username: users.username,
      classLevel: users.classLevel,
      xp: leaderboardSnapshots.xp,
      level: userStats.level,
      streak: userStats.streakCurrent,
    })
    .from(leaderboardSnapshots)
    .innerJoin(users, eq(leaderboardSnapshots.userId, users.id))
    .innerJoin(userStats, eq(userStats.userId, users.id))
    .where(
      and(
        eq(leaderboardSnapshots.periodType, type),
        eq(leaderboardSnapshots.periodKey, key),
        classCond
      )
    )
    .orderBy(desc(leaderboardSnapshots.xp));

  const all = await base;
  return rankAndSlice(all, callerId, limit);
}

async function loadAllTime(
  classFilter: ClassFilter,
  callerId: number | null,
  limit: number
): Promise<LeaderboardResult> {
  const classCond =
    classFilter === "all" ? undefined : eq(users.classLevel, classFilter);

  const all = await db
    .select({
      userId: users.id,
      username: users.username,
      classLevel: users.classLevel,
      xp: userStats.xp,
      level: userStats.level,
      streak: userStats.streakCurrent,
    })
    .from(userStats)
    .innerJoin(users, eq(userStats.userId, users.id))
    .where(classCond)
    .orderBy(desc(userStats.xp));

  return rankAndSlice(all, callerId, limit);
}

type RawRow = {
  userId: number;
  username: string;
  classLevel: string;
  xp: number;
  level: number;
  streak: number;
};

/** Assign dense ranks by order, take the top `limit`, and find the caller's row. */
function rankAndSlice(
  all: RawRow[],
  callerId: number | null,
  limit: number
): LeaderboardResult {
  const ranked: LeaderboardRow[] = all.map((r, i) => ({
    ...r,
    rank: i + 1,
    levelTitle: levelTitle(r.level),
  }));

  const rows = ranked.slice(0, limit);
  const me =
    callerId != null ? ranked.find((r) => r.userId === callerId) ?? null : null;

  return { rows, me };
}

/**
 * Ensure the user's leaderboard snapshot rows exist for all current periods.
 * Call this when a user visits the leaderboard and may have XP that was never
 * snapshotted (e.g. awarded before the snapshot logic was in place).
 */
export async function ensureLeaderboardSnapshot(userId: number): Promise<void> {
  const [stats] = await db
    .select({ xp: userStats.xp })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);
  if (!stats || stats.xp <= 0) return;
  await upsertLeaderboardSnapshots(userId, stats.xp).catch(() => {});
}

// ---------------------------------------------------------------------------
// Speed leaderboard (Sprint 7 §7.2). Ranks users by their best Timed Challenge
// score (most correct-in-60s first) off userStats.bestTimedScore.
// ---------------------------------------------------------------------------

export type SpeedLeaderboardRow = {
  userId: number;
  rank: number;
  username: string;
  score: number;
};

export type SpeedLeaderboardResult = {
  rows: SpeedLeaderboardRow[];
  me: SpeedLeaderboardRow | null;
};

export async function loadSpeedLeaderboard(
  callerId: number | null,
  limit = 20
): Promise<SpeedLeaderboardResult> {
  const all = await db
    .select({
      userId: users.id,
      username: users.username,
      score: userStats.bestTimedScore,
    })
    .from(userStats)
    .innerJoin(users, eq(userStats.userId, users.id))
    .where(isNotNull(userStats.bestTimedScore))
    .orderBy(desc(userStats.bestTimedScore));

  const ranked: SpeedLeaderboardRow[] = all.map((r, i) => ({
    userId: r.userId,
    username: r.username,
    score: r.score ?? 0,
    rank: i + 1,
  }));

  const rows = ranked.slice(0, limit);
  const me =
    callerId != null ? ranked.find((r) => r.userId === callerId) ?? null : null;

  return { rows, me };
}

// ---------------------------------------------------------------------------
// Escape Room leaderboard (Sprint 5 §5.5). Ranks users by their best escape time
// (fastest first) — this reads userStats.escapeBestSeconds, which the escape
// completion route keeps as the user's personal best.
// ---------------------------------------------------------------------------

export type EscapeLeaderboardRow = {
  userId: number;
  rank: number;
  username: string;
  seconds: number;
};

export type EscapeLeaderboardResult = {
  rows: EscapeLeaderboardRow[];
  me: EscapeLeaderboardRow | null;
};

export async function loadEscapeLeaderboard(
  callerId: number | null,
  limit = 20
): Promise<EscapeLeaderboardResult> {
  const all = await db
    .select({
      userId: users.id,
      username: users.username,
      seconds: userStats.escapeBestSeconds,
    })
    .from(userStats)
    .innerJoin(users, eq(userStats.userId, users.id))
    .where(isNotNull(userStats.escapeBestSeconds))
    .orderBy(asc(userStats.escapeBestSeconds));

  const ranked: EscapeLeaderboardRow[] = all.map((r, i) => ({
    userId: r.userId,
    username: r.username,
    seconds: r.seconds ?? 0,
    rank: i + 1,
  }));

  const rows = ranked.slice(0, limit);
  const me =
    callerId != null ? ranked.find((r) => r.userId === callerId) ?? null : null;

  return { rows, me };
}
