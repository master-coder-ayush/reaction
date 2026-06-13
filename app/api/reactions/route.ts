import { NextResponse } from "next/server";
import { asc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { categories, reactions, reactionOptions, reactionTypes } from "@/db/schema";
import { isChapterUnlocked } from "@/lib/chapters";

// GET /api/reactions?chapter=[orderIndex]&module=1
//
// Returns the chapter's reactions (each with its 4 options grouped by option
// type) for Module 1 — "Build the Reaction" MCQ. The `chapter` query param is a
// category `order_index` (1-based), matching the chapter ids used in the UI map
// (see lib/dashboard.ts, which keys chapter progress by order_index).
//
// Public: guests practise freely, so this route never requires a session.

export type ReactionOptionDTO = {
  id: number;
  optionType: string;
  text: string;
  isCorrect: boolean;
  displayOrder: number;
};

export type ReactionDTO = {
  id: number;
  name: string;
  questionText: string;
  equationText: string | null;
  difficulty: number;
  reactionTypeName: string;
  reactionTypeColor: string | null;
  hintWrongReagent: string | null;
  hintWrongProduct: string | null;
  hintWrongReactant: string | null;
  storyText: string | null;
  whyText: string | null;
  options: ReactionOptionDTO[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterRaw = searchParams.get("chapter");
  const chapter = Number(chapterRaw);

  if (!chapterRaw || !Number.isInteger(chapter) || chapter < 1) {
    return NextResponse.json(
      { error: "A valid `chapter` (category order index) is required." },
      { status: 400 }
    );
  }

  // Chapter gating (Sprint 5 §5.2): logged-in users can only fetch reactions for
  // chapters they've unlocked. Guests are never gated.
  const session = await auth();
  const callerId = session?.user?.id ? Number(session.user.id) : null;
  if (callerId != null && !(await isChapterUnlocked(callerId, chapter))) {
    return NextResponse.json(
      { error: "Chapter locked. Clear the previous chapter's boss to unlock.", chapter },
      { status: 403 }
    );
  }

  // Resolve the chapter (category order_index) to a category row.
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapter))
    .limit(1);

  if (!category) {
    return NextResponse.json(
      { error: "No chapter found for that index.", chapter },
      { status: 404 }
    );
  }

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
    return NextResponse.json({
      chapter,
      category: { id: category.id, name: category.name },
      reactions: [],
    });
  }

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

  // Only include reactions that actually have options to answer.
  const dto: ReactionDTO[] = reactionRows
    .map((r) => ({ ...r, options: optionsByReaction.get(r.id) ?? [] }))
    .filter((r) => r.options.length > 0);

  return NextResponse.json({
    chapter,
    category: { id: category.id, name: category.name },
    reactions: dto,
  });
}
