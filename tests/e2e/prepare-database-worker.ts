import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";

async function prepareDatabase() {
  const config = parseDatabaseConfig({ DATABASE_URL: "file:./data/menuly-google-auth-playwright.db" });
  const client = createDatabaseClient(config);
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    await client.execute("DELETE FROM app_users");
    await client.execute("INSERT OR IGNORE INTO app_users (id) VALUES ('playwright-other-account')");
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations", "development")), "development_seed_migrations");
    for (let i = 1; i <= 25; i++) {
      const suffix = String(i).padStart(2, "0");
      await client.execute({
        sql: `INSERT OR IGNORE INTO global_foods
          (id, name, unit, reference_amount, calories, protein, carbohydrates, fat)
          VALUES (?, ?, 'g', 100, 100, 1, 1, 1)`,
        args: [`e2e-${suffix}`, `Test food ${suffix}`],
      });
    }
    await client.execute({
      sql: `INSERT OR IGNORE INTO global_foods
        (id, name, unit, reference_amount, calories, protein, carbohydrates, fat)
        VALUES (?, ?, 'ml', 100, NULL, NULL, 0, 0)`,
      args: ["e2e-missing-calories", "Test food missing calories"],
    });
  } finally {
    client.close();
  }
}

prepareDatabase().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
