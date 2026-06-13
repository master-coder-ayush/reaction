import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  reactionCards,
  reactions,
  reactionTypes,
  users,
  userStats,
} from "@/db/schema";
import { levelInfo } from "@/lib/xp";
import { loadBadgesWithState, type BadgeWithState } from "@/lib/badges";

// ---------------------------------------------------------------------------
// Public profile data (Sprint 8 §8.1). Loads everything /u/[username] shows:
// stats, level, streaks, accuracy, badges (with earned state), card count, and
// the most-recently-unlocked cards as a showcase. Respects the privacy flag —
// `isPublic` is returned so the page can render "This profile is private."
// ---------------------------------------------------------------------------

export type ProfileShowcaseCard = {
  reactionId: number;
  name: string;
  typeColor: string | null;
  unlockedAt: string;
};

export type PublicProfile = {
  userId: number;
  username: string;
  name: string;
  isPublic: boolean;
  classLevel: string;
  memberSince: string; // ISO date
  xp: number;
  level: number;
  levelTitle: string;
  streakCurrent: number;
  streakLongest: number;
  accuracy: number; // 0-100
  totalCards: number;
  cardCount: number;
  badges: BadgeWithState[];
  showcase: ProfileShowcaseCard[];
};

/** Load a public profile by username, or null if no such user. */
export async function loadProfile(
  username: string
): Promise<PublicProfile | null> {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      isPublic: users.isPublic,
      classLevel: users.classLevel,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .limit(1);

  if (!user) return null;

  const [stats] = await db
    .select({
      xp: userStats.xp,
      level: userStats.level,
      streakCurrent: userStats.streakCurrent,
      streakLongest: userStats.streakLongest,
      totalCorrect: userStats.totalCorrect,
      totalAttempts: userStats.totalAttempts,
    })
    .from(userStats)
    .where(eq(userStats.userId, user.id))
    .limit(1);

  const xp = stats?.xp ?? 0;
  const info = levelInfo(xp);
  const accuracy =
    stats && stats.totalAttempts > 0
      ? Math.round((stats.totalCorrect / stats.totalAttempts) * 100)
      : 0;

  const [{ totalCards }] = await db
    .select({ totalCards: count() })
    .from(reactions);

  const [{ cardCount }] = await db
    .select({ cardCount: count() })
    .from(reactionCards)
    .where(eq(reactionCards.userId, user.id));

  const showcaseRows = await db
    .select({
      reactionId: reactionCards.reactionId,
      unlockedAt: reactionCards.unlockedAt,
      name: reactions.name,
      typeColor: reactionTypes.color,
    })
    .from(reactionCards)
    .innerJoin(reactions, eq(reactionCards.reactionId, reactions.id))
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .where(eq(reactionCards.userId, user.id))
    .orderBy(desc(reactionCards.unlockedAt))
    .limit(5);

  const badges = await loadBadgesWithState(user.id);

  return {
    userId: user.id,
    username: user.username,
    name: user.name,
    isPublic: user.isPublic,
    classLevel: user.classLevel,
    memberSince: user.createdAt.toISOString(),
    xp,
    level: stats?.level ?? info.level,
    levelTitle: info.title,
    streakCurrent: stats?.streakCurrent ?? 0,
    streakLongest: stats?.streakLongest ?? 0,
    accuracy,
    totalCards,
    cardCount,
    badges,
    showcase: showcaseRows.map((r) => ({
      reactionId: r.reactionId,
      name: r.name,
      typeColor: r.typeColor,
      unlockedAt: r.unlockedAt.toISOString(),
    })),
  };
}

/** Deterministic avatar hue from a username (for the initials avatar). */
export function avatarHue(username: string): number {
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = (h * 31 + username.charCodeAt(i)) % 360;
  }
  return h;
}
