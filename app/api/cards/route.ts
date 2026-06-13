import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { loadReactionCards } from "@/lib/cards";

// GET /api/cards — all reaction cards with the caller's unlock state (Sprint 7
// §7.4). Public: guests get every card as locked (unlocked: false), so the grid
// renders the same for everyone with a sign-up nudge in the UI.

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const cards = await loadReactionCards(userId);
  return NextResponse.json({ cards });
}
