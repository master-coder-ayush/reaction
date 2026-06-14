import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Seeds real_life_use text for all existing reactions.

const DATA: Record<string, string> = {
  // Hydrocarbons
  "Ethene → Ethane (Hydrogenation)":
    "Used industrially to convert vegetable oils (containing C=C double bonds) into solid margarine and cooking fats via catalytic hydrogenation.",
  "Ethene → 1,2-Dibromoethane":
    "1,2-Dibromoethane was historically used as a fuel additive (anti-knock agent) and is still used as a fumigant in soil treatment for nematodes.",
  "Propene → 2-Bromopropane (Markovnikov)":
    "Alkyl halides like 2-bromopropane are key intermediates in pharmaceutical synthesis — used to introduce isopropyl groups into drug molecules.",
  "Ethyne → Ethene (Partial Reduction)":
    "Lindlar-catalyst reduction is used in the synthesis of natural pheromones and insect attractants where cis-double bond geometry is critical.",
  "Benzene → Bromobenzene":
    "Bromobenzene is a reagent in Grignard reactions and is used to manufacture pharmaceuticals, agrochemicals, and flame retardants.",
  "Sodium Ethanoate → Methane (Decarboxylation)":
    "Decarboxylation is used industrially to produce methane (biogas) from organic acids, and in amino acid metabolism in living cells.",

  // Haloalkanes
  "Bromoethane → Ethanol":
    "Hydrolysis of haloalkanes is a key step in producing industrial alcohols and in the breakdown of organohalide pollutants in the environment.",
  "Bromoethane → Ethene (Elimination)":
    "Elimination reactions are used to manufacture alkenes (ethene, propene) that serve as monomers for plastics like polyethylene and polypropylene.",
  "Bromoethane → Propanenitrile":
    "Nitrile synthesis via haloalkanes is used to make nylon-6,6 precursors (adiponitrile) and pharmaceutical intermediates.",
  "Bromoethane → Ethanamine":
    "Amines produced this way are used in drug synthesis — antihistamines, local anaesthetics, and neurotransmitter analogues all contain amine groups.",
  "Chloroethane → Butane (Wurtz)":
    "The Wurtz reaction was historically used to build carbon chains; today it inspires organolithium and Grignard coupling strategies in fine chemical synthesis.",
  "Chlorobenzene → Phenol (Dow Process)":
    "The Dow Process produces phenol at industrial scale — phenol is the starting material for aspirin, bisphenol-A (plastics), and antiseptics like TCP.",

  // Alcohols, Phenols, Ethers
  "Bromoethane → Ethanol (Hydrolysis)":
    "Hydrolysis of haloalkanes is a key step in producing industrial alcohols and in the breakdown of organohalide pollutants in the environment.",
  "Bromoethane → Ethene (Dehydrohalogenation)":
    "Dehydrohalogenation is used to manufacture alkenes that serve as monomers for plastics, and in the synthesis of drugs with C=C bonds.",
  "Ethanol → Ethanal (Mild Oxidation)":
    "This reaction occurs in your liver when you metabolise alcohol — alcohol dehydrogenase converts ethanol to ethanal (acetaldehyde), which causes hangover symptoms.",
  "Ethanol → Ethene (Dehydration)":
    "Industrial ethanol dehydration over Al₂O₃ produces ethene for making polyethylene — one of the world's most produced plastics.",
  "Ethanol → Ethyl chloride":
    "Ethyl chloride is used as a local anaesthetic spray (coolant) in sports medicine to numb skin instantly before minor procedures.",
  "Phenol → 2,4,6-Tribromophenol":
    "2,4,6-Tribromophenol is a widely used flame retardant added to electronics circuit boards, textiles, and building materials.",
  "Phenol → Salicylaldehyde (Reimer–Tiemann)":
    "Salicylaldehyde is used in perfumery (violet-like scent) and as a chelating agent in analytical chemistry.",
  "Phenol → Salicylic acid (Kolbe)":
    "Salicylic acid is converted to aspirin (acetylsalicylic acid) — the world's most widely used painkiller. Also used in acne treatments and skin peels.",
  "Diethyl ether (Williamson Synthesis)":
    "Diethyl ether produced via Williamson synthesis was the first general anaesthetic used in surgery (1846) and is still used as a solvent in labs.",

  // Aldehydes, Ketones, Carboxylic Acids
  "Propanone → Propan-2-ol (Reduction)":
    "Propan-2-ol (isopropanol/IPA) is the active ingredient in hand sanitisers, rubbing alcohol, and disinfectant wipes.",
  "Ethanoic acid → Ethanol (Reduction)":
    "Reduction of carboxylic acids to alcohols is used in the biosynthesis of fatty alcohols found in cosmetics, lotions, and emulsifiers.",
  "Ethanoic acid → Ethanoyl chloride":
    "Ethanoyl chloride (acetyl chloride) is used to introduce acetyl groups in drug synthesis — aspirin and paracetamol are made via acetylation.",
  "Ethanoic acid → Ethanamide":
    "Amide bond formation is the basis of peptide (protein) synthesis and the production of paracetamol (acetaminophen) — a common painkiller.",
  "Ethanoic acid → Methane (Decarboxylation)":
    "Decarboxylation of organic acids is exploited in biogas digesters to produce methane fuel from food and agricultural waste.",
  "Ethanoic acid → Chloroethanoic acid (HVZ)":
    "Chloroacetic acid produced by HVZ reaction is used to make the herbicide 2,4-D, carboxymethylcellulose (food thickener E466), and cosmetic preservatives.",
  "Ethanol → Ethanoic acid (Strong Oxidation)":
    "Vinegar is 5–8% ethanoic acid made by oxidising ethanol in fermented liquids — used for centuries as a food preservative and condiment.",
  "Ethanoic acid → Ethyl ethanoate (Esterification)":
    "Ethyl ethanoate (ethyl acetate) is used as a solvent in nail polish remover, printing inks, adhesives, and as a flavour in confectionery.",
  "Ethanoyl chloride → Ethanal (Rosenmund)":
    "The Rosenmund reduction is used in pharmaceutical synthesis to make aldehydes selectively — without over-reducing to the alcohol.",
  "Ethanoic acid → Sodium ethanoate":
    "Sodium ethanoate is used in hand warmers (supersaturated solution that crystallises exothermically), food preservation (E262), and as a buffer in biochemistry labs.",
};

async function main() {
  const { db } = await import("../db");
  const { reactions } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

  let updated = 0;
  for (const [name, realLifeUse] of Object.entries(DATA)) {
    const result = await db
      .update(reactions)
      .set({ realLifeUse })
      .where(eq(reactions.name, name));
    if ((result as any).rowCount > 0) updated++;
  }
  console.log(`Updated ${updated} reactions with real_life_use.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
