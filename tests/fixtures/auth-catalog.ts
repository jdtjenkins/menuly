import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { accountExists, findOrCreateGoogleAccount } from "../../lib/auth/accounts";
import { resolveAccount } from "../../lib/auth/resolve-account";
import { createAuthCallbacks } from "../../lib/auth/callbacks";
import { globalFoodToPersonalInput, readGlobalFoodById, readFullFoods, readGuardedFullFoods, normalizeFoodPage } from "../../lib/food/full-catalog";
import { validatePersonalFood } from "../../lib/food/personal-validation";
import { createPersonalFood, getPersonalFood, updatePersonalFood } from "../../lib/food/personal-repository";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./auth-test.db" }, root));
  try {
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    const first = await findOrCreateGoogleAccount(client, "google-subject");
    assert.equal(await findOrCreateGoogleAccount(client, "google-subject"), first);
    const jwt = createAuthCallbacks((subject) => findOrCreateGoogleAccount(client, subject)).jwt! as (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    const initial = await jwt({ token: { name: "Old Name", email: "old@example.com" }, account: { provider: "google", providerAccountId: "google-subject" } });
    const changed = await jwt({ token: { name: "New Name", email: "new@example.com" }, account: { provider: "google", providerAccountId: "google-subject" } });
    assert.deepEqual(initial, { userId: first });
    assert.deepEqual(changed, initial);
    const concurrent = await Promise.all(Array.from({ length: 5 }, () => findOrCreateGoogleAccount(client, "google-subject")));
    assert.deepEqual(new Set(concurrent), new Set([first]));
    const second = await findOrCreateGoogleAccount(client, "different-subject");
    assert.notEqual(second, first);
    assert.equal(await accountExists(client, first), true);
    assert.equal(await accountExists(client, "absent"), false);
    assert.deepEqual(await resolveAccount(client, first), { id: first });
    assert.equal(await resolveAccount(client, undefined), null);
    assert.equal(await resolveAccount(client, "absent"), null);
    const users = await client.execute("SELECT COUNT(*) AS count FROM app_users");
    assert.equal(Number(users.rows[0].count), 2);
    const identityColumns = await client.execute("PRAGMA table_info(provider_identities)");
    assert.deepEqual(identityColumns.rows.map((row) => row.name), ["provider", "subject", "user_id"]);
    const userColumns = await client.execute("PRAGMA table_info(app_users)");
    assert.deepEqual(userColumns.rows.map((row) => row.name), ["id"]);

    for (let i = 0; i < 22; i++) {
      await client.execute({
        sql: "INSERT INTO global_foods (id, name, unit, reference_amount, calories, protein, carbohydrates, fat) VALUES (?, ?, 'g', 100, ?, ?, NULL, 0)",
        args: [`food-${i}`, `Food ${String(i).padStart(2, "0")}`, i, i === 0 ? null : 1],
      });
    }
    const firstPage = await readFullFoods(client, "", 1);
    await assert.rejects(readGuardedFullFoods(client, async () => { throw new Error("Authentication required"); }, "", 1), /Authentication required/);
    assert.equal((await readGuardedFullFoods(client, async () => ({ id: first }), "", 1)).foods.length, 20);
    assert.equal(firstPage.foods.length, 20);
    assert.equal(firstPage.hasNext, true);
    assert.equal(firstPage.foods[0].protein, null);
    assert.equal(firstPage.foods[0].carbohydrates, null);
    const secondPage = await readFullFoods(client, "", 2);
    assert.equal(secondPage.foods.length, 2);
    assert.equal(secondPage.hasNext, false);
    assert.deepEqual((await readFullFoods(client, "food 0_", 1)).foods, []);
    assert.equal((await readFullFoods(client, "FOOD 01", 1)).foods.length, 1);
    assert.equal(normalizeFoodPage("999999"), 10_000);
    assert.equal(normalizeFoodPage("-1"), 1);
    assert.equal(normalizeFoodPage("2.5"), 1);
    const zero = await readGlobalFoodById(client, "food-0");
    assert.ok(zero);
    assert.deepEqual(globalFoodToPersonalInput(zero), {
      name: "Food 00", unit: "g", referenceAmount: "100", calories: "0",
      protein: "", carbohydrates: "", fat: "0",
    });
    const complete = await readGlobalFoodById(client, "food-1");
    assert.ok(complete);
    assert.equal(globalFoodToPersonalInput(complete).protein, "1");
    await client.execute({ sql: "INSERT INTO personal_foods (id, user_id, name, unit, reference_amount, calories) VALUES (?, ?, 'Private', 'g', 100, 1)", args: ["personal-only", first] });
    assert.equal(await readGlobalFoodById(client, "personal-only"), null);
    assert.equal(await readGlobalFoodById(client, "missing"), null);
    assert.equal(await readGlobalFoodById(client, "food-1' OR 1=1 --"), null);
    await client.execute({
      sql: "INSERT INTO global_foods (id, name, unit, reference_amount, calories, protein, carbohydrates, fat) VALUES (?, ?, 'ml', ?, NULL, NULL, 0, 0)",
      args: ["oversized", "N".repeat(101), 1_000_000_000_001],
    });
    const oversized = await readGlobalFoodById(client, "oversized");
    assert.ok(oversized);
    const draft = globalFoodToPersonalInput(oversized);
    assert.equal(draft.calories, "");
    assert.equal(draft.carbohydrates, "0");
    assert.equal(draft.protein, "");
    assert.deepEqual(validatePersonalFood(draft), { ok: false, errors: {
      name: "Enter a name up to 100 characters.",
      referenceAmount: "Enter a positive amount.",
      calories: "Enter a number of zero or more.",
    } });
    const copiedValues = validatePersonalFood(globalFoodToPersonalInput(zero));
    assert.equal(copiedValues.ok, true);
    if (!copiedValues.ok) throw new Error("Expected valid clone values");
    const mine = await createPersonalFood(client, first, copiedValues.values);
    const secondMine = await createPersonalFood(client, first, copiedValues.values);
    const theirs = await createPersonalFood(client, second, copiedValues.values);
    assert.notEqual(mine.id, zero.id);
    assert.notEqual(mine.id, secondMine.id);
    assert.notEqual(mine.id, theirs.id);
    assert.equal(await getPersonalFood(client, second, mine.id), null);
    assert.equal((await getPersonalFood(client, first, mine.id))?.protein, null);
    await updatePersonalFood(client, first, mine.id, { ...copiedValues.values, name: "Changed copy", calories: 90 });
    assert.equal((await getPersonalFood(client, first, secondMine.id))?.name, zero.name);
    assert.equal((await readGlobalFoodById(client, zero.id))?.name, zero.name);
    assert.equal((await readGlobalFoodById(client, zero.id))?.calories, 0);
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
