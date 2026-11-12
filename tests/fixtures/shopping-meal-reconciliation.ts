import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { saveMeal } from "../../lib/meals/repository";
import { addPlannedMeal } from "../../lib/plan/repository";
import { listShoppingChecklist, setShoppingChecked } from "../../lib/shopping/checklist-repository";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./test.db" }, root));
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    await client.execute("INSERT INTO app_users (id) VALUES ('owner')");
    await client.execute("INSERT INTO global_foods (id, name, unit, reference_amount, calories) VALUES ('rice', 'Rice', 'g', 100, 100), ('oats', 'Oats', 'g', 100, 100)");
    const input = { name: "Dinner", servingYield: "2", lines: [{ source: "global", foodId: "rice", amount: "100" }] };
    const meal = await saveMeal(client, "owner", input);
    assert.equal(meal.ok, true);
    if (!meal.ok) return;
    assert.equal((await addPlannedMeal(client, "owner", meal.id, { weekday: "0", servings: "1" })).ok, true);
    assert.equal(await setShoppingChecked(client, "owner", "global", "rice", true), true);
    assert.equal((await saveMeal(client, "owner", { ...input, servingYield: "4" }, meal.id)).ok, true);
    assert.deepEqual((await listShoppingChecklist(client, "owner")).map(({ amount, checked }) => [amount, checked]), [[25, true]]);
    assert.equal((await saveMeal(client, "owner", { ...input, servingYield: "4", lines: [{ source: "global", foodId: "rice", amount: "120" }] }, meal.id)).ok, true);
    assert.deepEqual((await listShoppingChecklist(client, "owner")).map(({ amount, checked }) => [amount, checked]), [[30, false]]);
    assert.equal(await setShoppingChecked(client, "owner", "global", "rice", true), true);
    assert.equal((await saveMeal(client, "owner", { ...input, servingYield: "4", lines: [{ source: "global", foodId: "oats", amount: "60" }, { source: "global", foodId: "oats", amount: "40" }] }, meal.id)).ok, true);
    assert.deepEqual((await listShoppingChecklist(client, "owner")).map(({ foodId, amount, checked }) => [foodId, amount, checked]), [["oats", 25, false]]);
    assert.equal((await client.execute("SELECT COUNT(*) AS count FROM shopping_checks")).rows[0]?.count, 0);
    assert.equal(await setShoppingChecked(client, "owner", "global", "oats", true), true);
    assert.equal((await saveMeal(client, "owner", { ...input, servingYield: "4", lines: [{ source: "global", foodId: "oats", amount: "60" }, { source: "global", foodId: "oats", amount: "60" }] }, meal.id)).ok, true);
    assert.deepEqual((await listShoppingChecklist(client, "owner")).map(({ amount, checked }) => [amount, checked]), [[30, false]]);
    assert.equal(await setShoppingChecked(client, "owner", "global", "oats", true), true);
    assert.equal((await saveMeal(client, "owner", { ...input, servingYield: "0" }, meal.id)).ok, false);
    assert.deepEqual((await listShoppingChecklist(client, "owner")).map(({ amount, checked }) => [amount, checked]), [[30, true]]);
  } finally { client.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
