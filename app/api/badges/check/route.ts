import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { checkAndAwardBadges, type BadgeEvent } from "@/lib/badges";

// POST /api/badges/check — given one or more badge events, award any newly-earned
// badges to the logged-in user and return them for the reveal animation
// (Sprint 4 §4.3). Guests never reach here (badges require an account).

const VALID_EVENTS: readonly BadgeEvent[] = [
  "FIRST_REACTION",
  "STREAK_7",
  "STREAK_30",
  "STREAK_100",
  "CORRECT_STREAK_3",
  "BOSS_CLEAR",
  "BOSS_PERFECT",
  "TIMED_10_CORRECT",
  "PATHWAY_FIRST",
  "CARDS_25",
  "CARDS_ALL",
  "LEVEL_7",
];

const schema = z.object({
  events: z.array(z.enum(VALID_EVENTS as [BadgeEvent, ...BadgeEvent[]])).max(12),
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

  const awarded = await checkAndAwardBadges(userId, parsed.data.events);
  return NextResponse.json({ awarded });
}
