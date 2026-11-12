import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { addPlannedMeal, removePlannedMeal, updatePlannedMeal } from "../../lib/plan/repository";
import { listShoppingChecklist, setShoppingChecked } from "../../lib/shopping/checklist-repository";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./test.db" }, root));
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    await client.execute("INSERT INTO app_users (id) VALUES ('owner')");
    await client.execute("INSERT INTO global_foods (id, name, unit, reference_amount, calories) VALUES ('food', 'Rice', 'g', 100, 100)");
    await client.execute("INSERT INTO meals (id, user_id, name, serving_yield) VALUES ('meal', 'owner', 'Dinner', 2)");
    await client.execute("INSERT INTO meal_ingredients (id, meal_id, position, amount, global_food_id) VALUES ('line', 'meal', 0, 200, 'food')");
    const first = await addPlannedMeal(client, "owner", "meal", { weekday: "0", servings: "1" });
    assert.equal(first.ok, true);
    if (!first.ok) return;
    assert.equal(await setShoppingChecked(client, "owner", "global", "food", true), true);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, true);
    assert.equal((await updatePlannedMeal(client, "owner", first.id, { servings: "1" })).ok, true);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, true);
    assert.equal((await updatePlannedMeal(client, "owner", first.id, { servings: "0.5" })).ok, true);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, true);
    assert.equal((await updatePlannedMeal(client, "owner", first.id, { servings: "0.75" })).ok, true);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, false);
    assert.equal(await setShoppingChecked(client, "owner", "global", "food", true), true);
    assert.equal((await updatePlannedMeal(client, "owner", first.id, { servings: "0.5" })).ok, true);
    assert.equal((await updatePlannedMeal(client, "owner", first.id, { servings: "0.75" })).ok, true);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, false);
    assert.equal(await setShoppingChecked(client, "owner", "global", "food", true), true);
    const second = await addPlannedMeal(client, "owner", "meal", { weekday: "1", servings: "1" });
    assert.equal(second.ok, true);
    if (!second.ok) return;
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, false);
    assert.equal(await setShoppingChecked(client, "owner", "global", "food", true), true);
    assert.equal(await removePlannedMeal(client, "owner", second.id), true);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, true);
    assert.equal(await removePlannedMeal(client, "owner", first.id), true);
    assert.deepEqual(await listShoppingChecklist(client, "owner"), []);
    assert.equal((await client.execute("SELECT COUNT(*) AS count FROM shopping_checks")).rows[0]?.count, 0);
    assert.equal((await addPlannedMeal(client, "owner", "meal", { weekday: "0", servings: "1" })).ok, true);
    assert.equal((await listShoppingChecklist(client, "owner"))[0].checked, false);
  } finally { client.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
