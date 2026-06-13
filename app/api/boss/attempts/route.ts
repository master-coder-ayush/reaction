import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  attemptsToday,
  BOSS_DAILY_ATTEMPT_LIMIT,
} from "@/lib/boss";

// GET /api/boss/attempts?chapter=[id] — how many boss attempts the logged-in
// user has spent on this chapter today, and whether they're allowed another
// (Sprint 5 §5.1). Guests are never gated, so they get a permissive response.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapter = Number(searchParams.get("chapter"));
  if (!Number.isInteger(chapter) || chapter < 1) {
    return NextResponse.json({ error: "A valid `chapter` is required." }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    // Guests can always start (their progress just won't persist).
    return NextResponse.json({
      used: 0,
      limit: BOSS_DAILY_ATTEMPT_LIMIT,
      canStart: true,
    });
  }

  const used = await attemptsToday(Number(session.user.id), chapter);
  return NextResponse.json({
    used,
    limit: BOSS_DAILY_ATTEMPT_LIMIT,
    canStart: used < BOSS_DAILY_ATTEMPT_LIMIT,
  });
}
