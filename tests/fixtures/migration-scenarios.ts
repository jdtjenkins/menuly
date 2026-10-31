import assert from "node:assert/strict";
import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createDatabaseClient } from "../../lib/db/client";
import { parseDatabaseConfig } from "../../lib/db/config";
import { applyMigrations, loadMigrations } from "../../lib/db/migrations";

function writeMigration(directory: string, id: string, statements: string[]) {
  writeFileSync(join(directory, `${id}.ts`), `export const statements = ${JSON.stringify(statements)};\n`);
}

async function main() {
  const [scenario, projectRoot] = process.argv.slice(2);
  assert.ok(scenario && projectRoot, "A scenario and temporary project directory are required");
  const directory = join(projectRoot, "migrations");
  mkdirSync(directory, { recursive: true });

  const client = createDatabaseClient(parseDatabaseConfig({}, projectRoot));
  try {
    if (scenario === "fresh") {
      writeMigration(directory, "0002_second", ["CREATE TABLE second (value TEXT)"]);
      writeMigration(directory, "0001_first", ["CREATE TABLE first (value TEXT)"]);
      const migrations = await loadMigrations(directory);
      assert.deepEqual(migrations.map(({ id }) => id), ["0001_first", "0002_second"]);
      assert.deepEqual(await applyMigrations(client, migrations), ["0001_first", "0002_second"]);
      const result = await client.execute("SELECT id FROM schema_migrations ORDER BY id");
      assert.deepEqual(result.rows.map((row) => row.id), ["0001_first", "0002_second"]);
      await client.execute("SELECT * FROM first");
      await client.execute("SELECT * FROM second");
    } else if (scenario === "partial") {
      writeMigration(directory, "0001_first", ["CREATE TABLE first (value TEXT)"]);
      assert.deepEqual(await applyMigrations(client, await loadMigrations(directory)), ["0001_first"]);
      writeMigration(directory, "0002_second", ["CREATE TABLE second (value TEXT)"]);
      assert.deepEqual(await applyMigrations(client, await loadMigrations(directory)), ["0002_second"]);
      const result = await client.execute("SELECT id FROM schema_migrations ORDER BY id");
      assert.deepEqual(result.rows.map((row) => row.id), ["0001_first", "0002_second"]);
    } else if (scenario === "rerun") {
      writeMigration(directory, "0001_first", ["CREATE TABLE first (value TEXT)"]);
      const migrations = await loadMigrations(directory);
      assert.deepEqual(await applyMigrations(client, migrations), ["0001_first"]);
      await client.execute("INSERT INTO first (value) VALUES ('keep')");
      assert.deepEqual(await applyMigrations(client, migrations), []);
      const data = await client.execute("SELECT value FROM first");
      const ledger = await client.execute("SELECT id FROM schema_migrations");
      assert.equal(data.rows[0]?.value, "keep");
      assert.equal(ledger.rows.length, 1);
    } else if (scenario === "failure") {
      writeMigration(directory, "0001_first", ["CREATE TABLE first (value TEXT)"]);
      writeMigration(directory, "0002_bad", [
        "CREATE TABLE should_rollback (value TEXT)",
        "INSERT INTO nonexistent (value) VALUES ('fail')",
      ]);
      writeMigration(directory, "0003_later", ["CREATE TABLE should_not_run (value TEXT)"]);
      await assert.rejects(applyMigrations(client, await loadMigrations(directory)));
      const ledger = await client.execute("SELECT id FROM schema_migrations ORDER BY id");
      assert.deepEqual(ledger.rows.map((row) => row.id), ["0001_first"]);
      const tables = await client.execute("SELECT name FROM sqlite_master WHERE type = 'table'");
      const names = tables.rows.map((row) => row.name);
      assert.ok(names.includes("first"));
      assert.ok(!names.includes("should_rollback"));
      assert.ok(!names.includes("should_not_run"));
    } else if (scenario === "concurrent") {
      writeMigration(directory, "0001_first", ["CREATE TABLE first (value TEXT)"]);
      const migrations = await loadMigrations(directory);
      const otherClient = createDatabaseClient(parseDatabaseConfig({}, projectRoot));
      try {
        await Promise.allSettled([
          applyMigrations(client, migrations),
          applyMigrations(otherClient, migrations),
        ]);
        assert.deepEqual(await applyMigrations(client, migrations), []);
        const ledger = await client.execute("SELECT id FROM schema_migrations");
        assert.deepEqual(ledger.rows.map((row) => row.id), ["0001_first"]);
        await client.execute("SELECT * FROM first");
      } finally {
        otherClient.close();
      }
    } else if (scenario === "separate-ledger") {
      writeMigration(directory, "0001_first", ["CREATE TABLE first (value TEXT)"]);
      const schema = await loadMigrations(directory);
      await applyMigrations(client, schema);
      const seedDirectory = join(projectRoot, "seed");
      mkdirSync(seedDirectory);
      writeMigration(seedDirectory, "0001_seed", ["INSERT INTO first (value) VALUES ('sample')"]);
      const seed = await loadMigrations(seedDirectory);
      assert.deepEqual(await applyMigrations(client, seed, "development_seed_migrations"), ["0001_seed"]);
      assert.deepEqual(await applyMigrations(client, seed, "development_seed_migrations"), []);
      assert.deepEqual(await applyMigrations(client, schema), []);
      const data = await client.execute("SELECT value FROM first");
      assert.deepEqual(data.rows.map((row) => row.value), ["sample"]);
      writeMigration(seedDirectory, "0001_seed", ["INSERT INTO first (value) VALUES ('changed')"]);
      await assert.rejects(applyMigrations(client, await loadMigrations(seedDirectory), "development_seed_migrations"), /Migration history mismatch/);
      const schemaLedger = await client.execute("SELECT id FROM schema_migrations");
      const seedLedger = await client.execute("SELECT id FROM development_seed_migrations");
      assert.deepEqual(schemaLedger.rows.map((row) => row.id), ["0001_first"]);
      assert.deepEqual(seedLedger.rows.map((row) => row.id), ["0001_seed"]);
    } else if (scenario === "line-endings") {
      writeMigration(directory, "0001_first", ["CREATE TABLE first (value TEXT)"]);
      const path = join(directory, "0001_first.ts");
      const lfSource = readFileSync(path, "utf8");
      const [migration] = await loadMigrations(directory);
      assert.deepEqual(await applyMigrations(client, [migration]), ["0001_first"]);
      writeFileSync(path, lfSource.replaceAll("\n", "\r\n"));
      const [crlfMigration] = await loadMigrations(directory);
      assert.equal(crlfMigration.hash, migration.hash);
      assert.notEqual(crlfMigration.legacyLineEndingHash, migration.hash);
      assert.deepEqual(await applyMigrations(client, [crlfMigration]), []);
      await client.execute({
        sql: "UPDATE schema_migrations SET hash = ? WHERE id = ?",
        args: [crlfMigration.legacyLineEndingHash!, "0001_first"],
      });
      writeFileSync(path, lfSource);
      assert.deepEqual(await applyMigrations(client, await loadMigrations(directory)), []);
      writeMigration(directory, "0001_first", ["CREATE TABLE changed (value TEXT)"]);
      await assert.rejects(applyMigrations(client, await loadMigrations(directory)), /Migration history mismatch/);
    } else if (scenario === "edited" || scenario === "missing") {
      writeMigration(directory, "0001_first", ["CREATE TABLE first (value TEXT)"]);
      await applyMigrations(client, await loadMigrations(directory));
      if (scenario === "edited") {
        writeMigration(directory, "0001_first", ["CREATE TABLE changed (value TEXT)"]);
      } else {
        unlinkSync(join(directory, "0001_first.ts"));
      }
      writeMigration(directory, "0002_second", ["CREATE TABLE should_not_run (value TEXT)"]);
      await assert.rejects(applyMigrations(client, await loadMigrations(directory)), /Migration history mismatch/);
      const tables = await client.execute("SELECT name FROM sqlite_master WHERE type = 'table'");
      assert.ok(!tables.rows.some((row) => row.name === "should_not_run"));
      const ledger = await client.execute("SELECT id FROM schema_migrations");
      assert.deepEqual(ledger.rows.map((row) => row.id), ["0001_first"]);
    } else {
      throw new Error(`Unknown scenario: ${scenario}`);
    }
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
