import { join } from "node:path";
import { loadEnvConfig } from "@next/env";
import { createDatabaseClient } from "../lib/db/client";
import { parseDatabaseConfig } from "../lib/db/config";
import { assertDevelopmentSeedTarget } from "../lib/db/development-seed";
import { applyMigrations, loadMigrations } from "../lib/db/migrations";

async function main() {
  loadEnvConfig(process.cwd(), true);
  const config = parseDatabaseConfig({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  });
  assertDevelopmentSeedTarget(config, process.env.MENULY_DEV_SEED, process.env.NODE_ENV);
  const schema = await loadMigrations(join(process.cwd(), "migrations"));
  const seed = await loadMigrations(join(process.cwd(), "migrations", "development"));
  const client = createDatabaseClient(config);
  try {
    await applyMigrations(client, schema);
    const applied = await applyMigrations(client, seed, "development_seed_migrations");
    console.log(`Applied ${applied.length} development seed migration${applied.length === 1 ? "" : "s"}.`);
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Development seed failed");
  process.exitCode = 1;
});
