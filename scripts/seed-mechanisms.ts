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
  // ── Chapter 1: Hydrocarbons ──────────────────────────────────────────────
  {
    chapter: 1,
    name: "Electrophilic Aromatic Substitution: Bromination of Benzene",
    type: "Electrophilic Aromatic Sub.",
    difficulty: 2,
    diagram: "C₆H₆  +  Br₂  →(FeBr₃)  C₆H₅—Br  +  HBr",
    story:
      "FeBr₃ activates Br₂ to form the electrophile Br⁺. The π system of benzene attacks Br⁺ forming a resonance-stabilised arenium ion (Wheland intermediate); a proton is then lost to restore aromaticity.",
    slots: [
      { key: "el", label: "Electrophile", x: 20, y: 50 },
      { key: "wi", label: "Arenium Ion", x: 52, y: 65 },
      { key: "rp", label: "Reprotonation", x: 82, y: 45 },
    ],
    distractors: ["Carbocation", "Leaving Group"],
  },
  {
    chapter: 1,
    name: "Free Radical Halogenation: Chlorination of Methane",
    type: "Free Radical Halogenation",
    difficulty: 2,
    diagram: "CH₄  +  Cl₂  →(hν)  CH₃Cl  +  HCl",
    story:
      "UV light homolyticly cleaves Cl₂ into two Cl• radicals (initiation). A Cl• abstracts an H from CH₄ giving CH₃• (propagation step 1); CH₃• then reacts with Cl₂ to give CH₃Cl and regenerate Cl• (propagation step 2). Two radicals combine to terminate the chain.",
    slots: [
      { key: "in", label: "Initiation", x: 18, y: 50 },
      { key: "pr", label: "Propagation", x: 52, y: 65 },
      { key: "te", label: "Termination", x: 84, y: 50 },
    ],
    distractors: ["Electrophile", "Nucleophile"],
  },
  // ── Chapter 2: Haloalkanes ───────────────────────────────────────────────
  {
    chapter: 2,
    name: "Nucleophilic Addition-Elimination: Amine + Acyl Chloride",
    type: "Nucleophilic Add-Elimination",
    difficulty: 3,
    diagram: "R—COCl  +  NH₃  →  R—CO—NH₂  +  HCl",
    story:
      "The amine nitrogen (nucleophile) attacks the carbonyl carbon forming a tetrahedral intermediate (addition step). The C–Cl bond then breaks and Cl⁻ departs (elimination step), restoring the C=O of the amide.",
    slots: [
      { key: "nu", label: "Nucleophile", x: 16, y: 55 },
      { key: "ti", label: "Tetrahedral Intermediate", x: 50, y: 65 },
      { key: "lg", label: "Leaving Group", x: 84, y: 50 },
    ],
    distractors: ["Carbocation", "Electrophile"],
  },
  // ── Chapter 3: Alcohols, Phenols, Ethers ────────────────────────────────
  {
    chapter: 3,
    name: "Acid-Catalyzed Dehydration of Ethanol",
    type: "Acid-Catalyzed Dehydration",
    difficulty: 2,
    diagram: "CH₃—CH₂—OH  →(H₂SO₄, 170°C)  CH₂=CH₂  +  H₂O",
    story:
      "H⁺ protonates the hydroxyl group, converting it into a good leaving group (H₂O). A carbocation forms after water departs; a base then abstracts a β-hydrogen, forming the alkene via an E1 pathway.",
    slots: [
      { key: "pr", label: "Protonation", x: 18, y: 55 },
      { key: "cc", label: "Carbocation", x: 52, y: 65 },
      { key: "el", label: "Elimination", x: 84, y: 50 },
    ],
    distractors: ["Nucleophile", "Bond Breaks"],
  },
  {
    chapter: 3,
    name: "Williamson Ether Synthesis",
    type: "Williamson Ether Synthesis",
    difficulty: 2,
    diagram: "R—O⁻  +  R′—X  →  R—O—R′  +  X⁻",
    story:
      "An alkoxide ion (strong nucleophile) displaces a halide from a primary haloalkane in an SN2 reaction. The oxygen lone pair attacks the electrophilic carbon backside, inverting configuration and forming the ether bond.",
    slots: [
      { key: "nu", label: "Alkoxide (Nucleophile)", x: 14, y: 55 },
      { key: "ec", label: "Electrophilic Carbon", x: 50, y: 55 },
      { key: "lg", label: "Leaving Group", x: 84, y: 55 },
    ],
    distractors: ["Carbocation", "Arenium Ion"],
  },
  // ── Chapter 4: Aldehydes & Ketones ───────────────────────────────────────
  {
    chapter: 4,
    name: "Nucleophilic Addition to Carbonyl: HCN to Ethanal",
    type: "Nucleophilic Addition",
    difficulty: 2,
    diagram: "CH₃CHO  +  HCN  →  CH₃CH(OH)CN",
    story:
      "The cyanide ion (CN⁻) attacks the electrophilic carbonyl carbon, breaking the π bond and forming an alkoxide intermediate. The alkoxide is protonated by HCN to give the cyanohydrin product.",
    slots: [
      { key: "nu", label: "Nucleophile (CN⁻)", x: 16, y: 55 },
      { key: "ec", label: "Carbonyl Carbon", x: 50, y: 60 },
      { key: "pr", label: "Protonation", x: 84, y: 50 },
    ],
    distractors: ["Leaving Group", "Carbocation"],
  },
  {
    chapter: 4,
    name: "Aldol Condensation: Acetaldehyde",
    type: "Aldol Condensation",
    difficulty: 3,
    diagram: "2 CH₃CHO  →(NaOH)  CH₃CH(OH)CH₂CHO  →(-H₂O)  CH₃CH=CHCHO",
    story:
      "Base removes an α-hydrogen forming an enolate (nucleophile). The enolate attacks the carbonyl carbon of a second aldehyde molecule (aldol addition). Heating promotes dehydration of the β-hydroxy aldehyde to give the α,β-unsaturated carbonyl (condensation).",
    slots: [
      { key: "en", label: "Enolate", x: 18, y: 55 },
      { key: "ad", label: "Aldol Addition", x: 52, y: 65 },
      { key: "dh", label: "Dehydration", x: 84, y: 50 },
    ],
    distractors: ["Carbocation", "Leaving Group"],
  },
  // ── Chapter 5: Carboxylic Acids ──────────────────────────────────────────
  {
    chapter: 5,
    name: "Fischer Esterification: Acetic Acid + Ethanol",
    type: "Esterification",
    difficulty: 2,
    diagram: "CH₃COOH  +  C₂H₅OH  ⇌(H⁺)  CH₃COOC₂H₅  +  H₂O",
    story:
      "H⁺ protonates the carbonyl oxygen activating the acid. Ethanol oxygen attacks the carbonyl carbon forming a tetrahedral intermediate. After proton transfers, water departs and the ester bond forms (reversible — excess alcohol drives equilibrium).",
    slots: [
      { key: "pr", label: "Protonation", x: 16, y: 55 },
      { key: "ti", label: "Tetrahedral Intermediate", x: 50, y: 65 },
      { key: "lg", label: "Water Departure", x: 84, y: 50 },
    ],
    distractors: ["Enolate", "Carbocation"],
  },
  {
    chapter: 5,
    name: "HVZ Reaction: Bromination of Propanoic Acid",
    type: "HVZ Reaction",
    difficulty: 3,
    diagram: "CH₃CH₂COOH  +  Br₂  →(P, then H₂O)  CH₃CHBrCOOH  +  HBr",
    story:
      "Red phosphorus and Br₂ generate PBr₃ in situ, which converts the acid to an acyl bromide. Br₂ then brominates the α-carbon via an enol intermediate. Hydrolysis of the acyl bromide gives the α-bromo carboxylic acid.",
    slots: [
      { key: "ab", label: "Acyl Bromide", x: 18, y: 55 },
      { key: "en", label: "Enol Intermediate", x: 52, y: 65 },
      { key: "hy", label: "Hydrolysis", x: 84, y: 50 },
    ],
    distractors: ["Carbocation", "Leaving Group"],
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
