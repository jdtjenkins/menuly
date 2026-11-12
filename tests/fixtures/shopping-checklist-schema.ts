import assert from "node:assert/strict";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: "file:./test.db" }, root));
  try {
    const migrations = await loadMigrations(join(process.cwd(), "migrations"));
    const earlier = migrations.filter((migration) => migration.id !== "0007_shopping-checklist");
    assert.deepEqual(await applyMigrations(client, earlier), earlier.map((migration) => migration.id));
    await client.execute("INSERT INTO app_users (id) VALUES ('owner'), ('other')");
    assert.deepEqual(await applyMigrations(client, migrations), ["0007_shopping-checklist"]);
    assert.deepEqual(await applyMigrations(client, migrations), []);
    await client.execute("INSERT INTO shopping_checks (user_id, food_source, food_id, observed_amount) VALUES ('owner', 'global', 'food', 0.5), ('owner', 'personal', 'food', 2), ('other', 'global', 'food', 3)");
    assert.equal((await client.execute("SELECT COUNT(*) AS count FROM shopping_checks")).rows[0]?.count, 3);
    for (const [source, id, amount] of [["global", "food", 1], ["unknown", "x", 1], ["global", "", 1], ["global", "x", 0], ["global", "x", -1], ["global", "x", Infinity]]) {
      await assert.rejects(client.execute({ sql: "INSERT INTO shopping_checks (user_id, food_source, food_id, observed_amount) VALUES (?, ?, ?, ?)", args: ["owner", source, id, amount] }));
    }
    await assert.rejects(client.execute("INSERT INTO shopping_checks (user_id, food_source, food_id, observed_amount) VALUES ('missing', 'global', 'x', 1)"));
    await client.execute("DELETE FROM app_users WHERE id = 'owner'");
    assert.equal((await client.execute("SELECT COUNT(*) AS count FROM shopping_checks")).rows[0]?.count, 1);
  } finally { client.close(); }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
