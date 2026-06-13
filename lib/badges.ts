import { count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  badges,
  reactionCards,
  reactions,
  userBadges,
  userProgress,
  userStats,
} from "@/db/schema";

// ---------------------------------------------------------------------------
// Badge engine (Sprint 4 §4.3). `checkAndAwardBadges(userId, events)` is called
// after XP awards, streak updates, boss clears, etc. Each event maps to one or
// more badge requirement types; for each candidate badge the user doesn't yet
// hold, we verify the requirement against live data and, if met, insert into
// `user_badges` and return the badge so the client can show the reveal.
//
// Only the events the sprint wires this round (FIRST_REACTION, CORRECT_STREAK_3,
// STREAK_7/30/100) have live checks; the rest are listed so later sprints (Boss,
// Pathway, Timed, Cards) can fill them in without changing the call sites.
// ---------------------------------------------------------------------------

export type BadgeEvent =
  | "FIRST_REACTION"
  | "STREAK_7"
  | "STREAK_30"
  | "STREAK_100"
  | "CORRECT_STREAK_3"
  | "BOSS_CLEAR"
  | "BOSS_PERFECT"
  | "TIMED_10_CORRECT"
  | "PATHWAY_FIRST"
  | "CARDS_25"
  | "CARDS_ALL"
  | "LEVEL_7";

export type AwardedBadge = {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  color: string | null;
};

// Map each event to the badge `requirement_type` it can satisfy. (Names match
// the seeded badge rows in scripts/seed.ts.)
const EVENT_REQUIREMENT: Record<BadgeEvent, string> = {
  FIRST_REACTION: "reactions_completed",
  CORRECT_STREAK_3: "correct_streak",
  STREAK_7: "streak_days",
  STREAK_30: "streak_days",
  STREAK_100: "streak_days",
  LEVEL_7: "level_reached",
  CARDS_25: "cards_collected",
  CARDS_ALL: "cards_collected_all",
  BOSS_CLEAR: "boss_cleared",
  BOSS_PERFECT: "perfect_boss",
  TIMED_10_CORRECT: "timed_score",
  PATHWAY_FIRST: "pathway_completed",
};

/**
 * Verify a candidate badge's requirement against live user data. Returns true if
 * the user genuinely qualifies (we re-check rather than trust the event, so a
 * stale or spoofed event can't grant a badge). Unimplemented requirement types
 * (boss / timed / pathway) return false until their sprints wire them up.
 */
async function meetsRequirement(
  userId: number,
  requirementType: string,
  requirementValue: number
): Promise<boolean> {
  switch (requirementType) {
    case "reactions_completed": {
      const [{ n }] = await db
        .select({ n: count() })
        .from(userProgress)
        .where(eq(userProgress.userId, userId));
      return n >= requirementValue;
    }
    case "correct_streak": {
      // Session state, not stored — the event itself attests to it. We trust the
      // caller (PracticeSession) only fires CORRECT_STREAK_3 on a real 3-in-a-row.
      return true;
    }
    case "streak_days": {
      const [stats] = await db
        .select({ streak: userStats.streakCurrent })
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);
      return (stats?.streak ?? 0) >= requirementValue;
    }
    case "level_reached": {
      const [stats] = await db
        .select({ level: userStats.level })
        .from(userStats)
        .where(eq(userStats.userId, userId))
        .limit(1);
      return (stats?.level ?? 1) >= requirementValue;
    }
    case "cards_collected": {
      const [{ n }] = await db
        .select({ n: count() })
        .from(reactionCards)
        .where(eq(reactionCards.userId, userId));
      return n >= requirementValue;
    }
    case "cards_collected_all": {
      const [{ total }] = await db.select({ total: count() }).from(reactions);
      const [{ owned }] = await db
        .select({ owned: count() })
        .from(reactionCards)
        .where(eq(reactionCards.userId, userId));
      return total > 0 && owned >= total;
    }
    default:
      // boss_cleared / perfect_boss / timed_score / pathway_completed — wired up
      // in later sprints.
      return false;
  }
}

/**
 * Check the given events for a user and award any newly-earned badges. Returns
 * the list of badges awarded *by this call* (for the reveal animation). Safe to
 * call with events that don't map to any unheld badge — it just returns [].
 */
export async function checkAndAwardBadges(
  userId: number,
  events: BadgeEvent[]
): Promise<AwardedBadge[]> {
  if (events.length === 0) return [];

  const requirementTypes = Array.from(
    new Set(events.map((e) => EVENT_REQUIREMENT[e]).filter(Boolean))
  );
  if (requirementTypes.length === 0) return [];

  // Candidate badges for these requirement types.
  const candidates = await db
    .select()
    .from(badges)
    .where(inArray(badges.requirementType, requirementTypes));
  if (candidates.length === 0) return [];

  // Badges the user already holds (skip those).
  const held = new Set(
    (
      await db
        .select({ badgeId: userBadges.badgeId })
        .from(userBadges)
        .where(eq(userBadges.userId, userId))
    ).map((r) => r.badgeId)
  );

  const awarded: AwardedBadge[] = [];
  for (const badge of candidates) {
    if (held.has(badge.id)) continue;
    const ok = await meetsRequirement(
      userId,
      badge.requirementType,
      badge.requirementValue
    );
    if (!ok) continue;

    // Insert; onConflictDoNothing guards against a race with a concurrent award.
    const inserted = await db
      .insert(userBadges)
      .values({ userId, badgeId: badge.id })
      .onConflictDoNothing({
        target: [userBadges.userId, userBadges.badgeId],
      })
      .returning({ badgeId: userBadges.badgeId });

    if (inserted.length > 0) {
      awarded.push({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
      });
    }
  }

  return awarded;
}

/** Map a streak milestone (7 / 30 / 100) to its badge event, if any. */
export function streakMilestoneEvent(milestone: number | null): BadgeEvent | null {
  switch (milestone) {
    case 7:
      return "STREAK_7";
    case 30:
      return "STREAK_30";
    case 100:
      return "STREAK_100";
    default:
      return null;
  }
}

/** All badges with the caller's earned state — for the /badges page. */
export type BadgeWithState = AwardedBadge & {
  requirementType: string;
  requirementValue: number;
  earnedAt: Date | null;
};

export async function loadBadgesWithState(
  userId: number | null
): Promise<BadgeWithState[]> {
  const all = await db.select().from(badges).orderBy(badges.id);

  let earnedMap = new Map<number, Date>();
  if (userId != null) {
    const rows = await db
      .select({ badgeId: userBadges.badgeId, earnedAt: userBadges.earnedAt })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));
    earnedMap = new Map(rows.map((r) => [r.badgeId, r.earnedAt]));
  }

  return all.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    color: b.color,
    requirementType: b.requirementType,
    requirementValue: b.requirementValue,
    earnedAt: earnedMap.get(b.id) ?? null,
  }));
}
