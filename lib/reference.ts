// ---------------------------------------------------------------------------
// Reagent classification reference (PLAN.md §12, Sprint 8 §8.3–8.4). Static,
// authored data — the "cheat sheet" shown on /reference and in the in-question
// drawer. Each reagent is tagged with the reaction-type color it relates to so
// the UI can colour-code consistently with the rest of the app.
//
// `chapters` lists the chapter ids (category order_index) a section is most
// relevant to, so the in-question drawer can show a focused subset.
// ---------------------------------------------------------------------------

export type ReagentEntry = {
  reagent: string;
  note: string;
  // Reaction-type color name (matches reactionColorVar): red/green/blue/...
  color: string;
};

export type ReferenceSection = {
  key: string;
  title: string;
  entries: ReagentEntry[];
  /** Chapter ids this section is most relevant to (empty = all). */
  chapters: number[];
};

export const REFERENCE_SECTIONS: ReferenceSection[] = [
  {
    key: "oxidising",
    title: "Oxidising Agents",
    chapters: [1, 3, 4, 5],
    entries: [
      { reagent: "KMnO₄", note: "Strong oxidiser — alcohols → acids, cleaves double bonds.", color: "red" },
      { reagent: "K₂Cr₂O₇", note: "Strong oxidiser (acidic) — 1° alcohol → acid, 2° → ketone.", color: "red" },
      { reagent: "O₃ (ozonolysis)", note: "Cleaves C=C to two carbonyls.", color: "red" },
      { reagent: "CrO₃", note: "Strong oxidiser; Jones-type oxidations.", color: "red" },
      { reagent: "PCC (mild)", note: "Mild — 1° alcohol → aldehyde (stops there).", color: "red" },
    ],
  },
  {
    key: "reducing",
    title: "Reducing Agents",
    chapters: [2, 4, 5, 6],
    entries: [
      { reagent: "LiAlH₄", note: "Strong — reduces acids, esters, nitriles, carbonyls.", color: "green" },
      { reagent: "NaBH₄", note: "Mild — reduces aldehydes & ketones, not acids/esters.", color: "green" },
      { reagent: "H₂ / Ni", note: "Catalytic hydrogenation of C=C, C≡C.", color: "green" },
      { reagent: "H₂ / Pd", note: "Catalytic hydrogenation; Pd/BaSO₄ (Rosenmund) for acyl chloride → aldehyde.", color: "green" },
    ],
  },
  {
    key: "halogenating",
    title: "Halogenating Agents",
    chapters: [1, 2, 3],
    entries: [
      { reagent: "Cl₂", note: "Free-radical (hv) substitution on alkanes; addition to alkenes.", color: "purple" },
      { reagent: "Br₂", note: "Addition to C=C (decolourises); substitution with hv.", color: "purple" },
      { reagent: "SOCl₂", note: "–OH → –Cl (alcohols, acids → acyl chloride). Clean by-products.", color: "purple" },
      { reagent: "PCl₅", note: "–OH → –Cl; also acids → acyl chlorides.", color: "purple" },
      { reagent: "PBr₃", note: "Alcohols → alkyl bromides.", color: "purple" },
    ],
  },
  {
    key: "bases",
    title: "Bases",
    chapters: [2, 3],
    entries: [
      { reagent: "KOH (aq)", note: "Aqueous → nucleophilic substitution (haloalkane → alcohol).", color: "teal" },
      { reagent: "KOH (alc)", note: "Alcoholic → elimination (haloalkane → alkene).", color: "orange" },
    ],
  },
  {
    key: "nucleophiles",
    title: "Nucleophiles",
    chapters: [2, 4],
    entries: [
      { reagent: "OH⁻", note: "→ alcohols (substitution).", color: "teal" },
      { reagent: "CN⁻", note: "→ nitriles (chain extension by one carbon).", color: "teal" },
      { reagent: "NH₃", note: "→ amines (ammonolysis).", color: "teal" },
      { reagent: "RO⁻", note: "→ ethers (Williamson synthesis).", color: "teal" },
    ],
  },
  {
    key: "electrophiles",
    title: "Electrophiles",
    chapters: [1],
    entries: [
      { reagent: "H⁺", note: "Protonates double bonds (Markovnikov addition).", color: "yellow" },
      { reagent: "Br⁺", note: "Electrophilic bromination of arenes/alkenes.", color: "yellow" },
      { reagent: "NO₂⁺", note: "Nitronium ion — aromatic nitration.", color: "yellow" },
      { reagent: "SO₃", note: "Aromatic sulfonation.", color: "yellow" },
    ],
  },
];

/** Sections relevant to a chapter (those tagged for it, or all if none match). */
export function referenceForChapter(chapterId: number): ReferenceSection[] {
  const focused = REFERENCE_SECTIONS.filter((s) =>
    s.chapters.includes(chapterId)
  );
  return focused.length > 0 ? focused : REFERENCE_SECTIONS;
}
