import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  reactions,
  reactionOptions,
  reactionTypes,
} from "@/db/schema";
import type { ReactionDTO, ReactionOptionDTO } from "@/app/api/reactions/route";

// Server-side loader for Module 1 reactions. Mirrors GET /api/reactions but runs
// in the page (RSC) so the first question renders without a client round-trip.
// `chapter` is a category order_index (the chapter id used across the UI).

export async function loadChapterReactions(
  chapter: number
): Promise<{ categoryName: string | null; reactions: ReactionDTO[] }> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapter))
    .limit(1);

  if (!category) return { categoryName: null, reactions: [] };

  const reactionRows = await db
    .select({
      id: reactions.id,
      name: reactions.name,
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
    .where(eq(reactions.categoryId, category.id));

  if (reactionRows.length === 0) {
    return { categoryName: category.name, reactions: [] };
  }

  const optionRows = await db
    .select()
    .from(reactionOptions);

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

  const dto: ReactionDTO[] = reactionRows
    .map((r) => ({ ...r, options: optionsByReaction.get(r.id) ?? [] }))
    .filter((r) => r.options.length > 0);

  return { categoryName: category.name, reactions: dto };
}

// ---------------------------------------------------------------------------
// Timed Challenge pool (Sprint 7 §7.2). All reactions across every chapter, in
// Module 1/2 format, for the 60-second burst mode. No chapter gating — the
// timed mode draws from everything the student could face.
// ---------------------------------------------------------------------------

export async function loadAllReactions(): Promise<ReactionDTO[]> {
  const reactionRows = await db
    .select({
      id: reactions.id,
      name: reactions.name,
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
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id));

  if (reactionRows.length === 0) return [];

  const optionRows = await db.select().from(reactionOptions);
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

  return reactionRows
    .map((r) => ({ ...r, options: optionsByReaction.get(r.id) ?? [] }))
    .filter((r) => r.options.length > 0);
}

// ---------------------------------------------------------------------------
// Functional-group conversion chart (Sprint 8 §8.5). For a chapter, the
// From → Reagent → To table built from each reaction's correct reactant /
// reagent / product, colour-coded by reaction type. A study aid, no auth.
// ---------------------------------------------------------------------------

export type ConversionRow = {
  reactionId: number;
  name: string;
  from: string | null;
  reagent: string | null;
  to: string | null;
  typeName: string;
  typeColor: string | null;
};

export async function loadConversionChart(
  chapter: number
): Promise<{ categoryName: string | null; rows: ConversionRow[] }> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapter))
    .limit(1);
  if (!category) return { categoryName: null, rows: [] };

  const reactionRows = await db
    .select({
      id: reactions.id,
      name: reactions.name,
      typeName: reactionTypes.name,
      typeColor: reactionTypes.color,
    })
    .from(reactions)
    .innerJoin(reactionTypes, eq(reactions.reactionTypeId, reactionTypes.id))
    .where(eq(reactions.categoryId, category.id));

  if (reactionRows.length === 0) {
    return { categoryName: category.name, rows: [] };
  }

  const optRows = await db
    .select({
      reactionId: reactionOptions.reactionId,
      optionType: reactionOptions.optionType,
      text: reactionOptions.text,
      isCorrect: reactionOptions.isCorrect,
    })
    .from(reactionOptions);

  const faces = new Map<
    number,
    { reactant?: string; reagent?: string; product?: string }
  >();
  for (const o of optRows) {
    if (!o.isCorrect) continue;
    const f = faces.get(o.reactionId) ?? {};
    if (o.optionType === "reactant") f.reactant = o.text;
    else if (o.optionType === "reagent") f.reagent = o.text;
    else if (o.optionType === "product") f.product = o.text;
    faces.set(o.reactionId, f);
  }

  const rows: ConversionRow[] = reactionRows.map((r) => {
    const f = faces.get(r.id) ?? {};
    return {
      reactionId: r.id,
      name: r.name,
      from: f.reactant ?? null,
      reagent: f.reagent ?? null,
      to: f.product ?? null,
      typeName: r.typeName,
      typeColor: r.typeColor,
    };
  });

  return { categoryName: category.name, rows };
}

// ---------------------------------------------------------------------------
// Module 2 — Name the Reaction (Sprint 4 §4.1). Same shape as Module 1, but only
// reactions flagged `is_name_reaction` and only their `name`-type options.
// ---------------------------------------------------------------------------

export async function loadNamedReactions(
  chapter: number
): Promise<{ categoryName: string | null; reactions: ReactionDTO[] }> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapter))
    .limit(1);

  if (!category) return { categoryName: null, reactions: [] };

  const reactionRows = await db
    .select({
      id: reactions.id,
      name: reactions.name,
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
      and(
        eq(reactions.categoryId, category.id),
        eq(reactions.isNameReaction, true)
      )
    );

  if (reactionRows.length === 0) {
    return { categoryName: category.name, reactions: [] };
  }

  const optionRows = await db
    .select()
    .from(reactionOptions)
    .where(eq(reactionOptions.optionType, "name"));

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

  const dto: ReactionDTO[] = reactionRows
    .map((r) => ({ ...r, options: optionsByReaction.get(r.id) ?? [] }))
    .filter((r) => r.options.length > 0);

  return { categoryName: category.name, reactions: dto };
}

// Session-selection helpers live in lib/session.ts (client-safe, no DB import).
