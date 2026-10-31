import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Client } from "@libsql/client";

export type Migration = {
  id: string;
  hash: string;
  legacyLineEndingHash?: string;
  statements: readonly string[];
};

export type MigrationLedger = "schema_migrations" | "development_seed_migrations";

const migrationName = /^\d{4}_[a-z0-9-]+$/;

export async function loadMigrations(directory: string): Promise<Migration[]> {
  const names = await readdir(directory);
  const files = names.filter((name) => name.endsWith(".ts")).sort();
  const migrations: Migration[] = [];

  for (const name of files) {
    const id = name.slice(0, -3);
    if (!migrationName.test(id)) {
      throw new Error(`Invalid migration name: ${name}`);
    }

    const path = join(directory, name);
    const source = await readFile(path);
    const normalizedSource = source.toString("utf8").replaceAll("\r\n", "\n");
    const importedMigration: unknown = await import(pathToFileURL(path).href);
    const statements = (importedMigration as { statements?: unknown }).statements;
    if (!Array.isArray(statements) || statements.length === 0 ||
        !statements.every((statement) => typeof statement === "string" && statement.trim())) {
      throw new Error(`Migration ${id} must export a nonempty statements array`);
    }

    migrations.push({
      id,
      hash: createHash("sha256").update(normalizedSource).digest("hex"),
      legacyLineEndingHash: createHash("sha256").update(normalizedSource.replaceAll("\n", "\r\n")).digest("hex"),
      statements,
    });
  }

  return migrations;
}

function matchesMigrationHash(migration: Migration, recordedHash: unknown): boolean {
  return recordedHash === migration.hash || recordedHash === migration.legacyLineEndingHash;
}

function checkMigrationSet(migrations: readonly Migration[]): void {
  const names = new Set<string>();
  for (const migration of migrations) {
    if (!migrationName.test(migration.id) || names.has(migration.id) ||
        migration.statements.length === 0 || !migration.statements.every((sql) => sql.trim())) {
      throw new Error(`Invalid or duplicate migration: ${migration.id}`);
    }
    names.add(migration.id);
  }
}

export async function applyMigrations(
  client: Client,
  migrations: readonly Migration[],
  ledger: MigrationLedger = "schema_migrations",
): Promise<string[]> {
  checkMigrationSet(migrations);
  const ordered = [...migrations].sort((a, b) => a.id.localeCompare(b.id));

  await client.execute(`CREATE TABLE IF NOT EXISTS ${ledger} (
    id TEXT PRIMARY KEY,
    hash TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const existing = await client.execute(`SELECT id, hash FROM ${ledger} ORDER BY id`);
  const byId = new Map(ordered.map((migration) => [migration.id, migration]));
  const applied = new Set<string>();
  for (const row of existing.rows) {
    const id = String(row.id);
    const migration = byId.get(id);
    if (!migration || !matchesMigrationHash(migration, row.hash)) {
      throw new Error(`Migration history mismatch: ${id}`);
    }
    applied.add(id);
  }

  const latestApplied = [...applied].sort().at(-1);
  if (latestApplied && ordered.some((migration) => !applied.has(migration.id) && migration.id < latestApplied)) {
    throw new Error("Cannot add a migration before an already applied migration");
  }

  const completed: string[] = [];
  for (const migration of ordered) {
    if (applied.has(migration.id)) continue;

    const transaction = await client.transaction("write");
    try {
      const current = await transaction.execute({
        sql: `SELECT hash FROM ${ledger} WHERE id = ?`,
        args: [migration.id],
      });
      if (current.rows.length > 0) {
        if (!matchesMigrationHash(migration, current.rows[0].hash)) {
          throw new Error(`Migration history mismatch: ${migration.id}`);
        }
      } else {
        for (const statement of migration.statements) {
          await transaction.execute(statement);
        }
        await transaction.execute({
          sql: `INSERT INTO ${ledger} (id, hash) VALUES (?, ?)`,
          args: [migration.id, migration.hash],
        });
        completed.push(migration.id);
      }
      await transaction.commit();
    } catch (error) {
      if (!transaction.closed) await transaction.rollback();
      throw error;
    }
  }

  return completed;
}
