import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Import after env is loaded so db/index.ts sees DATABASE_URL.
async function main() {
  const { db } = await import("../db");
  const {
    reactionTypes,
    categories,
    badges,
    reactions,
    reactionOptions,
    dailyChallenges,
  } = await import("../db/schema");
  const { sql } = await import("drizzle-orm");

  // Idempotent: if reaction types already exist, assume seeding ran before.
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reactionTypes);
  if (count > 0) {
    console.log("Reaction types already seeded — skipping all seed data.");
    return;
  }

  console.log("Seeding reaction types…");
  await db
    .insert(reactionTypes)
    .values([
      { name: "Addition", color: "blue", description: "Atoms add across a double/triple bond." },
      { name: "Substitution", color: "purple", description: "One group replaces another." },
      { name: "Elimination", color: "orange", description: "Atoms removed to form a multiple bond." },
      { name: "Oxidation", color: "red", description: "Loss of electrons / addition of oxygen." },
      { name: "Reduction", color: "green", description: "Gain of electrons / addition of hydrogen." },
      { name: "Nucleophilic", color: "teal", description: "Electron-rich species attacks." },
      { name: "Electrophilic", color: "yellow", description: "Electron-poor species attacks." },
    ]);

  console.log("Seeding categories…");
  await db
    .insert(categories)
    .values([
      { name: "Hydrocarbons", classLevel: "11", orderIndex: 1, description: "Alkanes, Alkenes, Alkynes, Benzene." },
      { name: "Haloalkanes", classLevel: "11", orderIndex: 2, description: "Haloalkanes and Haloarenes." },
      { name: "Alcohols", classLevel: "11", orderIndex: 3, description: "Alcohols, Phenols, and Ethers." },
      { name: "Aldehydes & Ketones", classLevel: "11", orderIndex: 4, description: "Carbonyl chemistry." },
      { name: "Carboxylic Acids", classLevel: "11", orderIndex: 5, description: "Carboxylic acids and derivatives." },
    ]);

  console.log("Seeding badges…");
  await db
    .insert(badges)
    .values([
      { name: "First Reaction", description: "Complete 1 reaction", icon: "🧪", requirementType: "reactions_completed", requirementValue: 1, color: "blue" },
      { name: "On a Roll", description: "3 correct in a row", icon: "🔥", requirementType: "correct_streak", requirementValue: 3, color: "orange" },
      { name: "7-Day Streak", description: "Maintain streak for 7 days", icon: "📆", requirementType: "streak_days", requirementValue: 7, color: "green" },
      { name: "30-Day Streak", description: "Maintain streak for 30 days", icon: "🗓️", requirementType: "streak_days", requirementValue: 30, color: "green" },
      { name: "100-Day Master", description: "Maintain streak for 100 days", icon: "🏆", requirementType: "streak_days", requirementValue: 100, color: "yellow" },
      { name: "Hydrocarbon Hero", description: "Clear Hydrocarbons boss", icon: "⚗️", requirementType: "boss_cleared", requirementValue: 1, color: "blue" },
      { name: "Speed Demon", description: "Score 10+ in a timed challenge", icon: "⚡", requirementType: "timed_score", requirementValue: 10, color: "yellow" },
      { name: "Pathway Pioneer", description: "Complete first pathway challenge", icon: "🧭", requirementType: "pathway_completed", requirementValue: 1, color: "teal" },
      { name: "Card Collector", description: "Unlock 25 reaction cards", icon: "🃏", requirementType: "cards_collected", requirementValue: 25, color: "purple" },
      { name: "Perfect Boss", description: "100% score on any boss level", icon: "💯", requirementType: "perfect_boss", requirementValue: 1, color: "red" },
      { name: "Reaction Ninja", description: "Collect all reaction cards", icon: "🥷", requirementType: "cards_collected_all", requirementValue: 1, color: "purple" },
      { name: "Organic Grandmaster", description: "Reach Level 7", icon: "👑", requirementType: "level_reached", requirementValue: 7, color: "yellow" },
    ]);

  // -------------------------------------------------------------------------
  // Sample reactions + options (enough for the dashboard / Reaction of the Day
  // to render against real rows). Content entry in bulk lands in Sprint 8.
  // -------------------------------------------------------------------------
  console.log("Seeding sample reactions…");

  const typeRows = await db.select().from(reactionTypes);
  const catRows = await db.select().from(categories);
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

  const insertedReactions = await db
    .insert(reactions)
    .values([
      {
        name: "Ethanol → Ethanoic Acid",
        categoryId: catId("Alcohols"),
        reactionTypeId: typeId("Oxidation"),
        board: "Both",
        classLevel: "11",
        difficulty: 2,
        questionText: "Convert Ethanol → Ethanoic Acid. Pick the correct reagent.",
        equationText: "CH₃CH₂OH --[O]--> CH₃COOH",
        hintWrongReagent:
          "H₂/Ni is a reducing agent — it adds hydrogen. This reaction needs oxidation. Try an oxidizing agent.",
        hintWrongProduct: "That's the aldehyde — oxidation pushes further to the acid.",
        storyText:
          "Ethanol meets KMnO₄, a powerful oxidizing agent. It strips two hydrogens, forming an aldehyde then the carboxylic acid.",
        whyText:
          "KMnO₄ has Mn in +7. It accepts electrons from the carbon chain, oxidizing -OH all the way to -COOH.",
        isNameReaction: false,
      },
      {
        name: "Markovnikov Addition to Propene",
        categoryId: catId("Hydrocarbons"),
        reactionTypeId: typeId("Addition"),
        board: "Both",
        classLevel: "11",
        difficulty: 1,
        questionText: "Propene + HBr → ? (Markovnikov)",
        equationText: "CH₃CH=CH₂ + HBr → CH₃CHBrCH₃",
        storyText:
          "H adds to the carbon with more hydrogens; Br lands on the more substituted carbon (the more stable carbocation).",
        whyText: "The 2° carbocation is more stable than the 1°, so Br ends up on C-2.",
        isNameReaction: false,
      },
      {
        name: "Wurtz Reaction",
        categoryId: catId("Hydrocarbons"),
        reactionTypeId: typeId("Substitution"),
        board: "NCERT",
        classLevel: "11",
        difficulty: 3,
        questionText: "Name the reaction: 2 CH₃Br + 2 Na → CH₃CH₃ + 2 NaBr",
        equationText: "2 R-X + 2 Na --dry ether--> R-R + 2 NaX",
        storyText:
          "Two haloalkanes meet sodium in dry ether and couple into a longer alkane — the Wurtz reaction.",
        whyText: "Sodium reduces the C-X bond, generating a radical/organosodium that couples.",
        isNameReaction: true,
        nameReactionLabel: "Wurtz",
      },
    ])
    .returning({ id: reactions.id });

  const [rEthanol, rPropene, rWurtz] = insertedReactions.map((r) => r.id);

  await db.insert(reactionOptions).values([
    // Ethanol → Ethanoic Acid (reagent)
    { reactionId: rEthanol, optionType: "reagent", text: "KMnO₄ / H⁺", isCorrect: true, displayOrder: 1 },
    { reactionId: rEthanol, optionType: "reagent", text: "H₂ / Ni", isCorrect: false, displayOrder: 2 },
    { reactionId: rEthanol, optionType: "reagent", text: "NaBH₄", isCorrect: false, displayOrder: 3 },
    { reactionId: rEthanol, optionType: "reagent", text: "PCl₅", isCorrect: false, displayOrder: 4 },
    // Propene + HBr (product)
    { reactionId: rPropene, optionType: "product", text: "2-Bromopropane", isCorrect: true, displayOrder: 1 },
    { reactionId: rPropene, optionType: "product", text: "1-Bromopropane", isCorrect: false, displayOrder: 2 },
    { reactionId: rPropene, optionType: "product", text: "Propan-2-ol", isCorrect: false, displayOrder: 3 },
    { reactionId: rPropene, optionType: "product", text: "1,2-Dibromopropane", isCorrect: false, displayOrder: 4 },
    // Wurtz (name)
    { reactionId: rWurtz, optionType: "name", text: "Wurtz Reaction", isCorrect: true, displayOrder: 1 },
    { reactionId: rWurtz, optionType: "name", text: "Kolbe Reaction", isCorrect: false, displayOrder: 2 },
    { reactionId: rWurtz, optionType: "name", text: "Sandmeyer Reaction", isCorrect: false, displayOrder: 3 },
    { reactionId: rWurtz, optionType: "name", text: "Friedel-Crafts", isCorrect: false, displayOrder: 4 },
  ]);

  // -------------------------------------------------------------------------
  // Reaction of the Day: pre-seed one challenge per day for a ±10-day window
  // around today, cycling through the sample reactions.
  // -------------------------------------------------------------------------
  console.log("Seeding daily challenges…");

  const cycle = [rEthanol, rPropene, rWurtz];
  const dailyValues: { reactionId: number; challengeDate: string }[] = [];
  const base = new Date();
  for (let offset = -10; offset <= 10; offset++) {
    const d = new Date(base);
    d.setDate(base.getDate() + offset);
    const challengeDate = d.toISOString().slice(0, 10);
    const reactionId = cycle[(offset + 10) % cycle.length];
    dailyValues.push({ reactionId, challengeDate });
  }
  await db
    .insert(dailyChallenges)
    .values(dailyValues)
    .onConflictDoNothing({ target: dailyChallenges.challengeDate });

  console.log("✅ Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
