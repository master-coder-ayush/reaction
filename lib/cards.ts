import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  reactionCards,
  reactionOptions,
  reactions,
  reactionTypes,
} from "@/db/schema";

// ---------------------------------------------------------------------------
// Reaction card collection (Sprint 7 §7.4). Loads every reaction in the game
// with its unlock state for a user (locked cards are shown as silhouettes), the
// chapter + reaction-type for filtering, and the correct reactant/reagent/product
// for the unlocked card face. Guests get all cards as locked.
// ---------------------------------------------------------------------------

export type ReactionCardDTO = {
  reactionId: number;
  name: string;
  difficulty: number;
  chapterId: number; // category order_index
  chapterName: string;
  typeName: string;
  typeColor: string | null;
  reactant: string | null;
  reagent: string | null;
  product: string | null;
  unlocked: boolean;
  unlockedAt: string | null; // ISO date
};

export async function loadReactionCards(
  userId: number | null
): Promise<ReactionCardDTO[]> {
  const rows = await db
    .select({
      reactionId: reactions.id,
      name: reactions.name,
      difficulty: reactions.difficulty,
      chapterId: categories.orderIndex,
      chapterName: categories.name,
      typeName: reactionTypes.name,
      typeColor: reactionTypes.color,
    })
    .from(reactions)
    .innerJoin(categories, eq(reactions.categoryId, categories.id))
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .orderBy(asc(categories.orderIndex), asc(reactions.id));

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.reactionId);

  // Correct option per type for each reaction (the card face summary).
  const optRows = await db
    .select({
      reactionId: reactionOptions.reactionId,
      optionType: reactionOptions.optionType,
      text: reactionOptions.text,
      isCorrect: reactionOptions.isCorrect,
    })
    .from(reactionOptions)
    .where(inArray(reactionOptions.reactionId, ids));

  const facesByReaction = new Map<
    number,
    { reactant?: string; reagent?: string; product?: string }
  >();
  for (const o of optRows) {
    if (!o.isCorrect) continue;
    const f = facesByReaction.get(o.reactionId) ?? {};
    if (o.optionType === "reactant") f.reactant = o.text;
    else if (o.optionType === "reagent") f.reagent = o.text;
    else if (o.optionType === "product") f.product = o.text;
    facesByReaction.set(o.reactionId, f);
  }

  // Unlock state (logged-in only).
  const unlockedMap = new Map<number, Date>();
  if (userId != null) {
    const cardRows = await db
      .select({
        reactionId: reactionCards.reactionId,
        unlockedAt: reactionCards.unlockedAt,
      })
      .from(reactionCards)
      .where(eq(reactionCards.userId, userId));
    for (const c of cardRows) unlockedMap.set(c.reactionId, c.unlockedAt);
  }

  return rows.map((r) => {
    const face = facesByReaction.get(r.reactionId) ?? {};
    const unlockedAt = unlockedMap.get(r.reactionId) ?? null;
    return {
      reactionId: r.reactionId,
      name: r.name,
      difficulty: r.difficulty,
      chapterId: r.chapterId,
      chapterName: r.chapterName,
      typeName: r.typeName,
      typeColor: r.typeColor,
      reactant: face.reactant ?? null,
      reagent: face.reagent ?? null,
      product: face.product ?? null,
      unlocked: unlockedAt != null,
      unlockedAt: unlockedAt ? unlockedAt.toISOString() : null,
    };
  });
}
