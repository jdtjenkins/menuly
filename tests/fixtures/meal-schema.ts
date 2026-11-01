import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./test.db" }, root));
  try {
    const migrations = await loadMigrations(join(process.cwd(), "migrations"));
    assert.deepEqual(await applyMigrations(client, migrations), migrations.map((migration) => migration.id));
    assert.deepEqual(await applyMigrations(client, migrations), []);
    await client.execute("INSERT INTO app_users (id) VALUES ('owner')");
    await client.execute("INSERT INTO global_foods (id, name, unit, reference_amount) VALUES ('food', 'Food', 'g', 100)");
    await client.execute("INSERT INTO meals (id, user_id, name, serving_yield) VALUES ('meal', 'owner', 'Dinner', 2)");
    await client.execute("INSERT INTO meal_ingredients (id, meal_id, position, amount, global_food_id) VALUES ('line', 'meal', 0, 50, 'food')");
    await assert.rejects(client.execute("INSERT INTO meal_ingredients (id, meal_id, position, amount, global_food_id) VALUES ('bad', 'meal', 1, 0, 'food')"));
    await assert.rejects(client.execute("INSERT INTO meal_ingredients (id, meal_id, position, amount, global_food_id, personal_food_id) VALUES ('bad', 'meal', 1, 1, 'food', 'other')"));
    await assert.rejects(client.execute("DELETE FROM global_foods WHERE id = 'food'"));
    await client.execute("DELETE FROM app_users WHERE id = 'owner'");
    assert.equal((await client.execute("SELECT COUNT(*) AS count FROM meal_ingredients")).rows[0].count, 0);
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
