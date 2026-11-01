# Tasks

## 1. Source lookup and owner-scoped creation

- [x] 1.1 Add an exact, parameterized global-food lookup for clone drafts and a mapping to personal-food form input that preserves `NULL` as blank and measured zero as `0`. Test missing IDs, personal-food IDs, complete values, unknown nutrients, and values outside personal-food limits against a disposable libSQL database; run `pnpm test:unit`.
- [x] 1.2 Add server-only clone draft and save operations that check the current account on each request, recheck the global source on save, validate reviewed values, and create a fresh owner-scoped personal ID without writing the global row. Test anonymous, expired, orphaned, missing-source, invalid-value, repeated-copy, two-account, and source-immutability cases with focused unit/integration tests; run `pnpm test:unit`.

## 2. Food-area clone flow

- [x] 2.1 Add "Copy to My foods" to signed-in global cards and route it to a prefilled personal-food create form. Keep unknown optional nutrients blank, require missing calories before saving, preserve edited values and errors, support cancellation, and return successful copies to My foods. Cover normal, missing-calorie, and invalid-source flows plus keyboard and narrow-screen use with Playwright; run the focused browser tests and `pnpm build`.
- [x] 2.2 Keep anonymous public search free of copy controls and full nutrition, and document that copies are independent, editable personal foods with new IDs and no automatic meal replacement. Cover anonymous direct draft access, sign-out, and global-source immutability in Playwright; verify the README matches the UI and run `pnpm lint`.

## 3. Integration verification

- [x] 3.1 Run `pnpm lint`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e`, and `openspec validate clone-global-food --strict`; confirm the clone flow leaves global records and public responses unchanged, and report any unavailable check.

## Workflow follow-up

- After implementation review and explicit approval, sync the delta spec and archive this change.
