import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Sprint 4 §4.1 — Module 2 "Name the Reaction" content entry. Seeds all 18 named
// reactions from PLAN.md §"Named Reactions". Each row is flagged
// `is_name_reaction = true` and carries a 4-option `name`-type MCQ (the correct
// reaction name plus three plausible named-reaction distractors) along with the
// `story_text` and `why_text` shown after the answer.
//
// Idempotent: skips any reaction whose `name` already exists.

type SeededOption = { text: string; correct?: boolean };
type SeededNamedReaction = {
  name: string;
  category: string; // category.name (must already exist)
  reactionType: string; // reactionTypes.name
  difficulty: number;
  questionText: string;
  equationText: string;
  nameReactionLabel: string;
  /** The 4 name options; the one flagged `correct` is the answer. */
  options: SeededOption[];
  storyText: string;
  whyText: string;
};

// All named reactions live under the chapters that exist today (orderIndex 1-5).
// Aromatic/aldehyde/amine named reactions are grouped into the nearest seeded
// chapter so Module 2 is playable end-to-end before Sprint 5 adds chapters 6-8.
const DATA: SeededNamedReaction[] = [
  // --------------------------- Hydrocarbons (1) ---------------------------
  {
    name: "Wurtz Reaction (Coupling)",
    category: "Hydrocarbons",
    reactionType: "Substitution",
    difficulty: 2,
    questionText: "Name this reaction.",
    equationText: "2 CH₃CH₂Br + 2 Na --dry ether--> CH₃CH₂CH₂CH₃ + 2 NaBr",
    nameReactionLabel: "Wurtz",
    options: [
      { text: "Wurtz Reaction", correct: true },
      { text: "Kolbe Reaction" },
      { text: "Sandmeyer Reaction" },
      { text: "Clemmensen Reduction" },
    ],
    storyText:
      "Two haloalkanes meet sodium in dry ether and couple into a single, longer alkane — the Wurtz reaction, a classic way to build a symmetrical chain.",
    whyText:
      "Sodium reduces each C–X bond to a reactive organosodium intermediate, which then couples with a second molecule to form a new C–C bond.",
  },
  {
    name: "Friedel-Crafts Alkylation",
    category: "Hydrocarbons",
    reactionType: "Electrophilic",
    difficulty: 2,
    questionText: "Name this reaction.",
    equationText: "C₆H₆ + CH₃Cl --AlCl₃--> C₆H₅CH₃ + HCl",
    nameReactionLabel: "Friedel-Crafts Alkylation",
    options: [
      { text: "Friedel-Crafts Alkylation", correct: true },
      { text: "Friedel-Crafts Acylation" },
      { text: "Wurtz Reaction" },
      { text: "Reimer-Tiemann Reaction" },
    ],
    storyText:
      "AlCl₃ rips a chloride off chloromethane to make a methyl carbocation, which the benzene ring attacks — installing a methyl group to give toluene.",
    whyText:
      "AlCl₃ is a Lewis acid that generates the electrophilic carbocation; the aromatic π cloud then substitutes a ring hydrogen for the alkyl group.",
  },
  {
    name: "Friedel-Crafts Acylation",
    category: "Hydrocarbons",
    reactionType: "Electrophilic",
    difficulty: 2,
    questionText: "Name this reaction.",
    equationText: "C₆H₆ + CH₃COCl --AlCl₃--> C₆H₅COCH₃ + HCl",
    nameReactionLabel: "Friedel-Crafts Acylation",
    options: [
      { text: "Friedel-Crafts Acylation", correct: true },
      { text: "Friedel-Crafts Alkylation" },
      { text: "Etard Reaction" },
      { text: "Kolbe Reaction" },
    ],
    storyText:
      "AlCl₃ helps acetyl chloride shed a chloride to form an acylium ion, which the benzene ring attacks — giving the aryl ketone acetophenone.",
    whyText:
      "The resonance-stabilised acylium ion (CH₃CO⁺) is the electrophile; unlike alkylation, it can't rearrange, so acylation gives a clean single product.",
  },
  {
    name: "Hell-Volhard-Zelinsky Reaction",
    category: "Hydrocarbons",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Name this reaction.",
    equationText: "CH₃COOH + Br₂ --red P--> CH₂BrCOOH + HBr",
    nameReactionLabel: "Hell-Volhard-Zelinsky",
    options: [
      { text: "Hell-Volhard-Zelinsky Reaction", correct: true },
      { text: "Hunsdiecker Reaction" },
      { text: "Wurtz Reaction" },
      { text: "Kolbe Reaction" },
    ],
    storyText:
      "With a trace of red phosphorus, a carboxylic acid is halogenated right at the α-carbon — the Hell-Volhard-Zelinsky reaction, a route to α-halo acids.",
    whyText:
      "Phosphorus converts the acid to an acyl bromide, whose enol is far more reactive toward Br₂ at the α-position than the acid itself.",
  },

  // --------------------------- Haloalkanes (2) ----------------------------
  {
    name: "Sandmeyer Reaction",
    category: "Haloalkanes",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Name this reaction.",
    equationText: "C₆H₅N₂⁺Cl⁻ --CuCl--> C₆H₅Cl + N₂",
    nameReactionLabel: "Sandmeyer",
    options: [
      { text: "Sandmeyer Reaction", correct: true },
      { text: "Balz-Schiemann Reaction" },
      { text: "Hoffmann Bromamide Reaction" },
      { text: "Rosenmund Reduction" },
    ],
    storyText:
      "A diazonium salt meets cuprous chloride and the –N₂⁺ group is swapped for a chlorine, releasing nitrogen gas — the Sandmeyer reaction.",
    whyText:
      "The Cu(I) salt catalyses a radical substitution: the C–N₂⁺ bond breaks, N₂ leaves, and the halide takes its place on the ring.",
  },
  {
    name: "Balz-Schiemann Reaction",
    category: "Haloalkanes",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Name this reaction.",
    equationText: "C₆H₅N₂⁺BF₄⁻ --Δ--> C₆H₅F + N₂ + BF₃",
    nameReactionLabel: "Balz-Schiemann",
    options: [
      { text: "Balz-Schiemann Reaction", correct: true },
      { text: "Sandmeyer Reaction" },
      { text: "Finkelstein Reaction" },
      { text: "Wurtz Reaction" },
    ],
    storyText:
      "To put fluorine on a ring, a diazonium tetrafluoroborate is simply heated — it decomposes to the fluoroarene, nitrogen, and BF₃: the Balz-Schiemann reaction.",
    whyText:
      "Cuprous salts can't deliver fluoride well, so the dry fluoroborate salt is thermally decomposed instead, releasing F to the aromatic carbon.",
  },

  // ------------------------ Alcohols, Phenols (3) -------------------------
  {
    name: "Reimer-Tiemann Reaction",
    category: "Alcohols",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Name this reaction.",
    equationText: "C₆H₅OH + CHCl₃ + NaOH --> 2-OHC-C₆H₄-OH (salicylaldehyde)",
    nameReactionLabel: "Reimer-Tiemann",
    options: [
      { text: "Reimer-Tiemann Reaction", correct: true },
      { text: "Kolbe Reaction" },
      { text: "Cannizzaro Reaction" },
      { text: "Friedel-Crafts Acylation" },
    ],
    storyText:
      "Phenol, chloroform, and base together graft a –CHO group onto the ring's ortho position, turning phenol into salicylaldehyde — the Reimer-Tiemann reaction.",
    whyText:
      "Base generates dichlorocarbene (:CCl₂), an electrophile the phenoxide ring attacks ortho; hydrolysis then unmasks the aldehyde.",
  },
  {
    name: "Kolbe's Reaction (Kolbe-Schmitt)",
    category: "Alcohols",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Name this reaction.",
    equationText: "C₆H₅ONa + CO₂ --400K, pressure--> 2-HO-C₆H₄-COONa",
    nameReactionLabel: "Kolbe",
    options: [
      { text: "Kolbe's Reaction", correct: true },
      { text: "Reimer-Tiemann Reaction" },
      { text: "Cannizzaro Reaction" },
      { text: "Aldol Condensation" },
    ],
    storyText:
      "Sodium phenoxide is treated with carbon dioxide under pressure, planting a –COOH ortho to the –OH — giving salicylic acid (the aspirin precursor).",
    whyText:
      "The phenoxide ring is electron-rich enough to attack CO₂ as a weak electrophile, carboxylating the ortho carbon.",
  },

  // --------------------- Aldehydes & Ketones (4) -------------------------
  {
    name: "Cannizzaro Reaction",
    category: "Aldehydes & Ketones",
    reactionType: "Reduction",
    difficulty: 2,
    questionText: "Name this reaction.",
    equationText: "2 HCHO + NaOH --> CH₃OH + HCOONa",
    nameReactionLabel: "Cannizzaro",
    options: [
      { text: "Cannizzaro Reaction", correct: true },
      { text: "Aldol Condensation" },
      { text: "Clemmensen Reduction" },
      { text: "Wolff-Kishner Reduction" },
    ],
    storyText:
      "An aldehyde with no α-hydrogen (like formaldehyde) can't self-condense, so in strong base one molecule oxidises another: one becomes an alcohol, the other an acid salt.",
    whyText:
      "Lacking α-H, the only path is a disproportionation — hydride transfers from one carbonyl to another, oxidising one and reducing the other.",
  },
  {
    name: "Aldol Condensation",
    category: "Aldehydes & Ketones",
    reactionType: "Addition",
    difficulty: 2,
    questionText: "Name this reaction.",
    equationText: "2 CH₃CHO --dil. NaOH--> CH₃CH(OH)CH₂CHO",
    nameReactionLabel: "Aldol",
    options: [
      { text: "Aldol Condensation", correct: true },
      { text: "Cannizzaro Reaction" },
      { text: "Etard Reaction" },
      { text: "Stephen Reaction" },
    ],
    storyText:
      "Two aldehyde molecules with α-hydrogens join in dilute base: one's enolate attacks the other's carbonyl, giving a β-hydroxy aldehyde (the aldol).",
    whyText:
      "Base removes an acidic α-hydrogen to form an enolate nucleophile, which adds to a second carbonyl carbon — a C–C bond-forming addition.",
  },
  {
    name: "Tollens' Test (Silver Mirror)",
    category: "Aldehydes & Ketones",
    reactionType: "Oxidation",
    difficulty: 1,
    questionText: "Name this test.",
    equationText: "RCHO + 2[Ag(NH₃)₂]⁺ + 3OH⁻ --> RCOO⁻ + 2Ag↓ + ...",
    nameReactionLabel: "Tollens",
    options: [
      { text: "Tollens' Test", correct: true },
      { text: "Fehling's Test" },
      { text: "Cannizzaro Reaction" },
      { text: "Etard Reaction" },
    ],
    storyText:
      "An aldehyde reduces Tollens' reagent (ammoniacal silver nitrate), depositing metallic silver as a bright mirror on the tube — the classic aldehyde test.",
    whyText:
      "The aldehyde is oxidised to a carboxylate while Ag⁺ is reduced to Ag⁰; ketones can't do this, so the test distinguishes the two.",
  },
  {
    name: "Fehling's Test",
    category: "Aldehydes & Ketones",
    reactionType: "Oxidation",
    difficulty: 1,
    questionText: "Name this test.",
    equationText: "RCHO + 2Cu²⁺ + 5OH⁻ --> RCOO⁻ + Cu₂O↓ (red) + 3H₂O",
    nameReactionLabel: "Fehling",
    options: [
      { text: "Fehling's Test", correct: true },
      { text: "Tollens' Test" },
      { text: "Aldol Condensation" },
      { text: "Rosenmund Reduction" },
    ],
    storyText:
      "An aliphatic aldehyde warmed with Fehling's solution reduces blue Cu²⁺ to a brick-red precipitate of Cu₂O — a colourful aldehyde test.",
    whyText:
      "The aldehyde is oxidised to a carboxylate while Cu²⁺ is reduced to Cu⁺ (as red Cu₂O); aromatic aldehydes and ketones don't respond.",
  },
  {
    name: "Clemmensen Reduction",
    category: "Aldehydes & Ketones",
    reactionType: "Reduction",
    difficulty: 2,
    questionText: "Name this reaction.",
    equationText: "R₂C=O --Zn(Hg)/conc.HCl--> R₂CH₂",
    nameReactionLabel: "Clemmensen",
    options: [
      { text: "Clemmensen Reduction", correct: true },
      { text: "Wolff-Kishner Reduction" },
      { text: "Rosenmund Reduction" },
      { text: "Cannizzaro Reaction" },
    ],
    storyText:
      "A carbonyl group is wiped all the way down to a –CH₂– using zinc amalgam and concentrated HCl — the Clemmensen reduction, ideal for acid-stable molecules.",
    whyText:
      "Under strongly acidic conditions the amalgamated zinc supplies electrons that fully reduce C=O to CH₂; basic substrates instead use Wolff-Kishner.",
  },
  {
    name: "Wolff-Kishner Reduction",
    category: "Aldehydes & Ketones",
    reactionType: "Reduction",
    difficulty: 2,
    questionText: "Name this reaction.",
    equationText: "R₂C=O --NH₂NH₂, KOH/Δ--> R₂CH₂ + N₂",
    nameReactionLabel: "Wolff-Kishner",
    options: [
      { text: "Wolff-Kishner Reduction", correct: true },
      { text: "Clemmensen Reduction" },
      { text: "Stephen Reaction" },
      { text: "Etard Reaction" },
    ],
    storyText:
      "A carbonyl is converted to a hydrazone, then heated with base to expel nitrogen and leave a –CH₂– — the Wolff-Kishner reduction, the basic-conditions counterpart to Clemmensen.",
    whyText:
      "Hydrazine forms the hydrazone; hot base then drives off N₂, reducing C=O to CH₂ without acid — useful for acid-sensitive compounds.",
  },
  {
    name: "Rosenmund Reduction",
    category: "Aldehydes & Ketones",
    reactionType: "Reduction",
    difficulty: 2,
    questionText: "Name this reaction.",
    equationText: "RCOCl + H₂ --Pd/BaSO₄--> RCHO + HCl",
    nameReactionLabel: "Rosenmund",
    options: [
      { text: "Rosenmund Reduction", correct: true },
      { text: "Stephen Reaction" },
      { text: "Clemmensen Reduction" },
      { text: "Etard Reaction" },
    ],
    storyText:
      "An acyl chloride is hydrogenated over poisoned palladium so the reduction stops cleanly at the aldehyde rather than over-reducing — the Rosenmund reduction.",
    whyText:
      "Pd is poisoned with BaSO₄ (and sometimes sulfur/quinoline) to weaken it, halting reduction at –CHO instead of carrying on to –CH₂OH.",
  },
  {
    name: "Stephen Reaction",
    category: "Aldehydes & Ketones",
    reactionType: "Reduction",
    difficulty: 3,
    questionText: "Name this reaction.",
    equationText: "RCN --SnCl₂/HCl--> RCH=NH --H₃O⁺--> RCHO",
    nameReactionLabel: "Stephen",
    options: [
      { text: "Stephen Reaction", correct: true },
      { text: "Rosenmund Reduction" },
      { text: "Etard Reaction" },
      { text: "Sandmeyer Reaction" },
    ],
    storyText:
      "A nitrile is partly reduced by stannous chloride and HCl to an imine, which hydrolyses on workup to the aldehyde — the Stephen reaction.",
    whyText:
      "SnCl₂/HCl delivers just enough hydride to stop at the imine salt; aqueous workup then hydrolyses it cleanly to –CHO.",
  },
  {
    name: "Etard Reaction",
    category: "Aldehydes & Ketones",
    reactionType: "Oxidation",
    difficulty: 3,
    questionText: "Name this reaction.",
    equationText: "C₆H₅CH₃ --CrO₂Cl₂, then H₃O⁺--> C₆H₅CHO",
    nameReactionLabel: "Etard",
    options: [
      { text: "Etard Reaction", correct: true },
      { text: "Stephen Reaction" },
      { text: "Rosenmund Reduction" },
      { text: "Reimer-Tiemann Reaction" },
    ],
    storyText:
      "Toluene's methyl group is oxidised by chromyl chloride only as far as the aldehyde — via a stable chromium complex — giving benzaldehyde: the Etard reaction.",
    whyText:
      "The chromyl chloride forms an isolable complex at the benzylic carbon that, on hydrolysis, gives the aldehyde rather than over-oxidising to the acid.",
  },

  // ------------------------- Carboxylic Acids (5) ------------------------
  {
    name: "Hoffmann Bromamide Degradation",
    category: "Carboxylic Acids",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Name this reaction.",
    equationText: "RCONH₂ + Br₂ + 4NaOH --> RNH₂ + Na₂CO₃ + 2NaBr + 2H₂O",
    nameReactionLabel: "Hoffmann Bromamide",
    options: [
      { text: "Hoffmann Bromamide Degradation", correct: true },
      { text: "Sandmeyer Reaction" },
      { text: "Stephen Reaction" },
      { text: "Cannizzaro Reaction" },
    ],
    storyText:
      "A primary amide treated with bromine and strong base loses a carbon (as carbonate) and becomes a primary amine with one fewer carbon — the Hoffmann bromamide degradation.",
    whyText:
      "Base and Br₂ form an N-bromoamide that rearranges via an isocyanate; the alkyl group migrates to nitrogen, shortening the chain by one carbon.",
  },
];

async function main() {
  const { db } = await import("../db");
  const { reactions, reactionOptions, reactionTypes, categories } = await import(
    "../db/schema"
  );

  const typeRows = await db.select().from(reactionTypes);
  const catRows = await db.select().from(categories);
  if (typeRows.length === 0 || catRows.length === 0) {
    throw new Error(
      "Run `npm run db:seed` first to seed reaction types & categories."
    );
  }
  const typeId = (name: string) => {
    const t = typeRows.find((r) => r.name === name);
    if (!t) throw new Error(`Missing reaction type: ${name}`);
    return t.id;
  };
  const catId = (name: string) => {
    const c = catRows.find((r) => r.name === name);
    if (!c) throw new Error(`Missing category: ${name}`);
    return c.id;
  };

  const existing = new Set(
    (await db.select({ name: reactions.name }).from(reactions)).map((r) => r.name)
  );

  let inserted = 0;
  for (const r of DATA) {
    if (existing.has(r.name)) {
      console.log(`• skip (exists): ${r.name}`);
      continue;
    }

    const [row] = await db
      .insert(reactions)
      .values({
        name: r.name,
        categoryId: catId(r.category),
        reactionTypeId: typeId(r.reactionType),
        board: "Both",
        classLevel: "11",
        difficulty: r.difficulty,
        questionText: r.questionText,
        equationText: r.equationText,
        storyText: r.storyText,
        whyText: r.whyText,
        isNameReaction: true,
        nameReactionLabel: r.nameReactionLabel,
      })
      .returning({ id: reactions.id });

    await db.insert(reactionOptions).values(
      r.options.map((o, i) => ({
        reactionId: row.id,
        optionType: "name" as const,
        text: o.text,
        isCorrect: !!o.correct,
        displayOrder: i + 1,
      }))
    );

    inserted++;
    console.log(`✓ ${r.name}`);
  }

  console.log(
    `\n✅ Done. Inserted ${inserted} new named reaction(s) (of ${DATA.length}).`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("seed-named-reactions failed:", err);
    process.exit(1);
  });
