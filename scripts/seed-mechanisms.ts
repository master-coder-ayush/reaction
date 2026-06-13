import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Sprint 7 seed — Module 3 Drag & Drop mechanisms (§7.1). Seeds one mechanism
// per mechanism type (SN1, SN2, E2, Electrophilic Addition) with its drop slots
// (correct label + 0-100 % position) and tray labels (correct + distractors).
// Idempotent: a mechanism is identified by (categoryId, name); existing ones are
// skipped. Each is linked to a reaction in its chapter when one exists, so
// pass/fail records against user_progress.

type SlotSpec = { key: string; label: string; x: number; y: number };

type MechSpec = {
  chapter: number; // category order_index
  name: string;
  type: string;
  difficulty: number;
  diagram: string;
  story: string;
  slots: SlotSpec[];
  // Distractor labels added to the tray alongside the correct slot labels.
  distractors: string[];
};

const MECHANISMS: MechSpec[] = [
  {
    chapter: 2,
    name: "SN2: Hydroxide + Bromomethane",
    type: "SN2",
    difficulty: 2,
    diagram: "HO⁻  +  CH₃—Br  →  CH₃—OH  +  Br⁻",
    story:
      "In SN2 the nucleophile (OH⁻) attacks the electrophilic carbon from the side opposite the leaving group (Br⁻). Bond formation and bond breaking happen together in one concerted step, inverting the configuration.",
    slots: [
      { key: "nu", label: "Nucleophile", x: 14, y: 55 },
      { key: "ec", label: "Electrophilic Carbon", x: 50, y: 55 },
      { key: "lg", label: "Leaving Group", x: 84, y: 55 },
    ],
    distractors: ["Electrophile", "Carbocation"],
  },
  {
    chapter: 2,
    name: "SN1: tert-Butyl bromide ionisation",
    type: "SN1",
    difficulty: 3,
    diagram: "(CH₃)₃C—Br  →  (CH₃)₃C⁺  +  Br⁻   ⟶(H₂O)  (CH₃)₃C—OH",
    story:
      "SN1 is stepwise: the leaving group departs first, forming a stable tertiary carbocation, which the nucleophile then attacks. The rate depends only on the substrate (unimolecular).",
    slots: [
      { key: "lg", label: "Leaving Group", x: 30, y: 40 },
      { key: "cc", label: "Carbocation", x: 55, y: 70 },
      { key: "nu", label: "Nucleophile", x: 85, y: 50 },
    ],
    distractors: ["Electrophilic Carbon", "Bond Breaks"],
  },
  {
    chapter: 2,
    name: "E2: Elimination from bromoethane",
    type: "E2",
    difficulty: 3,
    diagram: "CH₃—CH₂—Br  + base  →  CH₂=CH₂  +  HBr",
    story:
      "In E2 a base removes a β-hydrogen as the C–Br bond breaks, forming a π bond in one concerted step. The new double bond forms anti-periplanar to the leaving group.",
    slots: [
      { key: "bb", label: "Bond Breaks", x: 25, y: 45 },
      { key: "nf", label: "New Bond", x: 52, y: 65 },
      { key: "lg", label: "Leaving Group", x: 82, y: 45 },
    ],
    distractors: ["Nucleophile", "Carbocation"],
  },
  {
    chapter: 1,
    name: "Electrophilic Addition: HBr to ethene",
    type: "Electrophilic Addition",
    difficulty: 2,
    diagram: "CH₂=CH₂  +  H—Br  →  CH₃—CH₂—Br",
    story:
      "The π electrons of the alkene attack the electrophile (H⁺), forming a carbocation; the bromide nucleophile then adds. Markovnikov's rule predicts the more stable carbocation.",
    slots: [
      { key: "el", label: "Electrophile", x: 22, y: 50 },
      { key: "cc", label: "Carbocation", x: 52, y: 68 },
      { key: "nu", label: "Nucleophile", x: 82, y: 50 },
    ],
    distractors: ["Leaving Group", "New Bond"],
  },
];

async function main() {
  const { db } = await import("../db");
  const { categories, reactions, mechanisms, mechanismSlots, mechanismLabels } =
    await import("../db/schema");
  const { eq, and } = await import("drizzle-orm");

  const catRows = await db
    .select({ id: categories.id, orderIndex: categories.orderIndex })
    .from(categories);
  const catId = new Map(catRows.map((c) => [c.orderIndex, c.id]));

  let created = 0;
  for (const spec of MECHANISMS) {
    const categoryId = catId.get(spec.chapter);
    if (!categoryId) {
      console.warn(`! skipping "${spec.name}" — no category for chapter ${spec.chapter}`);
      continue;
    }

    const [existing] = await db
      .select({ id: mechanisms.id })
      .from(mechanisms)
      .where(
        and(eq(mechanisms.categoryId, categoryId), eq(mechanisms.name, spec.name))
      )
      .limit(1);
    if (existing) continue;

    // Link to a reaction in the chapter if one exists (for progress recording).
    const [reaction] = await db
      .select({ id: reactions.id })
      .from(reactions)
      .where(eq(reactions.categoryId, categoryId))
      .limit(1);

    const [mech] = await db
      .insert(mechanisms)
      .values({
        categoryId,
        reactionId: reaction?.id ?? null,
        name: spec.name,
        mechanismType: spec.type,
        difficulty: spec.difficulty,
        diagramText: spec.diagram,
        storyText: spec.story,
      })
      .returning({ id: mechanisms.id });

    await db.insert(mechanismSlots).values(
      spec.slots.map((s) => ({
        mechanismId: mech.id,
        slotKey: s.key,
        correctLabel: s.label,
        posX: s.x,
        posY: s.y,
      }))
    );

    const allLabels = [...spec.slots.map((s) => s.label), ...spec.distractors];
    await db.insert(mechanismLabels).values(
      allLabels.map((text) => ({ mechanismId: mech.id, text }))
    );

    created++;
    console.log(`+ mechanism "${spec.name}" (${spec.type}, chapter ${spec.chapter})`);
  }

  console.log(`✅ Mechanism seed complete (${created} new).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Mechanism seed failed:", err);
    process.exit(1);
  });
