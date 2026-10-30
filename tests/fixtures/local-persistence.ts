import assert from "node:assert/strict";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";

async function main() {
  const projectRoot = process.argv[2];
  assert.ok(projectRoot, "A temporary project directory is required");
  const config = parseDatabaseConfig({}, projectRoot);

  const first = createDatabaseClient(config);
  try {
    await first.execute("CREATE TABLE persistence_check (value TEXT NOT NULL)");
    await first.execute({ sql: "INSERT INTO persistence_check (value) VALUES (?)", args: ["saved"] });
  } finally {
    first.close();
  }

  const second = createDatabaseClient(config);
  try {
    const result = await second.execute("SELECT value FROM persistence_check");
    assert.equal(result.rows[0]?.value, "saved");
  } finally {
    second.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
