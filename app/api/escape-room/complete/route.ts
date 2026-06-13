import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { badges, escapeRoomResults, userStats } from "@/db/schema";
import { applyXp } from "@/lib/xp";
import { upsertLeaderboardSnapshots } from "@/lib/leaderboard";
import { awardBadgeIds } from "@/lib/boss";
import { ESCAPE_CLUE_COST, ESCAPE_XP_AWARD } from "@/lib/escape";
import type { AwardedBadge } from "@/lib/badges";

// POST /api/escape-room/complete — finish an Escape Room run (Sprint 5 §5.4).
//
// Records the run + the time, keeps userStats.escapeBestSeconds as the personal
// best (for the Escape Room leaderboard), and credits the net XP: +100 minus
// 10 per clue used during the run (floored at 0). Awards the Escape Artist badge
// on the first completion. Guests never reach here (their run doesn't persist).

const schema = z.object({
  classLevel: z.enum(["11", "12"]),
  seconds: z.number().int().min(1).max(24 * 60 * 60),
  cluesUsed: z.number().int().min(0).max(100).default(0),
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

  const { classLevel, seconds, cluesUsed } = parsed.data;

  // Persist the run.
  await db.insert(escapeRoomResults).values({ userId, classLevel, seconds });

  // Net XP: base award minus the clue cost spent during the run.
  const netXp = Math.max(0, ESCAPE_XP_AWARD - cluesUsed * ESCAPE_CLUE_COST);

  const [stats] = await db
    .select({ xp: userStats.xp, best: userStats.escapeBestSeconds })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  let newXp: number | null = null;
  let leveledUp = false;
  let newLevelTitle = "";

  if (stats) {
    const result = applyXp(stats.xp, netXp);
    const isBest = stats.best == null || seconds < stats.best;

    const [updated] = await db
      .update(userStats)
      .set({
        xp: netXp > 0 ? sql`${userStats.xp} + ${result.awarded}` : userStats.xp,
        level: result.newLevel,
        ...(isBest ? { escapeBestSeconds: seconds } : {}),
      })
      .where(eq(userStats.userId, userId))
      .returning({ xp: userStats.xp });

    newXp = updated?.xp ?? result.newXp;
    leveledUp = netXp > 0 && result.leveledUp;
    newLevelTitle = result.newLevelTitle;

    await upsertLeaderboardSnapshots(userId, newXp).catch(() => {});
  }

  // Escape Artist badge (first completion).
  let awardedBadges: AwardedBadge[] = [];
  const [escapeBadge] = await db
    .select({ id: badges.id })
    .from(badges)
    .where(eq(badges.requirementType, "escape_completed"))
    .limit(1);
  if (escapeBadge) {
    awardedBadges = await awardBadgeIds(userId, [escapeBadge.id]).catch(() => []);
  }

  return NextResponse.json({
    seconds,
    awardedXp: netXp,
    xp: newXp,
    leveledUp,
    newLevelTitle,
    awardedBadges,
  });
}
