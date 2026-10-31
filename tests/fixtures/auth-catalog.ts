import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { accountExists, findOrCreateGoogleAccount } from "../../lib/auth/accounts";
import { resolveAccount } from "../../lib/auth/resolve-account";
import { createAuthCallbacks } from "../../lib/auth/callbacks";
import { readFullFoods, readGuardedFullFoods, normalizeFoodPage } from "../../lib/food/full-catalog";

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
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
