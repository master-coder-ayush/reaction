import { loadEnvLocal } from "./load-env";

loadEnvLocal();

// Sprint 8 §8.6 — pre-populate the Reaction of the Day for 30 days from "today"
// (the server's local date). Cycles through available reactions, varying the
// pick per day. Idempotent: one row per date (unique index), skipped if present.
//
// NOTE: This script is now REDUNDANT for keeping the feature working.
// `resolveDailyReaction` (lib/daily-reaction.ts) deterministically derives a
// Reaction of the Day for *any* date when no curated `dailyChallenges` row
// exists, so every day always has a reaction without pre-seeding — and there's
// no 30-day window to run out of (which is what caused the "No reaction is set
// for today" gap). Kept only as an optional tool for hand-curating specific
// days (a curated row still takes precedence over the deterministic fallback).

function dateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function main() {
  const { db } = await import("../db");
  const { reactions, dailyChallenges } = await import("../db/schema");
  const { eq } = await import("drizzle-orm");

  const reactionRows = await db.select({ id: reactions.id }).from(reactions);
  if (reactionRows.length === 0) {
    console.log("No reactions to schedule — seed reactions first.");
    process.exit(0);
  }
  const ids = reactionRows.map((r) => r.id);

  const today = new Date();
  let created = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const challengeDate = dateString(d);

    const [existing] = await db
      .select({ id: dailyChallenges.id })
      .from(dailyChallenges)
      .where(eq(dailyChallenges.challengeDate, challengeDate))
      .limit(1);
    if (existing) continue;

    // Vary the reaction per day; offset by a stride so consecutive days differ.
    const reactionId = ids[(i * 7) % ids.length];
    await db
      .insert(dailyChallenges)
      .values({ reactionId, challengeDate })
      .onConflictDoNothing({ target: dailyChallenges.challengeDate });
    created++;
  }

  console.log(`✅ Daily challenge seed complete (${created} new days).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Daily challenge seed failed:", err);
    process.exit(1);
  });
