import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { getMeal, listMeals, saveMeal, searchMealFoodChoices } from "../../lib/meals/repository";
import { recipeNutrition } from "../../lib/meals/nutrition";
import { archiveWithMealAcknowledgement, getArchiveImpact } from "../../lib/meals/archive-impact";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./test.db" }, root));
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    await client.execute("INSERT INTO app_users (id) VALUES ('owner'), ('other')");
    await client.execute("INSERT INTO global_foods (id, name, unit, reference_amount, calories) VALUES ('global', 'Rice', 'g', 100, 100)");
    await client.execute("INSERT INTO personal_foods (id, user_id, name, unit, reference_amount, calories) VALUES ('mine', 'owner', 'Milk', 'ml', 100, 50), ('theirs', 'other', 'Secret', 'g', 100, 50)");
    const valid = { name: "Lunch", servingYield: "2", lines: [{ source: "global", foodId: "global", amount: "50" }, { source: "personal", foodId: "mine", amount: "100" }] };
    const created = await saveMeal(client, "owner", valid);
    assert.equal(created.ok, true);
    if (!created.ok) return;
    assert.equal((await listMeals(client, "owner")).length, 1);
    assert.deepEqual(await listMeals(client, "other"), []);
    assert.equal(await getMeal(client, "other", created.id), null);
    assert.equal((await getMeal(client, "owner", created.id))?.lines.length, 2);
    assert.equal(recipeNutrition((await getMeal(client, "owner", created.id))!.lines).calories.value, 100);
    await client.execute("UPDATE personal_foods SET calories = 70 WHERE id = 'mine'");
    assert.equal(recipeNutrition((await getMeal(client, "owner", created.id))!.lines).calories.value, 120);
    assert.deepEqual(await saveMeal(client, "other", valid, created.id), { ok: false, notFound: true });
    assert.equal((await saveMeal(client, "owner", { ...valid, servingYield: "0" })).ok, false);
    assert.equal((await saveMeal(client, "owner", { ...valid, lines: [{ source: "personal", foodId: "theirs", amount: "1" }] })).ok, false);
    assert.equal((await searchMealFoodChoices(client, "owner", "Secret")).length, 0);
    const existing = await getMeal(client, "owner", created.id);
    assert.ok(existing);
    assert.deepEqual(await getArchiveImpact(client, "other", "mine"), null);
    assert.deepEqual(await archiveWithMealAcknowledgement(client, "other", "mine", []), { status: "not-found" });
    await client.execute("INSERT INTO personal_foods (id, user_id, name, unit, reference_amount, calories) VALUES ('unused', 'owner', 'Unused', 'g', 100, 10)");
    assert.deepEqual(await getArchiveImpact(client, "owner", "unused"), []);
    assert.equal((await archiveWithMealAcknowledgement(client, "owner", "unused", [])).status, "archived");
    const impact = await getArchiveImpact(client, "owner", "mine");
    assert.deepEqual(impact, [{ id: created.id, name: "Lunch" }]);
    assert.equal((await archiveWithMealAcknowledgement(client, "owner", "mine", [])).status, "stale");
    const second = await saveMeal(client, "owner", { name: "Dinner", servingYield: "1", lines: [{ source: "personal", foodId: "mine", amount: "20" }] });
    assert.equal(second.ok, true);
    const renewed = await archiveWithMealAcknowledgement(client, "owner", "mine", impact!);
    assert.equal(renewed.status, "stale");
    if (renewed.status !== "stale") throw new Error("Expected stale archive warning");
    assert.deepEqual(renewed.meals.map((meal) => meal.name), ["Dinner", "Lunch"]);
    assert.equal((await archiveWithMealAcknowledgement(client, "owner", "mine", renewed.meals)).status, "archived");
    assert.equal((await searchMealFoodChoices(client, "owner", "Milk")).length, 0);
    assert.equal((await saveMeal(client, "owner", { ...valid, lines: [{ source: "personal", foodId: "mine", amount: "10" }] })).ok, false);
    const edited = await saveMeal(client, "owner", { ...valid, lines: existing.lines.map((line) => ({ lineId: line.id, source: line.source, foodId: line.foodId, amount: String(line.amount + 1) })) }, created.id);
    assert.equal(edited.ok, true);
    assert.equal((await getMeal(client, "owner", created.id))?.lines[1].archived, true);
    assert.equal(recipeNutrition((await getMeal(client, "owner", created.id))!.lines).calories.value, 121.7);
    assert.equal((await getMeal(client, "owner", created.id))?.lines[1].amount, 101);
    const stolen = await saveMeal(client, "owner", { ...valid, lines: [{ lineId: "invented", source: "global", foodId: "global", amount: "1" }] }, created.id);
    assert.equal(stolen.ok, false);
  } finally { client.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
