# Proposal

## Why

The application has no database connection or migration workflow, so the upcoming food and account changes cannot persist data consistently. A small server-side foundation is needed now to let those changes use the same access path in local development and against a remote libSQL server.

## What Changes

- Add a server-only libSQL connection configured for a local database file by default and a remote libSQL endpoint when configured.
- Add a versioned migration workflow that records applied migrations and can be run repeatedly without reapplying them.
- Add configuration guidance and integration checks for local persistence, remote connection settings, and migration safety.
- Keep product tables, food data, authentication, and Railway deployment configuration for their separate roadmap changes.

## Capabilities

### New Capabilities

- `database-access`: Server-side code can connect to the configured local or remote libSQL database through one data-access entry point.
- `database-migrations`: Operators can apply ordered schema changes safely and repeatably while detecting changed or failed migrations.

### Modified Capabilities

None.

## Impact

- Adds a libSQL client dependency, server-side database configuration and access modules, a migration runner and migration files, and database integration tests.
- Adds scripts and README instructions for applying migrations and configuring local or remote connections.
- Creates a local database file during development; the file and credentials must remain outside version control.
- Does not expose a database endpoint to browsers or change existing navigation behavior.
