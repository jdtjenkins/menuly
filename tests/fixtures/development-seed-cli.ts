import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";

async function main() {
  const root = process.argv[2];
  assert.ok(root);
  const url = `file:${join(root, "sample.db").replaceAll("\\", "/")}`;
  const env = {
    ...process.env,
    DATABASE_URL: url,
    MENULY_DEV_SEED: "yes",
    NODE_ENV: "development" as const,
  };
  const run = () => spawnSync(
    process.platform === "win32" ? "cmd.exe" : "pnpm",
    process.platform === "win32" ? ["/c", "pnpm.cmd", "db:seed:dev"] : ["db:seed:dev"],
    { cwd: process.cwd(), env, encoding: "utf8", timeout: 30_000 },
  );
  const first = run();
  assert.equal(first.status, 0, first.stderr || first.error?.message);
  assert.match(first.stdout, /Applied 1 development seed migration/);
  const client = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: url }));
  let original: unknown;
  try {
    const rows = await client.execute("SELECT * FROM global_foods ORDER BY id");
    assert.equal(rows.rows.length, 30);
    assert.equal(new Set(rows.rows.map((row) => row.id)).size, 30);
    assert.ok(rows.rows.every((row) => row.name && row.reference_amount === 100));
    original = rows.rows;
  } finally {
    client.close();
  }
  const second = run();
  assert.equal(second.status, 0, second.stderr || second.error?.message);
  assert.match(second.stdout, /Applied 0 development seed migrations/);
  const reopened = createDatabaseClient(parseDatabaseConfig({ DATABASE_URL: url }));
  try {
    const rows = await reopened.execute("SELECT * FROM global_foods ORDER BY id");
    assert.deepEqual(rows.rows, original);
    const seedLedger = await reopened.execute("SELECT id FROM development_seed_migrations");
    assert.deepEqual(seedLedger.rows.map((row) => row.id), ["0001_common-foods"]);
  } finally {
    reopened.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
