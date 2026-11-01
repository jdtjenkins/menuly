import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { archivePersonalFood, createPersonalFood, getPersonalFood, listPersonalFoods, updatePersonalFood } from "../../lib/food/personal-repository";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./personal-test.db" }, root));
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    await client.execute({ sql: "INSERT INTO app_users (id) VALUES (?)", args: ["owner"] });
    await client.execute({ sql: "INSERT INTO personal_foods (id, user_id, name, unit, reference_amount, calories, protein) VALUES (?, ?, ?, ?, ?, ?, ?)", args: ["personal-one", "owner", "Rice", "g", 100, 0, null] });
    const saved = await client.execute("SELECT calories, protein FROM personal_foods WHERE id = 'personal-one'");
    assert.equal(saved.rows[0].calories, 0);
    assert.equal(saved.rows[0].protein, null);
    for (const [id, unit, amount, calories] of [["bad-unit", "oz", 100, 1], ["bad-amount", "g", 0, 1], ["bad-calories", "g", 100, -1]] as const) {
      await assert.rejects(client.execute({ sql: "INSERT INTO personal_foods (id, user_id, name, unit, reference_amount, calories) VALUES (?, ?, 'Bad', ?, ?, ?)", args: [id, "owner", unit, amount, calories] }));
    }
    await client.execute({ sql: "INSERT INTO app_users (id) VALUES (?)", args: ["other"] });
    await client.execute({ sql: "INSERT INTO global_foods (id, name, unit, reference_amount, calories) VALUES (?, 'Rice', 'g', 100, 50)", args: ["global-rice"] });
    const values = { name: "Rice", unit: "g" as const, referenceAmount: 100, calories: 50, protein: null, carbohydrates: 10, fat: 0 };
    const mine = await createPersonalFood(client, "owner", values);
    const theirs = await createPersonalFood(client, "other", values);
    assert.notEqual(mine.id, theirs.id);
    assert.notEqual(mine.id, "global-rice");
    assert.deepEqual((await listPersonalFoods(client, "other")).foods.map((food) => food.id), [theirs.id]);
    assert.equal((await listPersonalFoods(client, "owner")).foods.length, 2);
    assert.equal(await getPersonalFood(client, "owner", theirs.id), null);
    assert.equal(await getPersonalFood(client, "owner", "global-rice"), null);
    assert.equal(await updatePersonalFood(client, "owner", theirs.id, { ...values, name: "Changed" }), null);
    assert.equal(await updatePersonalFood(client, "owner", "global-rice", values), null);
    await assert.rejects(updatePersonalFood(client, "owner", mine.id, { ...values, unit: "ml" }), /Unit cannot be changed/);
    assert.deepEqual(await getPersonalFood(client, "owner", mine.id), mine);
    await assert.rejects(updatePersonalFood(client, "owner", mine.id, { ...values, calories: -1 }));
    assert.deepEqual(await getPersonalFood(client, "owner", mine.id), mine);
    const edited = await updatePersonalFood(client, "owner", mine.id, { ...values, name: "Brown rice", protein: 0, carbohydrates: null });
    assert.equal(edited?.id, mine.id);
    assert.equal(edited?.unit, "g");
    assert.equal(edited?.protein, 0);
    assert.equal(edited?.carbohydrates, null);
    assert.equal((await client.execute("SELECT name FROM global_foods WHERE id = 'global-rice'")).rows[0].name, "Rice");
    for (let index = 0; index < 21; index++) await createPersonalFood(client, "owner", { ...values, name: `Food ${String(index).padStart(2, "0")}` });
    const firstPage = await listPersonalFoods(client, "owner", 1);
    const secondPage = await listPersonalFoods(client, "owner", 2);
    assert.equal(firstPage.foods.length, 20);
    assert.equal(firstPage.hasNext, true);
    assert.equal(secondPage.foods.length, 3);
    assert.equal(secondPage.hasNext, false);
    assert.equal(await archivePersonalFood(client, "other", mine.id), false);
    assert.equal(await archivePersonalFood(client, "owner", "global-rice"), false);
    assert.equal(await archivePersonalFood(client, "owner", "absent"), false);
    assert.equal(await archivePersonalFood(client, "owner", mine.id), true);
    assert.equal(await archivePersonalFood(client, "owner", mine.id), false);
    assert.equal(await getPersonalFood(client, "owner", mine.id), null);
    assert.equal((await listPersonalFoods(client, "owner", 2)).foods.length, 2);
    assert.equal(await updatePersonalFood(client, "owner", mine.id, values), null);
    const archived = await client.execute({ sql: "SELECT id, user_id, unit, calories, archived_at FROM personal_foods WHERE id = ?", args: [mine.id] });
    assert.equal(archived.rows[0].id, mine.id);
    assert.equal(archived.rows[0].user_id, "owner");
    assert.equal(archived.rows[0].unit, "g");
    assert.equal(archived.rows[0].calories, 50);
    assert.ok(archived.rows[0].archived_at);
    assert.equal((await client.execute("SELECT name FROM global_foods WHERE id = 'global-rice'")).rows[0].name, "Rice");
    await client.execute({ sql: "DELETE FROM app_users WHERE id = ?", args: ["owner"] });
    const remaining = await client.execute("SELECT COUNT(*) AS count FROM personal_foods");
    assert.equal(Number(remaining.rows[0].count), 1);
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
