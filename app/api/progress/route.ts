import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { reactionCards, userProgress, userStats } from "@/db/schema";
import { checkAndUpdateStreak, todayString } from "@/lib/streak";
import {
  checkAndAwardBadges,
  streakMilestoneEvent,
  type AwardedBadge,
} from "@/lib/badges";

// POST /api/progress — record a logged-in user's answer to one reaction.
//
// Per Sprint 3 §3.3: bump attempts (and correct_count on a correct answer),
// stamp last_attempted, recompute mastery (correct_count >= 3 → mastered, which
// unlocks the reaction card), and keep user_stats totals + streak in sync. XP is
// awarded separately via /api/xp/award. Guests never reach here (localStorage).

const MASTERY_THRESHOLD = 1;

const schema = z.object({
  reactionId: z.number().int().positive(),
  correct: z.boolean(),
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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed." }, { status: 400 });
  }

  const { reactionId, correct } = parsed.data;
  const now = new Date();

  // Upsert progress: increment attempts, and correct_count only when correct.
  const correctInc = correct ? 1 : 0;
  const [progress] = await db
    .insert(userProgress)
    .values({
      userId,
      reactionId,
      attempts: 1,
      correctCount: correctInc,
      lastAttempted: now,
      mastered: correct && 1 >= MASTERY_THRESHOLD,
    })
    .onConflictDoUpdate({
      target: [userProgress.userId, userProgress.reactionId],
      set: {
        attempts: sql`${userProgress.attempts} + 1`,
        correctCount: sql`${userProgress.correctCount} + ${correctInc}`,
        lastAttempted: now,
      },
    })
    .returning({
      attempts: userProgress.attempts,
      correctCount: userProgress.correctCount,
      mastered: userProgress.mastered,
    });

  // Did this answer push the reaction to mastery (3 correct)? Set the flag and
  // unlock the reaction card if it wasn't already mastered.
  let newlyMastered = false;
  if (
    progress &&
    !progress.mastered &&
    progress.correctCount >= MASTERY_THRESHOLD
  ) {
    await db
      .update(userProgress)
      .set({ mastered: true })
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.reactionId, reactionId)
        )
      );
    await db
      .insert(reactionCards)
      .values({ userId, reactionId })
      .onConflictDoNothing({
        target: [reactionCards.userId, reactionCards.reactionId],
      });
    newlyMastered = true;
  }

  // Keep aggregate stats in sync (used by the dashboard / accuracy display).
  await db
    .update(userStats)
    .set({
      totalAttempts: sql`${userStats.totalAttempts} + 1`,
      totalCorrect: sql`${userStats.totalCorrect} + ${correctInc}`,
    })
    .where(eq(userStats.userId, userId));

  // A correct answer counts as activity for the day → advance the streak.
  let streak = null;
  let awardedBadges: AwardedBadge[] = [];
  if (correct) {
    try {
      const outcome = await checkAndUpdateStreak(userId, todayString());
      streak = {
        current: outcome.streakCurrent,
        status: outcome.status,
        milestoneReached: outcome.milestoneReached,
        freezeAwarded: outcome.freezeAwarded,
      };

      // 7 / 30 / 100-day streak milestones award their badge (Sprint 4 §4.4).
      const milestoneEvent = streakMilestoneEvent(outcome.milestoneReached);
      if (milestoneEvent) {
        awardedBadges = await checkAndAwardBadges(userId, [milestoneEvent]);
      }
    } catch {
      /* missing stats row — non-fatal for progress recording */
    }
  }

  return NextResponse.json({
    attempts: progress?.attempts ?? 1,
    correctCount: progress?.correctCount ?? correctInc,
    mastered: (progress?.mastered ?? false) || newlyMastered,
    newlyMastered,
    streak,
    awardedBadges,
  });
}
