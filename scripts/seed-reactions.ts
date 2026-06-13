import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Sprint 3 §3.6 — Module 1 content entry. Seeds ≥5 reactions each for the
// Hydrocarbons and Haloalkanes chapters, each with a reagent-type 4-option MCQ
// plus hint / story / why text, so Module 1 can be tested end-to-end.
//
// Idempotent: skips any reaction whose `name` already exists.

type SeededOption = { text: string; correct?: boolean };
type SeededReaction = {
  name: string;
  category: string; // category.name
  reactionType: string; // reactionTypes.name
  difficulty: number;
  questionText: string;
  equationText: string;
  optionType: "reagent" | "product" | "reactant" | "name";
  options: SeededOption[]; // first marked `correct` wins
  hintWrongReagent?: string;
  hintWrongProduct?: string;
  hintWrongReactant?: string;
  storyText: string;
  whyText: string;
  isNameReaction?: boolean;
  nameReactionLabel?: string;
};

const DATA: SeededReaction[] = [
  // ----------------------------- Hydrocarbons -----------------------------
  {
    name: "Ethene → Ethane (Hydrogenation)",
    category: "Hydrocarbons",
    reactionType: "Addition",
    difficulty: 1,
    questionText: "Convert Ethene → Ethane. Pick the correct reagent.",
    equationText: "CH₂=CH₂ + H₂ → CH₃-CH₃",
    optionType: "reagent",
    options: [
      { text: "H₂ / Ni (catalyst)", correct: true },
      { text: "Br₂ / CCl₄" },
      { text: "KMnO₄ / OH⁻" },
      { text: "HBr" },
    ],
    hintWrongReagent:
      "You need to *add hydrogen* across the double bond. Look for H₂ with a metal catalyst, not a halogen or an oxidiser.",
    storyText:
      "Ethene's π bond breaks open over a nickel surface and two hydrogen atoms slot in, giving the saturated alkane ethane.",
    whyText:
      "Ni adsorbs H₂ and the alkene, weakening the H–H and π bonds so hydrogen adds syn across the double bond.",
  },
  {
    name: "Ethene → 1,2-Dibromoethane",
    category: "Hydrocarbons",
    reactionType: "Addition",
    difficulty: 1,
    questionText: "Convert Ethene → 1,2-Dibromoethane. Pick the correct reagent.",
    equationText: "CH₂=CH₂ + Br₂ → BrCH₂-CH₂Br",
    optionType: "reagent",
    options: [
      { text: "Br₂ in CCl₄", correct: true },
      { text: "HBr" },
      { text: "H₂ / Ni" },
      { text: "NaBr" },
    ],
    hintWrongReagent:
      "Two bromine atoms must add — one to each carbon. That points to molecular Br₂, not HBr (which adds only one Br).",
    storyText:
      "The electron-rich double bond attacks Br₂, forming a bromonium ion that's opened by bromide to give the vicinal dibromide. The red-brown bromine colour vanishes — the classic test for unsaturation.",
    whyText:
      "Br₂ is polarised by the π electrons; anti addition through a cyclic bromonium ion places Br on both carbons.",
  },
  {
    name: "Propene → 2-Bromopropane (Markovnikov)",
    category: "Hydrocarbons",
    reactionType: "Addition",
    difficulty: 2,
    questionText: "Convert Propene → 2-Bromopropane. Pick the correct reagent.",
    equationText: "CH₃-CH=CH₂ + HBr → CH₃-CHBr-CH₃",
    optionType: "reagent",
    options: [
      { text: "HBr (no peroxide)", correct: true },
      { text: "HBr / peroxide" },
      { text: "Br₂ / CCl₄" },
      { text: "H₂ / Ni" },
    ],
    hintWrongReagent:
      "Br must land on the *more substituted* carbon (Markovnikov). Peroxides give the anti-Markovnikov product, so leave them out.",
    hintWrongProduct:
      "1-Bromopropane is the anti-Markovnikov product — that needs peroxide. Without it, the 2° carbocation wins.",
    storyText:
      "H⁺ adds first to give the more stable secondary carbocation on C-2; bromide then attaches there, yielding 2-bromopropane.",
    whyText:
      "The 2° carbocation is more stable than the 1°, so the proton adds to the terminal carbon and Br to the middle carbon.",
  },
  {
    name: "Ethyne → Ethene (Partial Reduction)",
    category: "Hydrocarbons",
    reactionType: "Addition",
    difficulty: 2,
    questionText: "Convert Ethyne → Ethene (stop at the alkene). Pick the reagent.",
    equationText: "HC≡CH + H₂ → CH₂=CH₂",
    optionType: "reagent",
    options: [
      { text: "H₂ / Lindlar's catalyst", correct: true },
      { text: "H₂ / Ni" },
      { text: "Na / liquid NH₃" },
      { text: "Br₂ / CCl₄" },
    ],
    hintWrongReagent:
      "You must stop at the alkene. Plain H₂/Ni over-reduces to the alkane — use a *poisoned* catalyst instead.",
    storyText:
      "Lindlar's catalyst (Pd poisoned with quinoline) adds just one molecule of H₂, halting at the cis-alkene rather than the alkane.",
    whyText:
      "The poisoned palladium is too weak to reduce the alkene further, so hydrogenation stops cleanly at ethene.",
  },
  {
    name: "Benzene → Bromobenzene",
    category: "Hydrocarbons",
    reactionType: "Electrophilic",
    difficulty: 2,
    questionText: "Convert Benzene → Bromobenzene. Pick the correct reagent.",
    equationText: "C₆H₆ + Br₂ --FeBr₃--> C₆H₅Br + HBr",
    optionType: "reagent",
    options: [
      { text: "Br₂ / FeBr₃", correct: true },
      { text: "Br₂ / CCl₄ (no catalyst)" },
      { text: "HBr" },
      { text: "NaBr / H₂SO₄" },
    ],
    hintWrongReagent:
      "Benzene's aromatic ring needs a Lewis-acid catalyst to generate the electrophile Br⁺. Plain Br₂ alone won't react.",
    storyText:
      "FeBr₃ polarises Br₂ into Br⁺, which the aromatic π cloud attacks; loss of H⁺ restores aromaticity, giving bromobenzene.",
    whyText:
      "Aromatic stability means benzene substitutes rather than adds — and it needs the stronger Br⁺ electrophile from FeBr₃.",
  },
  {
    name: "Sodium Ethanoate → Methane (Decarboxylation)",
    category: "Hydrocarbons",
    reactionType: "Elimination",
    difficulty: 3,
    questionText: "Convert CH₃COONa → Methane. Pick the correct reagent.",
    equationText: "CH₃COONa + NaOH --CaO,Δ--> CH₄ + Na₂CO₃",
    optionType: "reagent",
    options: [
      { text: "NaOH / CaO, heat (soda lime)", correct: true },
      { text: "Conc. H₂SO₄" },
      { text: "LiAlH₄" },
      { text: "Br₂ / CCl₄" },
    ],
    hintWrongReagent:
      "Decarboxylation of a carboxylate salt uses soda lime (NaOH + CaO) on heating — not an acid or a reducing agent.",
    storyText:
      "Heated with soda lime, sodium ethanoate loses CO₂ (as Na₂CO₃) and the carbon chain shortens by one to give methane.",
    whyText:
      "CaO keeps the NaOH dry and active; the carboxylate's C–C bond breaks, expelling carbon dioxide as carbonate.",
  },

  // ----------------------------- Haloalkanes ------------------------------
  {
    name: "Bromoethane → Ethanol",
    category: "Haloalkanes",
    reactionType: "Nucleophilic",
    difficulty: 1,
    questionText: "Convert Bromoethane → Ethanol. Pick the correct reagent.",
    equationText: "CH₃CH₂Br + OH⁻ → CH₃CH₂OH + Br⁻",
    optionType: "reagent",
    options: [
      { text: "aqueous KOH", correct: true },
      { text: "alcoholic KOH" },
      { text: "KCN" },
      { text: "NH₃" },
    ],
    hintWrongReagent:
      "Substitution to an alcohol needs *aqueous* KOH. Alcoholic KOH would eliminate to give an alkene instead.",
    storyText:
      "Hydroxide ion attacks the carbon bearing bromine from behind, kicking out bromide and installing –OH: bromoethane becomes ethanol.",
    whyText:
      "In water, OH⁻ acts as a nucleophile (SN2). In ethanol it acts as a base, favouring elimination — so the solvent decides.",
  },
  {
    name: "Bromoethane → Ethene (Elimination)",
    category: "Haloalkanes",
    reactionType: "Elimination",
    difficulty: 1,
    questionText: "Convert Bromoethane → Ethene. Pick the correct reagent.",
    equationText: "CH₃CH₂Br --alc. KOH--> CH₂=CH₂ + KBr + H₂O",
    optionType: "reagent",
    options: [
      { text: "alcoholic KOH, heat", correct: true },
      { text: "aqueous KOH" },
      { text: "KCN" },
      { text: "AgNO₃" },
    ],
    hintWrongReagent:
      "To form a double bond you need *alcoholic* KOH (a base). Aqueous KOH would substitute to give an alcohol.",
    storyText:
      "Hot alcoholic KOH pulls off a β-hydrogen as bromide leaves, forming the C=C double bond of ethene — a dehydrohalogenation.",
    whyText:
      "In ethanol, KOH behaves as a strong base and removes a β-H (E2), rather than as a nucleophile attacking carbon.",
  },
  {
    name: "Bromoethane → Propanenitrile",
    category: "Haloalkanes",
    reactionType: "Nucleophilic",
    difficulty: 2,
    questionText: "Convert Bromoethane → Propanenitrile. Pick the correct reagent.",
    equationText: "CH₃CH₂Br + KCN → CH₃CH₂CN + KBr",
    optionType: "reagent",
    options: [
      { text: "KCN (alcoholic)", correct: true },
      { text: "KOH (aqueous)" },
      { text: "AgCN" },
      { text: "NH₃" },
    ],
    hintWrongReagent:
      "To add a carbon as –C≡N you need the cyanide ion from KCN. AgCN would give the isocyanide instead.",
    hintWrongProduct:
      "AgCN bonds through nitrogen and gives an isocyanide (R–NC); KCN bonds through carbon to give the nitrile (R–CN).",
    storyText:
      "Cyanide attacks the carbon, displacing bromide and extending the chain by one carbon — bromoethane becomes propanenitrile.",
    whyText:
      "KCN is largely ionic, so the more nucleophilic carbon of CN⁻ attacks, forming a C–C bond (the nitrile).",
  },
  {
    name: "Bromoethane → Ethanamine",
    category: "Haloalkanes",
    reactionType: "Nucleophilic",
    difficulty: 2,
    questionText: "Convert Bromoethane → Ethanamine. Pick the correct reagent.",
    equationText: "CH₃CH₂Br + NH₃ (excess) → CH₃CH₂NH₂ + HBr",
    optionType: "reagent",
    options: [
      { text: "NH₃ (excess, ethanolic)", correct: true },
      { text: "KCN" },
      { text: "aqueous KOH" },
      { text: "alcoholic KOH" },
    ],
    hintWrongReagent:
      "To install an –NH₂ group, the nucleophile must be ammonia. Use it in excess to limit further alkylation.",
    storyText:
      "Ammonia's lone pair attacks the carbon, displacing bromide; a second NH₃ removes the proton, giving the primary amine ethanamine.",
    whyText:
      "Excess NH₃ ensures the primary amine forms predominantly rather than reacting on to secondary/tertiary amines.",
  },
  {
    name: "Chloroethane → Butane (Wurtz)",
    category: "Haloalkanes",
    reactionType: "Substitution",
    difficulty: 3,
    questionText: "Convert Chloroethane → Butane. Pick the correct reagent.",
    equationText: "2 CH₃CH₂Cl + 2 Na --dry ether--> CH₃CH₂CH₂CH₃ + 2 NaCl",
    optionType: "reagent",
    options: [
      { text: "Na / dry ether", correct: true },
      { text: "alcoholic KOH" },
      { text: "aqueous KOH" },
      { text: "Zn / HCl" },
    ],
    hintWrongReagent:
      "Coupling two haloalkanes into a longer chain is the Wurtz reaction — that needs sodium in dry ether.",
    storyText:
      "Two molecules of chloroethane meet sodium in dry ether and couple, doubling the chain to give butane.",
    whyText:
      "Sodium reduces the C–Cl bond to a reactive organosodium intermediate, which then couples with a second molecule.",
  },
  {
    name: "Chlorobenzene → Phenol (Dow Process)",
    category: "Haloalkanes",
    reactionType: "Nucleophilic",
    difficulty: 3,
    questionText: "Convert Chlorobenzene → Phenol. Pick the correct reagent.",
    equationText: "C₆H₅Cl + NaOH --623K, 300atm--> C₆H₅OH",
    optionType: "reagent",
    options: [
      { text: "NaOH, 623 K, 300 atm", correct: true },
      { text: "aqueous KOH, room temp" },
      { text: "alcoholic KOH" },
      { text: "Na / dry ether" },
    ],
    hintWrongReagent:
      "Aryl halides are very unreactive — substituting Cl on a benzene ring needs harsh conditions: NaOH at high temperature and pressure.",
    storyText:
      "Under extreme heat and pressure, hydroxide finally displaces chloride on the aromatic ring (the Dow process), giving phenol.",
    whyText:
      "The C–Cl bond has partial double-bond character from ring resonance, so only forcing conditions drive substitution.",
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
    throw new Error("Run `npm run db:seed` first to seed reaction types & categories.");
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
        hintWrongReagent: r.hintWrongReagent ?? null,
        hintWrongProduct: r.hintWrongProduct ?? null,
        hintWrongReactant: r.hintWrongReactant ?? null,
        storyText: r.storyText,
        whyText: r.whyText,
        isNameReaction: r.isNameReaction ?? false,
        nameReactionLabel: r.nameReactionLabel ?? null,
      })
      .returning({ id: reactions.id });

    await db.insert(reactionOptions).values(
      r.options.map((o, i) => ({
        reactionId: row.id,
        optionType: r.optionType,
        text: o.text,
        isCorrect: !!o.correct,
        displayOrder: i + 1,
      }))
    );

    inserted++;
    console.log(`✓ ${r.name}`);
  }

  console.log(`\n✅ Done. Inserted ${inserted} new reaction(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("seed-reactions failed:", err);
    process.exit(1);
  });
