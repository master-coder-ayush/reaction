import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { pathwayCards, userStats } from "@/db/schema";
import { applyXp } from "@/lib/xp";
import { upsertLeaderboardSnapshots } from "@/lib/leaderboard";
import { checkAndAwardBadges, type AwardedBadge } from "@/lib/badges";
import {
  hasPathwayCard,
  loadPathway,
  PATHWAY_COMPLETE_XP,
  PATHWAY_STEP_XP,
} from "@/lib/pathway";

// POST /api/pathway/complete — record a completed pathway challenge (Sprint 6
// §6.1–6.2). The client sends the pathway id once the student has worked through
// every step. We compute XP server-side from the pathway's real step count
// (20 XP per step beyond the start + an 80 XP completion bonus), credit it
// atomically, save the pathway card, and award the Pathway Pioneer badge on the
// first completion. Guests never reach here — their XP path is localStorage-only.

const schema = z.object({
  pathwayId: z.number().int().positive(),
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

  const { pathwayId } = parsed.data;
  const pathway = await loadPathway(pathwayId);
  if (!pathway || pathway.steps.length < 2) {
    return NextResponse.json({ error: "Pathway not found." }, { status: 404 });
  }

  // Already completed? Don't re-award XP or the bonus — completing again is fine
  // for practice but only credits XP once (the card is the gate).
  const alreadyDone = await hasPathwayCard(userId, pathwayId);

  // Steps beyond the starting compound each award PATHWAY_STEP_XP.
  const stepCount = pathway.steps.length - 1;
  const totalXp = alreadyDone
    ? 0
    : stepCount * PATHWAY_STEP_XP + PATHWAY_COMPLETE_XP;

  let awardedXp = 0;
  let newXp: number | null = null;
  let leveledUp = false;
  let newLevelTitle = "";

  if (totalXp > 0) {
    const [stats] = await db
      .select({ xp: userStats.xp })
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats) {
      const result = applyXp(stats.xp, totalXp);
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
  }

  // Save the pathway card (idempotent — re-completing won't duplicate it).
  await db
    .insert(pathwayCards)
    .values({ userId, pathwayId })
    .onConflictDoNothing({
      target: [pathwayCards.userId, pathwayCards.pathwayId],
    });

  // Pathway Pioneer badge on the first pathway completed.
  const awardedBadges: AwardedBadge[] = await checkAndAwardBadges(userId, [
    "PATHWAY_FIRST",
  ]).catch(() => []);

  return NextResponse.json({
    pathwayId,
    stepXp: PATHWAY_STEP_XP,
    bonusXp: PATHWAY_COMPLETE_XP,
    awardedXp,
    xp: newXp,
    leveledUp,
    newLevelTitle,
    alreadyCompleted: alreadyDone,
    awardedBadges,
  });
}
