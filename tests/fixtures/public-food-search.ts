import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";
import { searchPublicFoods } from "../../lib/food/public-search";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({}, root));
  try {
    assert.deepEqual(await searchPublicFoods(client, "   "), []);
    await applyMigrations(client, await loadMigrations(join(process.cwd(), "migrations")));
    const insert = `INSERT INTO global_foods
      (id, name, unit, reference_amount, calories, protein, carbohydrates, fat)
      VALUES (?, ?, 'g', 100, ?, 2, 3, 4)`;
    for (let i = 1; i <= 25; i++) {
      const suffix = String(i).padStart(2, "0");
      await client.execute({ sql: insert, args: [`test-${suffix}`, `Apple ${suffix}`, i] });
    }
    await client.execute({ sql: insert, args: ["percent", "100% Cocoa", 100] });
    await client.execute({ sql: insert, args: ["underscore", "A_B food", 50] });
    const matches = await searchPublicFoods(client, "  aPpLe  ");
    assert.equal(matches.length, 20);
    assert.deepEqual(matches[0], { name: "Apple 01", calories: 1 });
    assert.deepEqual(matches[19], { name: "Apple 20", calories: 20 });
    assert.deepEqual(Object.keys(matches[0]), ["name", "calories"]);
    assert.deepEqual(await searchPublicFoods(client, "%"), [{ name: "100% Cocoa", calories: 100 }]);
    assert.deepEqual(await searchPublicFoods(client, "_"), [{ name: "A_B food", calories: 50 }]);
    assert.deepEqual(await searchPublicFoods(client, "PPLE 02"), [{ name: "Apple 02", calories: 2 }]);
    assert.deepEqual(await searchPublicFoods(client, "not present"), []);
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
