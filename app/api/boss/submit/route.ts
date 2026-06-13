import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { userStats } from "@/db/schema";
import { applyXp } from "@/lib/xp";
import { upsertLeaderboardSnapshots } from "@/lib/leaderboard";
import {
  awardBossBadges,
  recordAttempt,
  BOSS_PASS_THRESHOLD,
  BOSS_QUESTION_COUNT,
  BOSS_XP_AWARD,
} from "@/lib/boss";
import { CHAPTERS } from "@/lib/constants";
import type { AwardedBadge } from "@/lib/badges";

// POST /api/boss/submit — finish a boss level (Sprint 5 §5.1, §5.3).
//
// The client sends the chapter and the per-question results. We always record
// the attempt (it counts against the daily limit even on a fail). On a pass
// (≥16/20) we credit 200 XP, award the chapter's boss badge — which is what
// gates the next chapter — and the Perfect Boss badge on a 20/20. Guests never
// reach here; their boss runs don't persist.

const schema = z.object({
  chapter: z.number().int().positive(),
  score: z.number().int().min(0).max(BOSS_QUESTION_COUNT),
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

  const { chapter, score } = parsed.data;
  const passed = score >= BOSS_PASS_THRESHOLD;
  const perfect = score >= BOSS_QUESTION_COUNT;

  // Always count the attempt against today's limit.
  const attemptsUsed = await recordAttempt(userId, chapter);

  let awardedXp = 0;
  let newXp: number | null = null;
  let leveledUp = false;
  let newLevelTitle = "";
  let awardedBadges: AwardedBadge[] = [];
  let nextChapterName: string | null = null;

  if (passed) {
    // Credit the flat boss XP atomically, mirroring /api/xp/award.
    const [stats] = await db
      .select({ xp: userStats.xp })
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats) {
      const result = applyXp(stats.xp, BOSS_XP_AWARD);
      const [updated] = await db
        .update(userStats)
        .set({
          xp: sql`${userStats.xp} + ${result.awarded}`,
          level: result.newLevel,
        })
        .where(eq(userStats.userId, userId))
        .returning({ xp: userStats.xp });

      awardedXp = result.awarded;
      newXp = updated?.xp ?? result.newXp;
      leveledUp = result.leveledUp;
      newLevelTitle = result.newLevelTitle;

      await upsertLeaderboardSnapshots(userId, newXp).catch(() => {});
    }

    // Boss badge (= the chapter-unlock gate) + Perfect Boss on 20/20.
    awardedBadges = await awardBossBadges(userId, chapter, perfect).catch(
      () => []
    );

    // Name of the chapter this clear unlocks, for the "X is now unlocked!" copy.
    const next = CHAPTERS.find((c) => c.unlockedBy === chapter);
    nextChapterName = next?.name ?? null;
  }

  return NextResponse.json({
    passed,
    perfect,
    score,
    total: BOSS_QUESTION_COUNT,
    attemptsUsed,
    awardedXp,
    xp: newXp,
    leveledUp,
    newLevelTitle,
    awardedBadges,
    nextChapterName,
  });
}
