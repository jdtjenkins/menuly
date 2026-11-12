import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { listShoppingItems } from "../../lib/shopping/repository";
import { listShoppingChecklist, setShoppingChecked } from "../../lib/shopping/checklist-repository";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./test.db" }, root));
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    await client.execute("INSERT INTO app_users (id) VALUES ('owner'), ('other')");
    await client.execute("INSERT INTO global_foods (id, name, unit, reference_amount, calories) VALUES ('g', 'Oats', 'g', 100, 100), ('drink', 'Milk', 'ml', 100, 100)");
    await client.execute("INSERT INTO personal_foods (id, user_id, name, unit, reference_amount, calories, archived_at) VALUES ('mine', 'owner', 'Oats', 'g', 100, 100, '2026-01-01'), ('theirs', 'other', 'Private', 'g', 100, 100, NULL)");
    await client.execute("INSERT INTO meals (id, user_id, name, serving_yield) VALUES ('meal', 'owner', 'Breakfast', 4), ('secret', 'other', 'Secret', 2)");
    await client.execute("INSERT INTO meal_ingredients (id, meal_id, position, amount, global_food_id, personal_food_id) VALUES ('a', 'meal', 0, 300, 'g', NULL), ('b', 'meal', 1, 100, NULL, 'mine'), ('c', 'meal', 2, 200, 'drink', NULL), ('d', 'secret', 0, 500, NULL, 'theirs')");
    await client.execute("INSERT INTO planned_meals (id, user_id, meal_id, weekday, servings) VALUES ('card', 'owner', 'meal', 0, 2), ('foreign', 'other', 'secret', 0, 1)");
    assert.deepEqual(await listShoppingItems(client, "owner"), [
      { source: "global", foodId: "drink", name: "Milk", unit: "ml", amount: 100 },
      { source: "global", foodId: "g", name: "Oats", unit: "g", amount: 150 },
      { source: "personal", foodId: "mine", name: "Oats", unit: "g", amount: 50 },
    ]);
    assert.deepEqual(await listShoppingItems(client, "other"), [{ source: "personal", foodId: "theirs", name: "Private", unit: "g", amount: 250 }]);
    assert.equal(await setShoppingChecked(client, "owner", "global", "g", true), true);
    assert.equal(await setShoppingChecked(client, "owner", "personal", "mine", true), true);
    assert.equal((await listShoppingChecklist(client, "owner")).filter((item) => item.checked).length, 2);
    assert.equal((await listShoppingChecklist(client, "other"))[0].checked, false);
    assert.equal(await setShoppingChecked(client, "owner", "personal", "theirs", true), false);
    assert.equal(await setShoppingChecked(client, "owner", "global", "absent", true), false);
    assert.equal(await setShoppingChecked(client, "owner", "global", "g", false), true);
    assert.equal((await listShoppingChecklist(client, "owner")).find((item) => item.foodId === "g")?.checked, false);
    assert.equal((await listShoppingChecklist(client, "owner")).find((item) => item.foodId === "mine")?.checked, true);
    await client.execute("UPDATE personal_foods SET name = 'Archived oats' WHERE id = 'mine'");
    assert.equal((await listShoppingChecklist(client, "owner")).find((item) => item.foodId === "mine")?.checked, true);
    await client.execute("UPDATE meals SET serving_yield = 2 WHERE id = 'meal'");
    assert.deepEqual((await listShoppingItems(client, "owner")).map(({ name, amount }) => [name, amount]), [["Archived oats", 100], ["Milk", 200], ["Oats", 300]]);
    await client.execute("DELETE FROM planned_meals WHERE id = 'card'");
    assert.deepEqual(await listShoppingItems(client, "owner"), []);
  } finally { client.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
