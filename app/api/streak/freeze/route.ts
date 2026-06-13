import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { userStats } from "@/db/schema";
import { todayString } from "@/lib/streak";

// POST /api/streak/freeze (Sprint 8 §8.7). Spend one banked streak freeze to
// protect today's streak without practising: decrement streak_freeze_count and
// stamp last_activity_date to today so the streak isn't broken at midnight.
// Logged-in only; no-op (409) if no freeze is available or already active today.

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  const userId = Number(session.user.id);

  const [stats] = await db
    .select({
      freezes: userStats.streakFreezeCount,
      lastActivity: userStats.lastActivityDate,
      streakCurrent: userStats.streakCurrent,
    })
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) {
    return NextResponse.json({ error: "No stats for user." }, { status: 404 });
  }

  const today = todayString();
  if (stats.lastActivity === today) {
    return NextResponse.json(
      { error: "Your streak is already safe for today." },
      { status: 409 }
    );
  }
  if (stats.freezes <= 0) {
    return NextResponse.json(
      { error: "No streak freezes available." },
      { status: 409 }
    );
  }

  const [updated] = await db
    .update(userStats)
    .set({
      streakFreezeCount: sql`${userStats.streakFreezeCount} - 1`,
      lastActivityDate: today,
    })
    .where(eq(userStats.userId, userId))
    .returning({
      freezes: userStats.streakFreezeCount,
      streakCurrent: userStats.streakCurrent,
    });

  return NextResponse.json({
    ok: true,
    freezesRemaining: updated?.freezes ?? stats.freezes - 1,
    streakCurrent: updated?.streakCurrent ?? stats.streakCurrent,
  });
}
