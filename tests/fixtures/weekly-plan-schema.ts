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
    const earlier = migrations.filter((migration) => migration.id !== "0006_weekly-meal-plan");
    assert.deepEqual(await applyMigrations(client, earlier), earlier.map((migration) => migration.id));
    await client.execute("INSERT INTO app_users (id) VALUES ('owner')");
    await client.execute("INSERT INTO meals (id, user_id, name, serving_yield) VALUES ('meal', 'owner', 'Dinner', 2)");
    assert.deepEqual(await applyMigrations(client, migrations), ["0006_weekly-meal-plan"]);
    assert.deepEqual(await applyMigrations(client, migrations), []);
    assert.equal((await client.execute("SELECT name FROM meals WHERE id = 'meal'")).rows[0]?.name, "Dinner");
    await client.execute("INSERT INTO planned_meals (id, user_id, meal_id, weekday, servings) VALUES ('card', 'owner', 'meal', 2, 0.5)");
    for (const [id, weekday, servings] of [["bad-day", 7, 1], ["bad-zero", 0, 0], ["bad-infinity", 0, Infinity]]) {
      await assert.rejects(client.execute({ sql: "INSERT INTO planned_meals (id, user_id, meal_id, weekday, servings) VALUES (?, ?, ?, ?, ?)", args: [id, "owner", "meal", weekday, servings] }));
    }
    await assert.rejects(client.execute("INSERT INTO planned_meals (id, user_id, meal_id, weekday, servings) VALUES ('missing', 'owner', 'absent', 0, 1)"));
    await client.execute("DELETE FROM meals WHERE id = 'meal'");
    assert.equal((await client.execute("SELECT COUNT(*) AS count FROM planned_meals")).rows[0]?.count, 0);
  } finally { client.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
