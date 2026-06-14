import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  reactions,
  reactionOptions,
  reactionTypes,
} from "@/db/schema";
import type { ReactionDTO, ReactionOptionDTO } from "@/app/api/reactions/route";
import {
  ESCAPE_DOOR_COUNT,
  ESCAPE_REACTIONS_PER_DOOR,
  type EscapeReaction,
  type EscapeDoor,
} from "@/lib/escape-client";
export {
  ESCAPE_DOOR_COUNT,
  ESCAPE_REACTIONS_PER_DOOR,
  ESCAPE_CLUE_COST,
  ESCAPE_XP_AWARD,
  formatTime,
  type EscapeReaction,
  type EscapeDoor,
} from "@/lib/escape-client";

/**
 * Build the 5-door map for a class. Each door is a chapter (in order) with up to
 * 5 reactions. Chapters with too few reactions still contribute a door with
 * whatever they have, so the room is always playable.
 */
export async function loadEscapeRoom(classLevel: "11" | "12"): Promise<EscapeDoor[]> {
  const cats = await db
    .select({
      id: categories.id,
      name: categories.name,
      orderIndex: categories.orderIndex,
    })
    .from(categories)
    .where(eq(categories.classLevel, classLevel))
    .orderBy(asc(categories.orderIndex))
    .limit(ESCAPE_DOOR_COUNT);

  if (cats.length === 0) return [];

  const reactionRows = await db
    .select({
      id: reactions.id,
      name: reactions.name,
      categoryId: reactions.categoryId,
      questionText: reactions.questionText,
      equationText: reactions.equationText,
      difficulty: reactions.difficulty,
      reactionTypeName: reactionTypes.name,
      reactionTypeColor: reactionTypes.color,
      hintWrongReagent: reactions.hintWrongReagent,
      hintWrongProduct: reactions.hintWrongProduct,
      hintWrongReactant: reactions.hintWrongReactant,
      storyText: reactions.storyText,
      whyText: reactions.whyText,
    })
    .from(reactions)
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .where(
      inArray(
        reactions.categoryId,
        cats.map((c) => c.id)
      )
    );

  const optionRows = await db
    .select()
    .from(reactionOptions)
    .where(
      inArray(
        reactionOptions.reactionId,
        reactionRows.map((r) => r.id)
      )
    )
    .orderBy(asc(reactionOptions.displayOrder));

  const optionsByReaction = new Map<number, ReactionOptionDTO[]>();
  for (const o of optionRows) {
    const list = optionsByReaction.get(o.reactionId) ?? [];
    list.push({
      id: o.id,
      optionType: o.optionType,
      text: o.text,
      isCorrect: o.isCorrect,
      displayOrder: o.displayOrder,
    });
    optionsByReaction.set(o.reactionId, list);
  }

  const doors: EscapeDoor[] = [];
  for (const cat of cats) {
    const catReactions = reactionRows.filter((r) => r.categoryId === cat.id);
    const built: EscapeReaction[] = [];
    for (const r of catReactions) {
      const opts = optionsByReaction.get(r.id) ?? [];
      if (opts.length === 0) continue;
      const { categoryId: _c, ...rest } = r;
      const mode: "build" | "name" = opts.some((o) => o.optionType === "name")
        ? "name"
        : "build";
      built.push({ ...rest, options: opts, mode });
      if (built.length >= ESCAPE_REACTIONS_PER_DOOR) break;
    }
    doors.push({ chapter: cat.orderIndex, name: cat.name, reactions: built });
  }

  // Drop empty doors (chapters with no questions yet) so the room stays solvable.
  return doors.filter((d) => d.reactions.length > 0);
}

/** Format seconds as MM:SS. */
export function formatTime(seconds: number): string {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
