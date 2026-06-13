import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Sprint 8 §8.6 — full content top-up. Brings every Class 11 chapter (1-5) to
// ≥10 reactions, each with a reagent-type 4-option MCQ plus hint/story/why text.
// Idempotent: skips any reaction whose `name` already exists. Run after the
// earlier seeds (seed.ts, seed-reactions.ts, seed-named-reactions.ts).

type SeededOption = { text: string; correct?: boolean };
type SeededReaction = {
  name: string;
  category: string; // category.name
  reactionType: string; // reactionTypes.name
  difficulty: number;
  questionText: string;
  equationText: string;
  optionType: "reagent" | "product" | "reactant" | "name";
  options: SeededOption[];
  hintWrongReagent?: string;
  storyText: string;
  whyText: string;
};

const DATA: SeededReaction[] = [
  // ----------------------------- Haloalkanes (ch2, +2) --------------------
  {
    name: "Bromoethane → Ethanol (Hydrolysis)",
    category: "Haloalkanes",
    reactionType: "Substitution",
    difficulty: 1,
    questionText: "Convert Bromoethane → Ethanol. Pick the correct reagent.",
    equationText: "CH₃CH₂Br + KOH(aq) → CH₃CH₂OH + KBr",
    optionType: "reagent",
    options: [
      { text: "KOH (aqueous)", correct: true },
      { text: "KOH (alcoholic)" },
      { text: "conc. H₂SO₄" },
      { text: "Na / dry ether" },
    ],
    hintWrongReagent:
      "Aqueous KOH gives substitution (→ alcohol); alcoholic KOH gives elimination (→ alkene). You want the alcohol.",
    storyText:
      "Hydroxide attacks the carbon bearing bromine, displacing Br⁻ in an SN2 step to give ethanol.",
    whyText:
      "In water, OH⁻ acts as a nucleophile rather than a base, so substitution outcompetes elimination.",
  },
  {
    name: "Bromoethane → Ethene (Dehydrohalogenation)",
    category: "Haloalkanes",
    reactionType: "Elimination",
    difficulty: 2,
    questionText: "Convert Bromoethane → Ethene. Pick the correct reagent.",
    equationText: "CH₃CH₂Br + KOH(alc) → CH₂=CH₂ + KBr + H₂O",
    optionType: "reagent",
    options: [
      { text: "KOH (alcoholic)", correct: true },
      { text: "KOH (aqueous)" },
      { text: "aqueous NaCl" },
      { text: "H₂ / Ni" },
    ],
    hintWrongReagent:
      "Alcoholic KOH is a strong base that removes HBr to form a double bond. Aqueous KOH would just substitute.",
    storyText:
      "The base pulls off a β-hydrogen as bromide leaves, forming the C=C double bond of ethene.",
    whyText:
      "In ethanol, OH⁻ behaves as a base (E2), abstracting the β-H anti to the leaving group.",
  },

  // ----------------------------- Alcohols (ch3, +7) -----------------------
  {
    name: "Ethanol → Ethanal (Mild Oxidation)",
    category: "Alcohols",
    reactionType: "Oxidation",
    difficulty: 2,
    questionText: "Convert Ethanol → Ethanal. Pick the correct reagent.",
    equationText: "CH₃CH₂OH + PCC → CH₃CHO",
    optionType: "reagent",
    options: [
      { text: "PCC", correct: true },
      { text: "KMnO₄ / H⁺" },
      { text: "LiAlH₄" },
      { text: "conc. H₂SO₄" },
    ],
    hintWrongReagent:
      "You want to stop at the aldehyde. PCC is mild and does that; KMnO₄ would push on to the acid.",
    storyText:
      "PCC gently removes two hydrogens from the –CH₂OH group to give the aldehyde, ethanal, without over-oxidising.",
    whyText:
      "PCC is anhydrous and mild, so the aldehyde isn't hydrated to the gem-diol that strong oxidisers oxidise further.",
  },
  {
    name: "Ethanol → Ethene (Dehydration)",
    category: "Alcohols",
    reactionType: "Elimination",
    difficulty: 2,
    questionText: "Convert Ethanol → Ethene. Pick the correct reagent.",
    equationText: "CH₃CH₂OH —(conc. H₂SO₄, 443 K)→ CH₂=CH₂ + H₂O",
    optionType: "reagent",
    options: [
      { text: "conc. H₂SO₄, 443 K", correct: true },
      { text: "PCC" },
      { text: "NaBH₄" },
      { text: "Br₂ / CCl₄" },
    ],
    hintWrongReagent:
      "Dehydration needs a hot acid catalyst to remove water and form a double bond, not an oxidiser or reducer.",
    storyText:
      "Hot concentrated sulfuric acid protonates the –OH, water leaves, and a β-H is lost to form ethene.",
    whyText:
      "The acid converts –OH to a better leaving group (–OH₂⁺); E1 elimination then forms the alkene.",
  },
  {
    name: "Ethanol → Ethyl chloride",
    category: "Alcohols",
    reactionType: "Substitution",
    difficulty: 1,
    questionText: "Convert Ethanol → Chloroethane. Pick the correct reagent.",
    equationText: "CH₃CH₂OH + SOCl₂ → CH₃CH₂Cl + SO₂ + HCl",
    optionType: "reagent",
    options: [
      { text: "SOCl₂", correct: true },
      { text: "NaCl" },
      { text: "KMnO₄" },
      { text: "H₂ / Pd" },
    ],
    hintWrongReagent:
      "Replacing –OH with –Cl needs a chlorinating agent like SOCl₂ (clean, gaseous by-products), not a salt.",
    storyText:
      "Thionyl chloride swaps the hydroxyl for chlorine, releasing SO₂ and HCl gases that escape — leaving pure chloroethane.",
    whyText:
      "SOCl₂ converts –OH into a chlorosulfite leaving group, which Cl⁻ then displaces.",
  },
  {
    name: "Phenol → 2,4,6-Tribromophenol",
    category: "Alcohols",
    reactionType: "Substitution",
    difficulty: 2,
    questionText: "Convert Phenol → 2,4,6-Tribromophenol. Pick the correct reagent.",
    equationText: "C₆H₅OH + 3Br₂(aq) → C₆H₂Br₃OH + 3HBr",
    optionType: "reagent",
    options: [
      { text: "Br₂ (aqueous)", correct: true },
      { text: "Br₂ / CCl₄ (cold)" },
      { text: "HBr" },
      { text: "NaBr" },
    ],
    hintWrongReagent:
      "Bromine water brominates the activated ring three times. In CCl₄ (non-polar) you'd get only monobromination.",
    storyText:
      "Phenol's –OH strongly activates the ring; bromine water substitutes at all three ortho/para positions, giving a white precipitate.",
    whyText:
      "The lone pair on oxygen donates into the ring, making it highly reactive to electrophilic Br⁺.",
  },
  {
    name: "Phenol → Salicylaldehyde (Reimer–Tiemann)",
    category: "Alcohols",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Convert Phenol → Salicylaldehyde. Pick the correct reagent.",
    equationText: "C₆H₅OH + CHCl₃ + NaOH → 2-OHC₆H₄CHO",
    optionType: "reagent",
    options: [
      { text: "CHCl₃ + NaOH", correct: true },
      { text: "CO₂ + NaOH" },
      { text: "KMnO₄" },
      { text: "LiAlH₄" },
    ],
    hintWrongReagent:
      "Reimer–Tiemann uses chloroform with base to install a –CHO ortho to the –OH. CO₂/NaOH gives the acid (Kolbe).",
    storyText:
      "Chloroform and base generate dichlorocarbene, which attacks the phenoxide ring ortho to oxygen, giving salicylaldehyde after hydrolysis.",
    whyText:
      "Dichlorocarbene (:CCl₂) is the electrophile; the phenoxide directs it ortho, then hydrolysis gives the aldehyde.",
  },
  {
    name: "Phenol → Salicylic acid (Kolbe)",
    category: "Alcohols",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Convert Phenol → Salicylic acid. Pick the correct reagent.",
    equationText: "C₆H₅ONa + CO₂ —(heat, pressure)→ 2-OHC₆H₄COOH",
    optionType: "reagent",
    options: [
      { text: "CO₂ then H⁺ (Kolbe)", correct: true },
      { text: "CHCl₃ + NaOH" },
      { text: "KMnO₄" },
      { text: "SOCl₂" },
    ],
    hintWrongReagent:
      "Kolbe's reaction carboxylates the phenoxide with CO₂ under pressure. Chloroform/base would give the aldehyde instead.",
    storyText:
      "Sodium phenoxide reacts with carbon dioxide under pressure; the ring picks up –COOH ortho to oxygen, giving salicylic acid after acidification.",
    whyText:
      "The electron-rich phenoxide attacks the electrophilic carbon of CO₂; the ortho product dominates by H-bond stabilisation.",
  },
  {
    name: "Diethyl ether (Williamson Synthesis)",
    category: "Alcohols",
    reactionType: "Substitution",
    difficulty: 2,
    questionText: "Make Diethoxyethane (diethyl ether) from sodium ethoxide. Pick the correct reagent.",
    equationText: "CH₃CH₂ONa + CH₃CH₂Br → CH₃CH₂OCH₂CH₃ + NaBr",
    optionType: "reagent",
    options: [
      { text: "Bromoethane", correct: true },
      { text: "Ethanol" },
      { text: "Ethene" },
      { text: "Ethanoic acid" },
    ],
    hintWrongReagent:
      "Williamson ether synthesis couples an alkoxide with an alkyl halide via SN2. You need the haloalkane partner.",
    storyText:
      "Ethoxide ion attacks the carbon of bromoethane, displacing bromide and forming the C–O–C ether linkage.",
    whyText:
      "The alkoxide is a strong nucleophile; a primary alkyl halide gives clean SN2 ether formation.",
  },

  // ----------------------------- Aldehydes & Ketones (ch4, +1) ------------
  {
    name: "Propanone → Propan-2-ol (Reduction)",
    category: "Aldehydes & Ketones",
    reactionType: "Reduction",
    difficulty: 1,
    questionText: "Convert Propanone → Propan-2-ol. Pick the correct reagent.",
    equationText: "CH₃COCH₃ + NaBH₄ → CH₃CH(OH)CH₃",
    optionType: "reagent",
    options: [
      { text: "NaBH₄", correct: true },
      { text: "KMnO₄" },
      { text: "PCC" },
      { text: "SOCl₂" },
    ],
    hintWrongReagent:
      "Adding hydrogen to a C=O is reduction — NaBH₄ does this gently for ketones. KMnO₄/PCC oxidise instead.",
    storyText:
      "Hydride from NaBH₄ adds to the carbonyl carbon; protonation of the resulting alkoxide gives the secondary alcohol.",
    whyText:
      "NaBH₄ delivers H⁻ to the electrophilic carbonyl carbon, reducing the ketone to a 2° alcohol.",
  },

  // ----------------------------- Carboxylic Acids (ch5, +9) ---------------
  {
    name: "Ethanoic acid → Ethanol (Reduction)",
    category: "Carboxylic Acids",
    reactionType: "Reduction",
    difficulty: 2,
    questionText: "Convert Ethanoic acid → Ethanol. Pick the correct reagent.",
    equationText: "CH₃COOH —(LiAlH₄)→ CH₃CH₂OH",
    optionType: "reagent",
    options: [
      { text: "LiAlH₄", correct: true },
      { text: "NaBH₄" },
      { text: "H₂ / Ni" },
      { text: "KMnO₄" },
    ],
    hintWrongReagent:
      "Only a strong hydride like LiAlH₄ reduces a carboxylic acid; NaBH₄ is too mild and H₂/Ni won't touch –COOH.",
    storyText:
      "LiAlH₄ forces hydride onto the carboxyl carbon, driving it all the way down to the primary alcohol.",
    whyText:
      "LiAlH₄ is a powerful reducing agent that reduces –COOH (and esters, amides) to –CH₂OH.",
  },
  {
    name: "Ethanoic acid → Ethanoyl chloride",
    category: "Carboxylic Acids",
    reactionType: "Substitution",
    difficulty: 2,
    questionText: "Convert Ethanoic acid → Ethanoyl chloride. Pick the correct reagent.",
    equationText: "CH₃COOH + SOCl₂ → CH₃COCl + SO₂ + HCl",
    optionType: "reagent",
    options: [
      { text: "SOCl₂", correct: true },
      { text: "NaCl" },
      { text: "Cl₂ / hv" },
      { text: "PCC" },
    ],
    hintWrongReagent:
      "Converting –COOH to –COCl needs SOCl₂ (or PCl₅), which replaces –OH with –Cl. A salt won't react.",
    storyText:
      "Thionyl chloride turns the acid's –OH into –Cl, releasing SO₂ and HCl gas and leaving the reactive acyl chloride.",
    whyText:
      "SOCl₂ activates the hydroxyl as a leaving group; chloride substitutes to form the acyl chloride.",
  },
  {
    name: "Ethanoic acid → Ethanamide",
    category: "Carboxylic Acids",
    reactionType: "Substitution",
    difficulty: 2,
    questionText: "Convert Ethanoic acid → Ethanamide (via heating its ammonium salt). Pick the correct reagent.",
    equationText: "CH₃COOH + NH₃ → CH₃COONH₄ —(heat)→ CH₃CONH₂ + H₂O",
    optionType: "reagent",
    options: [
      { text: "NH₃, then heat", correct: true },
      { text: "LiAlH₄" },
      { text: "SOCl₂" },
      { text: "KMnO₄" },
    ],
    hintWrongReagent:
      "Amide formation needs ammonia to make the ammonium salt, which loses water on heating. Reducers/oxidisers don't apply.",
    storyText:
      "Ammonia first neutralises the acid to ammonium ethanoate; strong heating then dehydrates it to ethanamide.",
    whyText:
      "Heating the ammonium carboxylate drives off water, forming the C–N amide bond.",
  },
  {
    name: "Ethanoic acid → Methane (Decarboxylation)",
    category: "Carboxylic Acids",
    reactionType: "Elimination",
    difficulty: 2,
    questionText: "Convert Ethanoic acid → Methane (decarboxylation). Pick the correct reagent.",
    equationText: "CH₃COONa + NaOH —(CaO, heat)→ CH₄ + Na₂CO₃",
    optionType: "reagent",
    options: [
      { text: "NaOH / CaO, heat (soda lime)", correct: true },
      { text: "LiAlH₄" },
      { text: "conc. H₂SO₄" },
      { text: "Br₂ / red P" },
    ],
    hintWrongReagent:
      "Decarboxylation of the sodium salt uses soda lime (NaOH + CaO) on heating, removing CO₂ as carbonate.",
    storyText:
      "Heating sodium ethanoate with soda lime knocks out the carboxyl group as carbonate, leaving methane.",
    whyText:
      "Soda lime supplies the base/heat to cleave the C–COO⁻ bond, releasing CO₂ (as Na₂CO₃) and the alkane.",
  },
  {
    name: "Ethanoic acid → Chloroethanoic acid (HVZ)",
    category: "Carboxylic Acids",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Convert Ethanoic acid → Chloroethanoic acid (Hell–Volhard–Zelinsky). Pick the correct reagent.",
    equationText: "CH₃COOH + Cl₂ —(red P)→ ClCH₂COOH + HCl",
    optionType: "reagent",
    options: [
      { text: "Cl₂ / red P", correct: true },
      { text: "Cl₂ / hv" },
      { text: "NaCl" },
      { text: "SOCl₂" },
    ],
    hintWrongReagent:
      "HVZ halogenates the α-carbon using X₂ with red phosphorus. Cl₂/hv would chlorinate randomly, not selectively at α.",
    storyText:
      "Red phosphorus makes the acyl bromide/chloride in situ; its enol picks up chlorine at the α-carbon, giving chloroethanoic acid.",
    whyText:
      "P converts the acid to an acyl halide whose enol is halogenated at the α-position — the HVZ mechanism.",
  },
  {
    name: "Ethanol → Ethanoic acid (Strong Oxidation)",
    category: "Carboxylic Acids",
    reactionType: "Oxidation",
    difficulty: 1,
    questionText: "Convert Ethanol → Ethanoic acid. Pick the correct reagent.",
    equationText: "CH₃CH₂OH —(KMnO₄ / H⁺)→ CH₃COOH",
    optionType: "reagent",
    options: [
      { text: "KMnO₄ / H⁺", correct: true },
      { text: "PCC" },
      { text: "NaBH₄" },
      { text: "H₂ / Ni" },
    ],
    hintWrongReagent:
      "A strong oxidiser (acidified KMnO₄) takes a primary alcohol all the way to the acid; PCC would stop at the aldehyde.",
    storyText:
      "Acidified permanganate strips four hydrogens from ethanol — through ethanal — to give ethanoic acid.",
    whyText:
      "Mn(VII) is a powerful oxidiser; with excess and acid it oxidises 1° alcohols fully to carboxylic acids.",
  },
  {
    name: "Ethanoic acid → Ethyl ethanoate (Esterification)",
    category: "Carboxylic Acids",
    reactionType: "Substitution",
    difficulty: 1,
    questionText: "Convert Ethanoic acid → Ethyl ethanoate. Pick the correct reagent.",
    equationText: "CH₃COOH + C₂H₅OH —(conc. H₂SO₄)→ CH₃COOC₂H₅ + H₂O",
    optionType: "reagent",
    options: [
      { text: "Ethanol / conc. H₂SO₄", correct: true },
      { text: "LiAlH₄" },
      { text: "NaOH (aq)" },
      { text: "SOCl₂" },
    ],
    hintWrongReagent:
      "Esterification (Fischer) needs an alcohol with an acid catalyst. NaOH would just make the salt; LiAlH₄ would reduce.",
    storyText:
      "With a little sulfuric acid, ethanol and ethanoic acid condense — losing water — to give the fruity-smelling ester.",
    whyText:
      "Acid protonates the carbonyl; the alcohol adds and water leaves in a reversible equilibrium driven by excess reagent.",
  },
  {
    name: "Ethanoyl chloride → Ethanal (Rosenmund)",
    category: "Carboxylic Acids",
    reactionType: "Reduction",
    difficulty: 3,
    questionText: "Convert Ethanoyl chloride → Ethanal (Rosenmund reduction). Pick the correct reagent.",
    equationText: "CH₃COCl + H₂ —(Pd/BaSO₄)→ CH₃CHO + HCl",
    optionType: "reagent",
    options: [
      { text: "H₂, Pd/BaSO₄ (poisoned)", correct: true },
      { text: "LiAlH₄" },
      { text: "NaBH₄" },
      { text: "KMnO₄" },
    ],
    hintWrongReagent:
      "Rosenmund uses H₂ over poisoned Pd so reduction stops at the aldehyde. LiAlH₄ would over-reduce to the alcohol.",
    storyText:
      "Hydrogen over palladium poisoned with BaSO₄ reduces the acyl chloride just to the aldehyde — the catalyst is too weak to go further.",
    whyText:
      "Poisoning Pd lowers its activity so the aldehyde isn't reduced on to a primary alcohol.",
  },
  {
    name: "Ethanoic acid → Sodium ethanoate",
    category: "Carboxylic Acids",
    reactionType: "Substitution",
    difficulty: 1,
    questionText: "Convert Ethanoic acid → Sodium ethanoate. Pick the correct reagent.",
    equationText: "CH₃COOH + NaOH → CH₃COONa + H₂O",
    optionType: "reagent",
    options: [
      { text: "NaOH", correct: true },
      { text: "conc. H₂SO₄" },
      { text: "SOCl₂" },
      { text: "LiAlH₄" },
    ],
    hintWrongReagent:
      "Neutralising the acid to its salt just needs a base like NaOH. Acids/reducers do something else entirely.",
    storyText:
      "Sodium hydroxide deprotonates the acid, giving the water-soluble sodium ethanoate salt.",
    whyText:
      "Carboxylic acids are Brønsted acids; a base removes the –COOH proton to form the carboxylate.",
  },
];

async function main() {
  const { db } = await import("../db");
  const { reactions, reactionOptions, reactionTypes, categories } = await import(
    "../db/schema"
  );
  const { eq } = await import("drizzle-orm");

  const typeRows = await db.select().from(reactionTypes);
  const catRows = await db.select().from(categories);
  const typeId = (name: string) => {
    const t = typeRows.find((r) => r.name === name);
    if (!t) throw new Error(`Unknown reaction type: ${name}`);
    return t.id;
  };
  const catId = (name: string) => {
    const c = catRows.find((r) => r.name === name);
    if (!c) throw new Error(`Unknown category: ${name}`);
    return c.id;
  };

  let created = 0;
  for (const r of DATA) {
    const [existing] = await db
      .select({ id: reactions.id })
      .from(reactions)
      .where(eq(reactions.name, r.name))
      .limit(1);
    if (existing) continue;

    const [inserted] = await db
      .insert(reactions)
      .values({
        name: r.name,
        categoryId: catId(r.category),
        reactionTypeId: typeId(r.reactionType),
        classLevel: "11",
        difficulty: r.difficulty,
        questionText: r.questionText,
        equationText: r.equationText,
        hintWrongReagent: r.hintWrongReagent ?? null,
        storyText: r.storyText,
        whyText: r.whyText,
      })
      .returning({ id: reactions.id });

    await db.insert(reactionOptions).values(
      r.options.map((o, i) => ({
        reactionId: inserted.id,
        optionType: r.optionType,
        text: o.text,
        isCorrect: !!o.correct,
        displayOrder: i,
      }))
    );
    created++;
    console.log(`+ reaction "${r.name}"`);
  }

  console.log(`✅ Full reaction seed complete (${created} new).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Full reaction seed failed:", err);
    process.exit(1);
  });
