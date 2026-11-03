import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { addPlannedMeal, listPlannedMeals, removePlannedMeal, searchPlanMeals, updatePlannedMeal } from "../../lib/plan/repository";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./test.db" }, root));
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    await client.execute("INSERT INTO app_users (id) VALUES ('owner'), ('other')");
    await client.execute("INSERT INTO meals (id, user_id, name, serving_yield) VALUES ('mine', 'owner', 'Dinner', 2), ('theirs', 'other', 'Secret dinner', 2)");
    assert.deepEqual(await searchPlanMeals(client, "owner", "Secret"), []);
    assert.deepEqual(await addPlannedMeal(client, "owner", "theirs", { weekday: "0", servings: "1" }), { ok: false, notFound: true });
    assert.deepEqual(await addPlannedMeal(client, "owner", "absent", { weekday: "0", servings: "1" }), { ok: false, notFound: true });
    const first = await addPlannedMeal(client, "owner", "mine", { weekday: "2", servings: "1.5" });
    const second = await addPlannedMeal(client, "owner", "mine", { weekday: "2", servings: "2" });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (!first.ok || !second.ok) return;
    assert.notEqual(first.id, second.id);
    assert.deepEqual((await listPlannedMeals(client, "owner")).map(({ id, servings }) => [id, servings]), [[first.id, 1.5], [second.id, 2]]);
    assert.deepEqual(await listPlannedMeals(client, "other"), []);
    assert.deepEqual(await updatePlannedMeal(client, "other", first.id, { servings: "3" }), { ok: false, notFound: true });
    assert.equal(await removePlannedMeal(client, "other", first.id), false);
    assert.equal((await updatePlannedMeal(client, "owner", first.id, { servings: "0" })).ok, false);
    const attemptedMove = { weekday: "4", servings: "0.5" };
    assert.equal((await updatePlannedMeal(client, "owner", first.id, attemptedMove)).ok, true);
    await client.execute("UPDATE meals SET name = 'New dinner' WHERE id = 'mine'");
    assert.deepEqual((await listPlannedMeals(client, "owner")).map(({ mealName, weekday, servings }) => [mealName, weekday, servings]), [["New dinner", 2, 0.5], ["New dinner", 2, 2]]);
    assert.equal(await removePlannedMeal(client, "owner", first.id), true);
    assert.deepEqual((await listPlannedMeals(client, "owner")).map(({ id }) => id), [second.id]);
  } finally { client.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
