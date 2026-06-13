import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  mechanismLabels,
  mechanismSlots,
  mechanisms,
} from "@/db/schema";

// ---------------------------------------------------------------------------
// Mechanism data — Module 3 Drag & Drop (Sprint 7 §7.1). Loads a chapter's
// mechanisms with their slots (drop targets + correct labels) and tray labels.
// Evaluation is client-side, so the correct label per slot is included in the
// DTO. Pass/fail is recorded via /api/progress against the linked reaction.
// ---------------------------------------------------------------------------

export type MechanismSlotDTO = {
  slotKey: string;
  correctLabel: string;
  posX: number;
  posY: number;
};

export type MechanismDTO = {
  id: number;
  reactionId: number | null;
  name: string;
  mechanismType: string;
  difficulty: number;
  diagramText: string;
  storyText: string | null;
  slots: MechanismSlotDTO[];
  // The tray chips (correct labels + distractors), shuffled order not enforced
  // server-side — the client shuffles.
  labels: string[];
};

export async function loadChapterMechanisms(
  chapterId: number
): Promise<{ categoryName: string | null; mechanisms: MechanismDTO[] }> {
  const [category] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.orderIndex, chapterId))
    .limit(1);

  if (!category) return { categoryName: null, mechanisms: [] };

  const mechRows = await db
    .select({
      id: mechanisms.id,
      reactionId: mechanisms.reactionId,
      name: mechanisms.name,
      mechanismType: mechanisms.mechanismType,
      difficulty: mechanisms.difficulty,
      diagramText: mechanisms.diagramText,
      storyText: mechanisms.storyText,
    })
    .from(mechanisms)
    .where(eq(mechanisms.categoryId, category.id))
    .orderBy(asc(mechanisms.id));

  if (mechRows.length === 0) {
    return { categoryName: category.name, mechanisms: [] };
  }

  const ids = mechRows.map((m) => m.id);
  const [slotRows, labelRows] = await Promise.all([
    db
      .select({
        mechanismId: mechanismSlots.mechanismId,
        slotKey: mechanismSlots.slotKey,
        correctLabel: mechanismSlots.correctLabel,
        posX: mechanismSlots.posX,
        posY: mechanismSlots.posY,
      })
      .from(mechanismSlots)
      .where(inArray(mechanismSlots.mechanismId, ids)),
    db
      .select({
        mechanismId: mechanismLabels.mechanismId,
        text: mechanismLabels.text,
      })
      .from(mechanismLabels)
      .where(inArray(mechanismLabels.mechanismId, ids)),
  ]);

  const slotsByMech = new Map<number, MechanismSlotDTO[]>();
  for (const s of slotRows) {
    const list = slotsByMech.get(s.mechanismId) ?? [];
    list.push({
      slotKey: s.slotKey,
      correctLabel: s.correctLabel,
      posX: s.posX,
      posY: s.posY,
    });
    slotsByMech.set(s.mechanismId, list);
  }

  const labelsByMech = new Map<number, string[]>();
  for (const l of labelRows) {
    const list = labelsByMech.get(l.mechanismId) ?? [];
    list.push(l.text);
    labelsByMech.set(l.mechanismId, list);
  }

  const dto = mechRows
    .map((m) => ({
      ...m,
      slots: slotsByMech.get(m.id) ?? [],
      labels: labelsByMech.get(m.id) ?? [],
    }))
    .filter((m) => m.slots.length > 0 && m.labels.length > 0);

  return { categoryName: category.name, mechanisms: dto };
}
