# Tasks

## 1. Server-side database access

- [x] 1.1 Add the Node libSQL client and database configuration parser for the default local file and configured HTTP(S) endpoint; add unit tests for valid, blank, unsupported, and token/file combinations, then verify `pnpm test:unit` passes.
- [x] 1.2 Add the server-only client entry point and local data-directory handling; add a temporary-file integration test that writes data, closes the client, reopens it, and reads the same data, then verify `pnpm test:unit` passes.
- [x] 1.3 Ignore local database files and sidecars, document `DATABASE_URL` and optional `DATABASE_AUTH_TOKEN` without exposing credentials, and verify the README examples match the configuration parser.

## 2. Repeatable migrations

- [x] 2.1 Add numbered migration modules, ordered discovery, the `schema_migrations` ledger, and a runner that applies pending statements through write transactions; add fixture tests for fresh and partially migrated databases, then verify `pnpm test:unit` passes.
- [x] 2.2 Make migration reruns and statement failures safe with transactional completion records; test a second run, rollback after a failing statement, and a concurrent rerun, then verify `pnpm test:unit` passes.
- [x] 2.3 Record migration content hashes and reject edited or missing applied migrations before new schema changes; add drift tests and verify `pnpm test:unit` passes.
- [x] 2.4 Add the `pnpm db:migrate` command and document migration authoring, local setup, and deployment order in the README; run the command twice against a fresh local file and verify the second run leaves its ledger unchanged.
- [x] 2.5 Add a remote smoke check restricted to an explicitly supplied disposable test database; verify its configuration guard with tests and, when a test libSQL server is available, verify a migration and read/write round trip through the remote endpoint.

## 3. Integration validation

- [x] 3.1 Run `pnpm lint`, `pnpm test:unit`, `pnpm build`, the existing `pnpm test:e2e`, and `openspec validate libsql-data-foundation`; report any unavailable remote smoke prerequisite and verify no database URL or token enters browser output.

- [x] 3.2 Generate .env.example file with all relevant environment variables.
