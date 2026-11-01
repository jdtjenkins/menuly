import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";

async function main() {
  const projectRoot = process.argv[2];
  assert.ok(projectRoot);
  const client = createDatabaseClient(parseDatabaseConfig({}, projectRoot));
  try {
    const migrations = await loadMigrations(join(process.cwd(), "migrations"));
    assert.deepEqual(await applyMigrations(client, migrations), ["0001_global-foods", "0002_accounts", "0003_personal-foods", "0004_personal-food-archive"]);
    const emptyCatalog = await client.execute("SELECT COUNT(*) AS total FROM global_foods");
    assert.equal(emptyCatalog.rows[0].total, 0, "The shared schema migration must not insert development foods");
    const insert = `INSERT INTO global_foods
      (id, name, unit, reference_amount, calories, protein, carbohydrates, fat)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await client.execute({ sql: insert, args: ["food-1", "Apple", "g", 100, 52, null, 14, 0] });
    const result = await client.execute("SELECT * FROM global_foods WHERE id = 'food-1'");
    assert.equal(result.rows[0].name, "Apple");
    assert.equal(result.rows[0].protein, null);
    assert.equal(result.rows[0].fat, 0);
    for (const args of [
      ["", "Apple", "g", 100, 52, 0, 0, 0],
      ["food-2", "  ", "g", 100, 52, 0, 0, 0],
      ["food-2", "Pear", "oz", 100, 52, 0, 0, 0],
      ["food-2", "Pear", "g", 0, 52, 0, 0, 0],
      ["food-2", "Pear", "g", 100, -1, 0, 0, 0],
      ["food-2", "Pear", "g", 100, 52, -1, 0, 0],
    ]) {
      await assert.rejects(client.execute({ sql: insert, args }));
    }
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
