import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { addPlannedMeal, clearWeek, listPlannedMeals } from "../../lib/plan/repository";
import { listShoppingChecklist, setShoppingChecked } from "../../lib/shopping/checklist-repository";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./test.db" }, root));
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    await client.execute("INSERT INTO app_users (id) VALUES ('owner'), ('other')");
    await client.execute("INSERT INTO global_foods (id, name, unit, reference_amount, calories) VALUES ('rice', 'Rice', 'g', 100, 100)");
    await client.execute("INSERT INTO meals (id, user_id, name, serving_yield) VALUES ('meal', 'owner', 'Dinner', 2), ('secret', 'other', 'Other', 2)");
    await client.execute("INSERT INTO meal_ingredients (id, meal_id, position, amount, global_food_id) VALUES ('line', 'meal', 0, 200, 'rice'), ('foreign-line', 'secret', 0, 100, 'rice')");
    assert.equal((await addPlannedMeal(client, "owner", "meal", { weekday: "0", servings: "1" })).ok, true);
    assert.equal((await addPlannedMeal(client, "other", "secret", { weekday: "1", servings: "1" })).ok, true);
    assert.equal(await setShoppingChecked(client, "owner", "global", "rice", true), true);
    assert.equal(await setShoppingChecked(client, "other", "global", "rice", true), true);
    await client.execute("CREATE TRIGGER prevent_check_delete BEFORE DELETE ON shopping_checks WHEN OLD.user_id = 'owner' BEGIN SELECT RAISE(ABORT, 'simulated failure'); END");
    await assert.rejects(clearWeek(client, "owner"));
    assert.equal((await listPlannedMeals(client, "owner")).length, 1);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, true);
    await client.execute("DROP TRIGGER prevent_check_delete");
    await clearWeek(client, "owner");
    assert.deepEqual(await listPlannedMeals(client, "owner"), []);
    assert.deepEqual(await listShoppingChecklist(client, "owner"), []);
    assert.equal((await listPlannedMeals(client, "other")).length, 1);
    assert.equal((await listShoppingChecklist(client, "other"))[0].checked, true);
    assert.equal((await client.execute("SELECT COUNT(*) AS count FROM meals WHERE id = 'meal'")).rows[0]?.count, 1);
    assert.equal((await addPlannedMeal(client, "owner", "meal", { weekday: "0", servings: "1" })).ok, true);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, false);
    await clearWeek(client, "owner");
    await client.execute("INSERT INTO shopping_checks (user_id, food_source, food_id, observed_amount) VALUES ('owner', 'global', 'rice', 100)");
    await clearWeek(client, "owner");
    assert.equal((await client.execute("SELECT COUNT(*) AS count FROM shopping_checks WHERE user_id = 'owner'")).rows[0]?.count, 0);
  } finally { client.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
