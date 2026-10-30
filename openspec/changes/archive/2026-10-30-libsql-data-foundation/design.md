# Design

## Context

See [proposal.md](proposal.md) for motivation and the [database-access](specs/database-access/spec.md) and [database-migrations](specs/database-migrations/spec.md) deltas for behavior. Menuly currently has no database dependency, server data module, schema, or migration command. It has Next.js App Router, Vitest, and Playwright. The product vision requires a local libSQL file in development and a separate remote libSQL server on Railway, but the Railway service topology belongs to a later change.

## Goals / Non-Goals

**Goals:**

- Give later features a single server-only connection entry point and an explicit migration command.
- Make migration reruns safe and make edited or missing historical migration files visible before new changes apply.
- Test local persistence and migration behavior against real local files, with a remote smoke check against a running libSQL server.

**Non-Goals:**

- Defining accounts, foods, meals, plan, or checklist tables before their feature changes specify them.
- Running migrations automatically during requests or app startup.
- Provisioning the Railway service, credentials, volume, or network.

## Decisions

### Use the Node libSQL client behind a server-only module

Add `@libsql/client` and expose one server-only client factory/access module. `DATABASE_URL` selects the target: when unset, use `file:./data/menuly.db`; when set, accept a file URL or HTTP(S) endpoint. `DATABASE_AUTH_TOKEN` is optional for a server that requires token authentication. Treat a present but blank URL, unsupported scheme, or token paired with a file target as a configuration error. Do not log URL query strings or tokens. Resolve the default local path from the project root, create its parent directory, and ignore the database file and sidecars in Git. All callers use the same client interface; no client code imports it into a browser component.

The alternative is separate local and remote adapters. The libSQL client already supports both modes, so separate adapters would add code without changing the contract. Use the Node entry point rather than its browser-oriented entry point so file URLs work locally. Remote HTTP fits the private-network libSQL server described in the product vision. The remote server's authentication policy is left to its deployment change; this foundation passes a token only when one is configured.

### Use ordered migration modules and an explicit runner

Keep migration definitions as immutable, numbered TypeScript modules exporting an ordered list of SQL statements. A `pnpm db:migrate` script runs them through the same client configuration as application code. This avoids writing a SQL parser for multi-statement files and allows each migration to contain several statements while preserving their order. The runner creates a small `schema_migrations` ledger if needed, then records each applied identifier with a SHA-256 hash of the migration file's bytes. No product table is created in this foundation; integration tests provide fixture migrations to exercise the runner.

Before applying anything, compare the ledger with the available files and stop if an applied identifier is missing or its hash differs. Apply pending migrations in ascending identifier order. For each migration, use a write transaction that rechecks its ledger row, executes every statement, and inserts its ledger record before commit; on error, roll back and stop. A second invocation may then skip already committed migrations, including after an interrupted run. The write transaction and unique migration identifier prevent concurrent invocations from applying the same migration twice. Do not use `CREATE TABLE IF NOT EXISTS` as a substitute for tracking application schema versions.

The alternative is an ORM migration framework. There is no domain schema yet, and direct SQL keeps this foundation small while leaving room to adopt an ORM later without changing the migration contract. The alternative of executing all files without a ledger cannot detect edits or reliably skip completed changes.

### Keep verification close to the database boundary

Use temporary local database files for Vitest integration checks: write/read after closing and reopening a client, first and second migration runs, partial history, statement failure rollback, and changed or missing migration detection. Test configuration validation without printing credentials. Provide a remote smoke command or test that uses an explicitly supplied libSQL endpoint to run a disposable fixture migration and a read/write round trip; it must target a dedicated test database, never an operator's existing database. A running remote server is a prerequisite for that smoke test. The current workspace has no Docker CLI, so the apply phase must report that verification limit if no test endpoint is supplied.

The alternative is mocking the libSQL client for every test. Mocks cannot establish file persistence or transaction behavior. Browser tests remain focused on the existing shell because this change adds no user-facing database flow.

## Risks / Trade-offs

- [A migration file is edited after deployment] -> Compare recorded content hashes and stop before applying new migrations; add a new migration instead of rewriting history.
- [A statement fails partway through a migration] -> Use a write transaction and verify rollback in an integration test.
- [A remote endpoint is unreachable or incorrectly configured] -> Fail visibly and never fall back to the local file; verify against a disposable remote test database before deployment.
- [A local database or sidecar is accidentally committed] -> Ignore the data directory and document configuration; keep secrets in untracked environment files.
- [A running app and migration command race on new schema] -> Run migrations as a deliberate deployment step before starting the version of the app that needs them.

## Migration Plan

1. Add the client and migration runner without changing existing UI routes.
2. Run `pnpm db:migrate` against a fresh local file, rerun it, and exercise fixture migrations in tests.
3. For deployment, back up the target database, configure its URL and optional token, run the migration command once, and only then start the app version that depends on new schema.
4. Roll back application code independently. Revert a schema change with a new forward migration when needed; do not delete ledger rows or edit an applied migration.

## Technical references

- [libSQL TypeScript client](https://github.com/tursodatabase/libsql-client-ts)
- [libSQL server Docker and HTTP configuration](https://github.com/tursodatabase/libsql/blob/main/docs/DOCKER.md)
