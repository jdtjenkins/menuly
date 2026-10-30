# Design

## Context

See `proposal.md` for motivation and the two delta specs for behavior. The Food page is an empty state. `lib/db/server.ts` exposes a server-only libSQL client, and the existing migration runner loads numbered TypeScript files from a directory and records hashes in `schema_migrations`. There are no product tables or migrations yet. The shared migration set must work with local and remote databases, while the 30 sample foods are for local development only.

## Goals / Non-Goals

**Goals:**

- Keep schema evolution common to local and remote environments while making the 30-food sample dataset opt-in and local-only.
- Shape public data at the query boundary so a future full-nutrition reader can coexist with calorie-only anonymous search.
- Keep the Food page usable with keyboard input, empty and no-match states, and existing primary navigation.

**Non-Goals:**

- Authentication, full-nutrition browsing, personal foods, production import, and public catalog writes.
- A guarantee against bulk copying; a public bounded search cannot provide that guarantee.

## Decisions

### One global-food table, with a separate development seed history

Add a normal numbered migration for a `global_foods` table. Use a stable text primary key, nonblank name, unit constrained to `g` or `ml`, positive reference amount, and nonnegative nullable nutrient columns; `NULL` represents unknown, distinct from zero. Keep this schema migration in `migrations/` so both local and remote targets receive it.

Put the 30 INSERT statements in a numbered migration under a separate development seed directory. A dedicated `db:seed:dev` command first applies normal schema migrations, then applies development seed migrations using a distinct ledger table and the existing hash/transaction safeguards. Permit this command only with an explicit development opt-in, a file URL, and a nonproduction process environment; refuse remote URLs and production mode before any seed write. Repeating it must leave IDs, values, and row count unchanged. This avoids the normal migration runner treating development-only history as missing when production runs schema migrations. A single shared seed migration was rejected because it would put sample foods into production or make local and remote migration histories diverge.

The 30 entries are curated sample data, not the future production dataset. Give every entry a fixed source-controlled ID and a documented reference amount. Keep nutrition values plausible and internally consistent; avoid presenting the sample as authoritative nutritional advice. A later production import can add separate entries without reusing these IDs.

### Server-rendered search with a public result type

The Food page reads a `q` query parameter and asks a server-only catalog module for matches. Normalize by trimming and bounding input length, treat blank input as no search, escape SQL `LIKE` metacharacters for literal substring matching, and bind the term as a parameter. Query only `name` and `calories`, use case-insensitive matching, order by name and stable ID, and apply a hard limit of 20 in SQL. Return a dedicated `{ name, calories }` public type; do not fetch a full food row and remove fields in the page. This keeps private fields out of serialization even if the page changes later.

Use a standard GET search form so the URL is shareable and works without client JavaScript. Show a prompt explaining that full nutrition will require sign-in, with no active sign-in control until authentication exists. A new public JSON endpoint is unnecessary for this slice; future authenticated catalog access can add its own server boundary. A client-side database query was rejected because database access must remain on the server.

### No public mutation surface

Expose no route or server action for global-food writes. Only migration and later controlled import code may insert catalog records. Tests should verify that anonymous HTTP access cannot change a global food and that public HTML contains no full-nutrition fields or database configuration.

## Risks / Trade-offs

- [Seed command targets the wrong database] → Require explicit development opt-in, local file configuration, and a nonproduction environment before applying its separate migration set.
- [Search inputs become expensive or act as SQL patterns] → Bound input length, escape wildcard characters, parameterize the query, and cap output at 20. Substring matching may scan the catalog; review search indexing before the larger production import.
- [Sample calories are mistaken for production data] → Document the seed as development-only and keep the production import separate.
- [Public output leaks full nutrition] → Query only public columns and test the rendered page as an anonymous visitor.

## Migration Plan

1. Add and apply the global-food schema migration through `pnpm db:migrate` for each target before deploying the search page. The new table is additive and does not alter the existing migration ledger.
2. For a local development database only, run the explicit development seed command after the schema migration. Its separate ledger records the seed file hash and preserves rerun behavior.
3. Deploy the page after the schema exists. A remote database with no production import returns a clear no-match state until it receives catalog data.
4. Roll back the page by deploying the previous app version if needed. Keep the additive table and recorded migration in place; do not edit or delete applied migration files. Remove sample rows only through a future deliberate data migration if they must be retired.
