import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Import after env is loaded so db/index.ts sees DATABASE_URL.
async function main() {
  const { db } = await import("../db");
  const { reactionTypes, categories, badges } = await import("../db/schema");
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

  console.log("✅ Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
