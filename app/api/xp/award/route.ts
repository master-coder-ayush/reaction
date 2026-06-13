import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { userStats } from "@/db/schema";
import { applyXp } from "@/lib/xp";
import { checkAndAwardBadges, type AwardedBadge } from "@/lib/badges";
import { upsertLeaderboardSnapshots } from "@/lib/leaderboard";

// POST /api/xp/award — credit XP to the logged-in user, recompute level, and
// report whether a level threshold was crossed. Guests never reach here: their
// XP path is localStorage-only (see lib/guest.ts).

const awardSchema = z.object({
  amount: z.number().int().min(1).max(10_000),
  // Optional label for logging / future XP history.
  action: z.string().max(64).optional(),
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

  const parsed = awardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { amount } = parsed.data;

  const [stats] = await db
    .select({ xp: userStats.xp })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) {
    return NextResponse.json({ error: "No stats for user." }, { status: 404 });
  }

  const result = applyXp(stats.xp, amount);

  // Increment atomically off the DB value to avoid clobbering concurrent awards;
  // `result` (computed off the read) is still a good level estimate for the
  // response and for the level-up event.
  const [updated] = await db
    .update(userStats)
    .set({
      xp: sql`${userStats.xp} + ${result.awarded}`,
      level: result.newLevel,
    })
    .where(eq(userStats.userId, userId))
    .returning({ xp: userStats.xp });

  const newXp = updated?.xp ?? result.newXp;

  // Keep the user's leaderboard snapshots fresh (Sprint 4 §4.2): upsert their
  // row for the current daily / weekly / monthly periods off their new XP total.
  await upsertLeaderboardSnapshots(userId, newXp).catch(() => {
    /* non-fatal — the live ranking still works off user_stats */
  });

  // Reaching Level 7 awards the "Organic Grandmaster" badge (Sprint 4 §4.4).
  let awardedBadges: AwardedBadge[] = [];
  if (result.newLevel >= 7) {
    awardedBadges = await checkAndAwardBadges(userId, ["LEVEL_7"]).catch(
      () => []
    );
  }

  return NextResponse.json({
    xp: newXp,
    level: result.newLevel,
    awarded: result.awarded,
    leveledUp: result.leveledUp,
    newLevelTitle: result.newLevelTitle,
    awardedBadges,
  });
}
