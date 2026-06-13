import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Sprint 6 seed — Reaction Pathway Challenges (§6.1). Seeds ≥2 pathways per
// chapter into reaction_pathways + pathway_steps. Idempotent: a pathway is
// identified by (categoryId, name); existing ones are skipped.
//
// Each step's `reagentUsed` is the reagent that converts the *previous* compound
// into this one (the first step is the starting compound, reagent null).

type StepSpec = {
  compound: string;
  reagent?: string;
  // Reaction type name (matches reaction_types.name) for the step's color.
  type?: string;
};

type PathwaySpec = {
  // Chapter (category order_index) the pathway belongs to.
  chapter: number;
  name: string;
  description: string;
  steps: StepSpec[];
};

const PATHWAYS: PathwaySpec[] = [
  // ---- Chapter 1: Hydrocarbons -------------------------------------------
  {
    chapter: 1,
    name: "Methane to Methanol",
    description: "A classic two-step conversion via the haloalkane.",
    steps: [
      { compound: "Methane" },
      { compound: "Chloromethane", reagent: "Cl₂, hv", type: "Substitution" },
      { compound: "Methanol", reagent: "KOH (aq)", type: "Substitution" },
    ],
  },
  {
    chapter: 1,
    name: "Ethene to Ethanoic Acid",
    description: "Hydration then oxidation builds the acid from the alkene.",
    steps: [
      { compound: "Ethene" },
      { compound: "Ethanol", reagent: "H₂O / H⁺", type: "Addition" },
      { compound: "Ethanoic Acid", reagent: "KMnO₄", type: "Oxidation" },
    ],
  },
  // ---- Chapter 2: Haloalkanes --------------------------------------------
  {
    chapter: 2,
    name: "Bromoethane to Ethylamine",
    description: "Nucleophilic substitution by ammonia.",
    steps: [
      { compound: "Bromoethane" },
      { compound: "Ethanenitrile", reagent: "KCN (alc)", type: "Nucleophilic" },
      { compound: "Ethylamine", reagent: "LiAlH₄", type: "Reduction" },
    ],
  },
  {
    chapter: 2,
    name: "Chloromethane to Ethane",
    description: "Wurtz coupling doubles the carbon chain.",
    steps: [
      { compound: "Chloromethane" },
      { compound: "Ethane", reagent: "Na, dry ether (Wurtz)", type: "Substitution" },
    ],
  },
  // ---- Chapter 3: Alcohols -----------------------------------------------
  {
    chapter: 3,
    name: "Ethanol to Ethanoic Acid",
    description: "Oxidise the alcohol through the aldehyde to the acid.",
    steps: [
      { compound: "Ethanol" },
      { compound: "Ethanal", reagent: "PCC", type: "Oxidation" },
      { compound: "Ethanoic Acid", reagent: "KMnO₄", type: "Oxidation" },
    ],
  },
  {
    chapter: 3,
    name: "Ethanol to Ethene",
    description: "Acid-catalysed dehydration gives the alkene.",
    steps: [
      { compound: "Ethanol" },
      { compound: "Ethene", reagent: "conc. H₂SO₄, 443 K", type: "Elimination" },
    ],
  },
  // ---- Chapter 4: Aldehydes & Ketones ------------------------------------
  {
    chapter: 4,
    name: "Ethanal to Ethanol",
    description: "Reduce the aldehyde back to the primary alcohol.",
    steps: [
      { compound: "Ethanal" },
      { compound: "Ethanol", reagent: "NaBH₄", type: "Reduction" },
    ],
  },
  {
    chapter: 4,
    name: "Ethanal to Ethane",
    description: "Clemmensen reduction strips the carbonyl to a CH₂.",
    steps: [
      { compound: "Ethanal" },
      { compound: "Ethane", reagent: "Zn-Hg / HCl (Clemmensen)", type: "Reduction" },
    ],
  },
  // ---- Chapter 5: Carboxylic Acids ---------------------------------------
  {
    chapter: 5,
    name: "Ethanoic Acid to Ethanol",
    description: "Strong reduction takes the acid all the way to the alcohol.",
    steps: [
      { compound: "Ethanoic Acid" },
      { compound: "Ethanol", reagent: "LiAlH₄", type: "Reduction" },
    ],
  },
  {
    chapter: 5,
    name: "Ethanoic Acid to Chloroethane",
    description: "Reduce, then substitute the hydroxyl for chlorine.",
    steps: [
      { compound: "Ethanoic Acid" },
      { compound: "Ethanol", reagent: "LiAlH₄", type: "Reduction" },
      { compound: "Chloroethane", reagent: "SOCl₂", type: "Substitution" },
    ],
  },

  // ---- Third pathway per chapter (Sprint 8 §8.6: ≥3 pathways/chapter) -----
  {
    chapter: 1,
    name: "Ethyne to Ethanal",
    description: "Hydration of an alkyne gives the aldehyde.",
    steps: [
      { compound: "Ethyne" },
      { compound: "Ethanal", reagent: "H₂O / HgSO₄, H₂SO₄", type: "Addition" },
    ],
  },
  {
    chapter: 2,
    name: "Bromoethane to Butane",
    description: "Wurtz coupling joins two ethyl units.",
    steps: [
      { compound: "Bromoethane" },
      { compound: "Butane", reagent: "Na, dry ether (Wurtz)", type: "Substitution" },
    ],
  },
  {
    chapter: 3,
    name: "Ethanol to Ethyl ethanoate",
    description: "Oxidise to the acid, then esterify back with ethanol.",
    steps: [
      { compound: "Ethanol" },
      { compound: "Ethanoic Acid", reagent: "KMnO₄ / H⁺", type: "Oxidation" },
      { compound: "Ethyl ethanoate", reagent: "C₂H₅OH / H₂SO₄", type: "Substitution" },
    ],
  },
  {
    chapter: 4,
    name: "Propanone to Propan-2-ol",
    description: "Reduce the ketone to a secondary alcohol.",
    steps: [
      { compound: "Propanone" },
      { compound: "Propan-2-ol", reagent: "NaBH₄", type: "Reduction" },
    ],
  },
  {
    chapter: 5,
    name: "Ethanoic Acid to Ethanamide",
    description: "Via the ammonium salt, then dehydration.",
    steps: [
      { compound: "Ethanoic Acid" },
      { compound: "Ammonium ethanoate", reagent: "NH₃", type: "Substitution" },
      { compound: "Ethanamide", reagent: "heat (−H₂O)", type: "Elimination" },
    ],
  },
];

async function main() {
  const { db } = await import("../db");
  const { categories, reactionTypes, reactionPathways, pathwaySteps } =
    await import("../db/schema");
  const { eq, and } = await import("drizzle-orm");

  // Resolve category order_index → id and reaction type name → id.
  const catRows = await db
    .select({ id: categories.id, orderIndex: categories.orderIndex })
    .from(categories);
  const catId = new Map(catRows.map((c) => [c.orderIndex, c.id]));

  const typeRows = await db
    .select({ id: reactionTypes.id, name: reactionTypes.name })
    .from(reactionTypes);
  const typeId = new Map(typeRows.map((t) => [t.name, t.id]));

  let created = 0;
  for (const spec of PATHWAYS) {
    const categoryId = catId.get(spec.chapter);
    if (!categoryId) {
      console.warn(`! skipping "${spec.name}" — no category for chapter ${spec.chapter}`);
      continue;
    }

    const [existing] = await db
      .select({ id: reactionPathways.id })
      .from(reactionPathways)
      .where(
        and(
          eq(reactionPathways.categoryId, categoryId),
          eq(reactionPathways.name, spec.name)
        )
      )
      .limit(1);
    if (existing) continue;

    const [pathway] = await db
      .insert(reactionPathways)
      .values({
        name: spec.name,
        classLevel: spec.chapter <= 5 ? "11" : "12",
        categoryId,
        description: spec.description,
      })
      .returning({ id: reactionPathways.id });

    await db.insert(pathwaySteps).values(
      spec.steps.map((s, i) => ({
        pathwayId: pathway.id,
        stepOrder: i,
        compoundName: s.compound,
        reagentUsed: s.reagent ?? null,
        reactionTypeId: s.type ? typeId.get(s.type) ?? null : null,
      }))
    );
    created++;
    console.log(`+ pathway "${spec.name}" (chapter ${spec.chapter}, ${spec.steps.length} steps)`);
  }

  console.log(`✅ Pathway seed complete (${created} new).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Pathway seed failed:", err);
    process.exit(1);
  });
