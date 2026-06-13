import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Sprint 5 seed — adds the data the boss / escape-room features need on top of
// the earlier seeds. Idempotent: every insert is guarded so re-running is safe.
//
//  - Chapters 6-8 categories (Amines, Biomolecules, Named Reactions Master
//    Class) so the full chapter map has content rows.
//  - One "boss clear" badge per chapter (requirement_type `boss_cleared`,
//    requirement_value = chapter id). Hydrocarbon Hero (chapter 1) already
//    exists from the base seed — we only fill the gaps.
//  - "Escape Artist" badge for the Escape Room completion event.
//
// The base "Perfect Boss" badge (requirement_type `perfect_boss`) already exists.

async function main() {
  const { db } = await import("../db");
  const { categories, badges } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

  // ---- Chapters 6-8 categories -------------------------------------------
  const extraCategories = [
    { name: "Amines", classLevel: "12", orderIndex: 6, description: "Amines and diazonium salts." },
    { name: "Biomolecules", classLevel: "12", orderIndex: 7, description: "Carbohydrates, proteins, nucleic acids." },
    { name: "Named Reactions Master Class", classLevel: "12", orderIndex: 8, description: "All the classic named reactions." },
  ];
  for (const cat of extraCategories) {
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.orderIndex, cat.orderIndex))
      .limit(1);
    if (!existing) {
      await db.insert(categories).values(cat);
      console.log(`+ category ${cat.orderIndex}. ${cat.name}`);
    }
  }

  // ---- Boss-clear badges, one per chapter --------------------------------
  // Identified by requirement_value (= chapter id). Chapter 1's badge exists.
  const bossBadges = [
    { chapter: 1, name: "Hydrocarbon Hero", icon: "⚗️", color: "blue" },
    { chapter: 2, name: "Halogen Hotshot", icon: "🧂", color: "purple" },
    { chapter: 3, name: "Alcohol Achiever", icon: "🍶", color: "teal" },
    { chapter: 4, name: "Aldehyde Ace", icon: "🎴", color: "orange" },
    { chapter: 5, name: "Carboxylic Conqueror", icon: "🧴", color: "red" },
    { chapter: 6, name: "Amine Authority", icon: "🧬", color: "green" },
    { chapter: 7, name: "Biomolecule Boss", icon: "🧫", color: "green" },
    { chapter: 8, name: "Named Reaction Nemesis", icon: "📜", color: "yellow" },
  ];

  const existingBoss = await db
    .select({ requirementValue: badges.requirementValue })
    .from(badges)
    .where(eq(badges.requirementType, "boss_cleared"));
  const haveChapter = new Set(existingBoss.map((b) => b.requirementValue));

  for (const b of bossBadges) {
    if (haveChapter.has(b.chapter)) continue;
    await db.insert(badges).values({
      name: b.name,
      description: `Clear the Chapter ${b.chapter} Boss Level`,
      icon: b.icon,
      requirementType: "boss_cleared",
      requirementValue: b.chapter,
      color: b.color,
    });
    console.log(`+ boss badge ${b.name} (chapter ${b.chapter})`);
  }

  // ---- Escape Artist badge -----------------------------------------------
  const [escapeBadge] = await db
    .select({ id: badges.id })
    .from(badges)
    .where(eq(badges.requirementType, "escape_completed"))
    .limit(1);
  if (!escapeBadge) {
    await db.insert(badges).values({
      name: "Escape Artist",
      description: "Escape the Organic Chemistry Lab",
      icon: "🗝️",
      requirementType: "escape_completed",
      requirementValue: 1,
      color: "yellow",
    });
    console.log("+ Escape Artist badge");
  }

  console.log("✅ Sprint 5 seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Sprint 5 seed failed:", err);
    process.exit(1);
  });
