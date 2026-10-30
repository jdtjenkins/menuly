# Tasks

## 1. Global-food storage and development data

- [x] 1.1 Add the numbered shared migration for `global_foods` with stable IDs, fixed units, positive reference amounts, and nullable nonnegative nutrients; add migration and constraint tests, then verify `pnpm test:unit` passes.
- [x] 1.2 Extend the migration runner for a separate development-seed ledger and add a `db:seed:dev` command that requires explicit development opt-in, a local file URL, and nonproduction mode; test remote/production rejection, reruns, and hash drift, then verify `pnpm test:unit` passes.
- [x] 1.3 Add the development seed migration with 30 distinct common foods, source-controlled IDs, units, reference amounts, and nutrition values; document the seed command and sample-data status in the README, then run it twice against a disposable local database and verify exactly 30 unchanged seed rows.

## 2. Anonymous catalog search

- [x] 2.1 Add a server-only catalog query returning only `{ name, calories }`, with trimmed and length-bounded literal case-insensitive matching, parameter binding, deterministic order, and a SQL limit of 20; test blank, wildcard, case, no-match, cap, and public-field behavior, then verify `pnpm test:unit` passes.
- [x] 2.2 Replace the Food empty state with a GET search form, result list, empty/no-match states, and a text prompt about sign-in for full nutrition; add Playwright coverage for keyboard search, result limit, no public mutation path, and absence of full nutrition or database secrets in anonymous output, then verify `pnpm test:e2e` passes after a build with a seeded test database.
- [x] 2.3 Document public search behavior and the requirement to apply the shared schema migration before serving the page; verify the README instructions match the configured scripts and page behavior.

## 3. Integration verification

- [x] 3.1 Run `pnpm lint`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e`, and `openspec validate public-global-food-search --strict`; verify the production migration contains no sample seed records and report any unavailable check.

## Workflow follow-up

- After implementation review and explicit approval, sync the delta specs and archive this change.
