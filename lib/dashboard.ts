import { and, asc, count, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  dailyChallenges,
  reactions,
  reactionTypes,
  userProgress,
  userStats,
} from "@/db/schema";
import { CHAPTERS } from "@/lib/constants";
import { unlockedChapters } from "@/lib/chapters";
import { projectBrokenStreak, todayString } from "@/lib/streak";
import type { DailyChallenge } from "@/components/ReactionOfTheDay";
import type { ChapterProgress } from "@/components/ChapterMap";

// ---------------------------------------------------------------------------
// Dashboard data loading. Each loader is wrapped so a missing DB connection
// (DATABASE_URL unset / unreachable) degrades gracefully to a guest-like empty
// state rather than crashing the page — the live DB wiring lands separately.
// ---------------------------------------------------------------------------

export type LoggedInDashboard = {
  xp: number;
  level: number;
  streakCurrent: number;
  streakFreezeCount: number;
  doneToday: boolean;
  broken: boolean;
  canFreeze: boolean;
  weeklyRank: number | null;
  chapterProgress: Record<number, ChapterProgress>;
  unlocked: Set<number>;
  continueChapter: { id: number; name: string };
};

export type DailyChallengeData = {
  challenge: DailyChallenge | null;
  bonusXp: number;
  completed: boolean;
};

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("dashboard load failed:", err);
    return fallback;
  }
}

/** Today's Reaction of the Day, plus whether this user has claimed the bonus. */
export async function loadDailyChallenge(
  userId: number | null
): Promise<DailyChallengeData> {
  return safe(async () => {
    const today = todayString();
    const [row] = await db
      .select({
        reactionId: reactions.id,
        name: reactions.name,
        questionText: reactions.questionText,
        equationText: reactions.equationText,
        difficulty: reactions.difficulty,
        reactionTypeName: reactionTypes.name,
        reactionTypeColor: reactionTypes.color,
      })
      .from(dailyChallenges)
      .innerJoin(reactions, eq(dailyChallenges.reactionId, reactions.id))
      .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
      .where(eq(dailyChallenges.challengeDate, today))
      .limit(1);

    if (!row) return { challenge: null, bonusXp: 0, completed: false };

    let completed = false;
    if (userId != null) {
      const [progress] = await db
        .select({ dailyBonus: userProgress.dailyBonus })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.reactionId, row.reactionId)
          )
        )
        .limit(1);
      completed = !!progress?.dailyBonus;
    }

    // First correct attempt = 2× the difficulty XP.
    const difficultyXp = row.difficulty >= 3 ? 30 : row.difficulty === 2 ? 20 : 10;
    return { challenge: row, bonusXp: difficultyXp * 2, completed };
  }, { challenge: null, bonusXp: 0, completed: false });
}

/** Full logged-in dashboard payload. */
export async function loadLoggedInDashboard(
  userId: number
): Promise<LoggedInDashboard> {
  const today = todayString();

  return safe(
    async () => {
      const [stats] = await db
        .select()
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);

      const xp = stats?.xp ?? 0;
      const level = stats?.level ?? 1;
      const streakCurrent = stats?.streakCurrent ?? 0;
      const streakFreezeCount = stats?.streakFreezeCount ?? 0;
      const lastActivityDate = stats?.lastActivityDate ?? null;
      const doneToday = lastActivityDate === today;

      const { broken, canFreeze } = projectBrokenStreak(
        {
          streakCurrent,
          streakLongest: stats?.streakLongest ?? 0,
          streakFreezeCount,
          lastActivityDate,
        },
        today
      );

      // Per-chapter mastery, joined via category → reaction. Chapters map 1:1
      // onto categories by order for now (Sprint 5 formalizes chapter rows).
      const masteryRows = await db
        .select({
          categoryId: reactions.categoryId,
          total: count(reactions.id),
          mastered: sql<number>`count(*) filter (where ${userProgress.mastered})::int`,
        })
        .from(reactions)
        .leftJoin(
          userProgress,
          and(
            eq(userProgress.reactionId, reactions.id),
            eq(userProgress.userId, userId)
          )
        )
        .groupBy(reactions.categoryId);

      const catOrder = await db
        .select({ id: categories.id, orderIndex: categories.orderIndex })
        .from(categories)
        .orderBy(asc(categories.orderIndex));

      // Build chapterId → progress using category order_index as the chapter id.
      const chapterProgress: Record<number, ChapterProgress> = {};
      for (const cat of catOrder) {
        const m = masteryRows.find((r) => r.categoryId === cat.id);
        chapterProgress[cat.orderIndex] = {
          total: m?.total ?? 0,
          mastered: m?.mastered ?? 0,
        };
      }

      // Unlock logic (Sprint 5 §5.2): chapter 1 always unlocked; each later
      // chapter unlocks once the previous chapter's boss badge is earned.
      const unlocked = await unlockedChapters(userId);

      // "Continue where you left off": first unlocked chapter not yet complete.
      const continueChapter =
        CHAPTERS.find((c) => {
          if (!unlocked.has(c.id)) return false;
          const p = chapterProgress[c.id];
          return !p || p.total === 0 || p.mastered < p.total;
        }) ?? CHAPTERS[0];

      const weeklyRank = await loadWeeklyRank(userId, xp);

      return {
        xp,
        level,
        streakCurrent,
        streakFreezeCount,
        doneToday,
        broken,
        canFreeze,
        weeklyRank,
        chapterProgress,
        unlocked,
        continueChapter: { id: continueChapter.id, name: continueChapter.name },
      };
    },
    {
      xp: 0,
      level: 1,
      streakCurrent: 0,
      streakFreezeCount: 0,
      doneToday: false,
      broken: false,
      canFreeze: false,
      weeklyRank: null,
      chapterProgress: {},
      unlocked: new Set<number>([1]),
      continueChapter: { id: CHAPTERS[0].id, name: CHAPTERS[0].name },
    }
  );
}

/**
 * Live weekly rank: count of users with strictly more XP, + 1. (Leaderboard
 * snapshots arrive in Sprint 4; this is a good-enough live ranking off
 * user_stats.)
 */
async function loadWeeklyRank(
  userId: number,
  xp: number
): Promise<number | null> {
  return safe(async () => {
    const [{ ahead }] = await db
      .select({ ahead: count() })
      .from(userStats)
      .where(gt(userStats.xp, xp));
    return ahead + 1;
  }, null);
}

/** Chapter progress for the /learn page (independent of the dashboard). */
export async function loadChapterProgress(
  userId: number
): Promise<{
  chapterProgress: Record<number, ChapterProgress>;
  unlocked: Set<number>;
}> {
  const data = await loadLoggedInDashboard(userId);
  return { chapterProgress: data.chapterProgress, unlocked: data.unlocked };
}
