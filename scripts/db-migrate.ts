import { join } from "node:path";
import { loadEnvConfig } from "@next/env";
import { createDatabaseClient } from "../lib/db/client";
import { parseDatabaseConfig } from "../lib/db/config";
import { applyMigrations, loadMigrations } from "../lib/db/migrations";

async function main() {
  loadEnvConfig(process.cwd());
  const config = parseDatabaseConfig({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  });
  const migrations = await loadMigrations(join(process.cwd(), "migrations"));
  const client = createDatabaseClient(config);
  try {
    const applied = await applyMigrations(client, migrations);
    console.log(`Applied ${applied.length} migration${applied.length === 1 ? "" : "s"}.`);
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Migration failed");
  process.exitCode = 1;
});
