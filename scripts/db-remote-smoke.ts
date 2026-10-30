import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createDatabaseClient } from "../lib/db/client";
import { applyMigrations } from "../lib/db/migrations";
import { parseRemoteSmokeConfig } from "../lib/db/remote-smoke-config";

async function main() {
  loadEnvConfig(process.cwd());
  const config = parseRemoteSmokeConfig({
    REMOTE_TEST_DATABASE_URL: process.env.REMOTE_TEST_DATABASE_URL,
    REMOTE_TEST_DATABASE_AUTH_TOKEN: process.env.REMOTE_TEST_DATABASE_AUTH_TOKEN,
    REMOTE_TEST_DATABASE_DISPOSABLE: process.env.REMOTE_TEST_DATABASE_DISPOSABLE,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  const client = createDatabaseClient(config);
  const statement = "CREATE TABLE IF NOT EXISTS menuly_remote_smoke (value TEXT NOT NULL)";
  const value = randomUUID();

  try {
    await applyMigrations(client, [{
      id: "9999_remote-smoke",
      hash: createHash("sha256").update(statement).digest("hex"),
      statements: [statement],
    }]);
    await client.execute({ sql: "INSERT INTO menuly_remote_smoke (value) VALUES (?)", args: [value] });
    const result = await client.execute({ sql: "SELECT value FROM menuly_remote_smoke WHERE value = ?", args: [value] });
    assert.equal(result.rows[0]?.value, value);
    await client.execute({ sql: "DELETE FROM menuly_remote_smoke WHERE value = ?", args: [value] });
    console.log("Remote migration and read/write smoke passed.");
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Remote smoke failed");
  process.exitCode = 1;
});
