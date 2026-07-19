import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { userProgress, userStats } from "@/db/schema";
import { applyXp, xpForDifficulty } from "@/lib/xp";
import { todayString, checkAndUpdateStreak } from "@/lib/streak";
import { resolveDailyReaction } from "@/lib/daily-reaction";

// GET  /api/daily-challenge   → today's Reaction of the Day (by challenge_date).
// POST /api/daily-challenge   → record a correct first attempt: double XP + streak.

async function loadTodaysChallenge() {
  const today = todayString();
  const row = await resolveDailyReaction(today);
  return { today, row };
}

export async function GET() {
  const { today, row } = await loadTodaysChallenge();

  if (!row) {
    return NextResponse.json(
      { challenge: null, date: today, message: "No Reaction of the Day set." },
      { status: 200 }
    );
  }

  // For logged-in users, report whether they've already completed today's bonus.
  let completed = false;
  const session = await auth();
  if (session?.user?.id) {
    const userId = Number(session.user.id);
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

  return NextResponse.json({
    date: today,
    completed,
    challenge: row,
    // First correct attempt of the day earns double the difficulty XP.
    bonusXp: xpForDifficulty(row.difficulty) * 2,
  });
}

const completeSchema = z.object({
  reactionId: z.number().int().positive(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = Number(session.user.id);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed." }, { status: 400 });
  }

  const { today, row } = await loadTodaysChallenge();
  if (!row) {
    return NextResponse.json(
      { error: "No Reaction of the Day set." },
      { status: 404 }
    );
  }
  if (row.reactionId !== parsed.data.reactionId) {
    return NextResponse.json(
      { error: "That reaction is not today's challenge." },
      { status: 409 }
    );
  }

  // Guard against double-claiming the bonus.
  const [existing] = await db
    .select({ dailyBonus: userProgress.dailyBonus })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.reactionId, row.reactionId)
      )
    )
    .limit(1);

  if (existing?.dailyBonus) {
    return NextResponse.json(
      { error: "Daily bonus already claimed.", alreadyCompleted: true },
      { status: 409 }
    );
  }

  const bonusXp = xpForDifficulty(row.difficulty) * 2;

  // Mark the reaction complete with the daily-bonus flag.
  await db
    .insert(userProgress)
    .values({
      userId,
      reactionId: row.reactionId,
      attempts: 1,
      correctCount: 1,
      lastAttempted: new Date(),
      dailyBonus: true,
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.reactionId],
      set: {
        dailyBonus: true,
        attempts: sql`${userProgress.attempts} + 1`,
        correctCount: sql`${userProgress.correctCount} + 1`,
        lastAttempted: new Date(),
      },
    });

  // Award the double XP and recompute level.
  const [stats] = await db
    .select({ xp: userStats.xp })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);
  const result = applyXp(stats?.xp ?? 0, bonusXp);
  await db
    .update(userStats)
    .set({ xp: sql`${userStats.xp} + ${result.awarded}`, level: result.newLevel })
    .where(eq(userStats.userId, userId));

  // Completing the Reaction of the Day keeps the streak alive.
  const streak = await checkAndUpdateStreak(userId, today);

  return NextResponse.json({
    awarded: result.awarded,
    xp: result.newXp,
    level: result.newLevel,
    leveledUp: result.leveledUp,
    newLevelTitle: result.newLevelTitle,
    streak: {
      current: streak.streakCurrent,
      status: streak.status,
      milestoneReached: streak.milestoneReached,
      freezeAwarded: streak.freezeAwarded,
    },
    doubleXp: true,
    baseXp: bonusXp / 2,
  });
}
