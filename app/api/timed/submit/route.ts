import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { userStats } from "@/db/schema";
import { applyXp } from "@/lib/xp";
import { upsertLeaderboardSnapshots } from "@/lib/leaderboard";
import { checkAndAwardBadges, type AwardedBadge } from "@/lib/badges";
import { XP_AWARDS } from "@/lib/xp";

// POST /api/timed/submit — finish a Timed Challenge run (Sprint 7 §7.2–7.3).
// The client sends how many reactions were answered correctly in 60s. We credit
// score × 15 XP, update the user's best score (for the Speed leaderboard), and
// award the Speed Demon badge once best ≥ 10. Guests never reach here — their
// timed XP is localStorage-only and never on the leaderboard.

const SPEED_CAP = 200; // sane upper bound on correct-in-60s

const schema = z.object({
  score: z.number().int().min(0).max(SPEED_CAP),
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

  const { score } = parsed.data;

  const [stats] = await db
    .select({ xp: userStats.xp, best: userStats.bestTimedScore })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) {
    return NextResponse.json({ error: "No stats for user." }, { status: 404 });
  }

  const award = score * XP_AWARDS.TIMED_PER_CORRECT;
  const result = applyXp(stats.xp, award);
  const previousBest = stats.best ?? 0;
  const newBest = Math.max(previousBest, score);

  const [updated] = await db
    .update(userStats)
    .set({
      xp: sql`${userStats.xp} + ${result.awarded}`,
      level: result.newLevel,
      bestTimedScore: newBest,
    })
    .where(eq(userStats.userId, userId))
    .returning({ xp: userStats.xp });

  const newXp = updated?.xp ?? result.newXp;
  await upsertLeaderboardSnapshots(userId, newXp).catch(() => {});

  // Speed Demon at 10+ in a run (best ≥ 10).
  let awardedBadges: AwardedBadge[] = [];
  if (newBest >= 10) {
    awardedBadges = await checkAndAwardBadges(userId, ["TIMED_10_CORRECT"]).catch(
      () => []
    );
  }

  return NextResponse.json({
    score,
    awardedXp: result.awarded,
    xp: newXp,
    leveledUp: result.leveledUp,
    newLevelTitle: result.newLevelTitle,
    previousBest,
    best: newBest,
    isNewBest: score > previousBest,
    awardedBadges,
  });
}
