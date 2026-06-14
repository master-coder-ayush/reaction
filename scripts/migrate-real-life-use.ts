import { loadEnvLocal } from "./load-env";
loadEnvLocal();

async function main() {
  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(process.env.DATABASE_URL!);
  await sql`ALTER TABLE reactions ADD COLUMN IF NOT EXISTS real_life_use text`;
  console.log("Column real_life_use added (or already existed).");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
