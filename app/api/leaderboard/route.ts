import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  loadEscapeLeaderboard,
  loadLeaderboard,
  loadSpeedLeaderboard,
  type ClassFilter,
  type Period,
} from "@/lib/leaderboard";

// GET /api/leaderboard?period=weekly&class=all
//
// Returns the top 50 rows for the period + class filter, plus the caller's own
// row (ranked even if outside the top — null for guests). Visible to everyone;
// guests just won't have a `me` row (Sprint 4 §4.2).

const PERIODS = new Set<Period>(["daily", "weekly", "monthly", "all-time"]);
const CLASSES = new Set<ClassFilter>(["all", "11", "12"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const session = await auth();
  const callerId = session?.user?.id ? Number(session.user.id) : null;

  // Escape Room tab (Sprint 5 §5.5): ranked best escape times, fastest first.
  if (searchParams.get("period") === "escape") {
    const { rows, me } = await loadEscapeLeaderboard(callerId, 20);
    return NextResponse.json({ period: "escape", rows, me });
  }

  // Speed tab (Sprint 7 §7.2): ranked best Timed Challenge scores, highest first.
  if (searchParams.get("period") === "speed") {
    const { rows, me } = await loadSpeedLeaderboard(callerId, 20);
    return NextResponse.json({ period: "speed", rows, me });
  }

  const periodRaw = (searchParams.get("period") ?? "weekly") as Period;
  const classRaw = (searchParams.get("class") ?? "all") as ClassFilter;

  const period = PERIODS.has(periodRaw) ? periodRaw : "weekly";
  const classFilter = CLASSES.has(classRaw) ? classRaw : "all";

  const { rows, me } = await loadLeaderboard(period, classFilter, callerId, 50);

  return NextResponse.json({ period, class: classFilter, rows, me });
}
