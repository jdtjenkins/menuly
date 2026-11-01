# Tasks

## 1. Personal-food storage and access

- [x] 1.1 Add `0003_personal-foods.ts` with owner FK, stable ID, unit and nutrition constraints, and an owner/name index. Test the migration on a disposable libSQL database, including valid zero/NULL values, invalid rows, and account-delete cascade; run `pnpm test:unit`.
- [x] 1.2 Add a typed personal-food form validator for trimmed required name, g/ml unit, positive finite reference amount, required nonnegative calories, and optional nonnegative nutrients, preserving blank as NULL and explicit zero. Cover missing, malformed, negative, infinite, and boundary inputs in unit tests; run `pnpm test:unit`.
- [x] 1.3 Add owner-scoped create, bounded list, detail, and edit queries using parameterized SQL and stable IDs. Ensure edits retain owner, ID, and unit and reject a supplied different unit. Test two-account isolation, unknown/other-owner/global IDs, and unchanged rows after invalid edits against disposable libSQL; run `pnpm test:unit`.
- [x] 1.4 Add server-only personal-food readers and create/edit actions that call the existing account boundary on every request and mutation. Verify anonymous, expired, and orphaned sessions cannot read or write personal foods, and that actions return safe validation/not-found results with `pnpm test:unit`.

## 2. Food-area experience

- [x] 2.1 Add a signed-in personal-food section to Food with an empty state, stable bounded list, full reference nutrition display, and Create/Edit links while retaining the existing global catalog and anonymous search. Add Playwright coverage for owner-visible results, anonymous absence, keyboard access, narrow layout, and public/global regressions; run `pnpm build` and the focused browser tests.
- [x] 2.2 Add an accessible create form at `/food/personal/new` with field errors, preserved input on failure, and a successful return to the personal section. Test required values, optional unknown versus zero, anonymous direct access, and successful creation through the existing local OIDC browser fixture; run the focused Playwright tests.
- [x] 2.3 Add an accessible edit form at `/food/personal/[id]/edit` that shows the fixed unit without offering a unit change, updates allowed values in place, and returns the same not-found outcome for absent and other-owner IDs. Test clearing optional nutrients, attempted unit tampering, retained ID/unit, owner isolation, and signed-out access with Playwright and targeted unit tests.
- [x] 2.4 Document personal-food creation, editing, unit immutability, missing nutrient behavior, migration prerequisite, and owner-only access in the README; verify the instructions match the implemented UI and run `pnpm lint`.
- [x] 2.5 Make My foods the signed-in default and add accessible "See global foods" and return controls. Keep anonymous global search as-is, preserve signed-in global search/pagination after switching, remove visible IDs from global cards, and update the README. Verify both views, keyboard and narrow-screen behavior, ID omission, and public/global regressions with Playwright, then run lint and build.
- [x] 2.6 Add a new numbered migration for nullable personal-food archive state without changing `0003`; add owner-scoped archive and active-list/detail filtering that preserves row and ID and treats unknown, other-owner, and already archived IDs alike. Test confirmation-independent data behavior, cascade, and global-row isolation against disposable libSQL, then run `pnpm test:unit`.
- [x] 2.7 Add a clearly labeled "Archive food" action with explicit confirmation to each active personal-food card, owner checks in the server action, active-view return, and README guidance. Test confirm/cancel, archived-food absence, direct edit/mutation denial, other-account isolation, and keyboard/narrow-screen use with Playwright and targeted unit tests.

## 3. Integration verification

- [x] 3.1 Run `pnpm lint`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e`, and `openspec validate personal-foods --strict`; verify the personal-food paths do not alter global rows or expose private values in anonymous responses, and report any check that cannot run.
- [x] 3.2 Rerun `pnpm lint`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e`, and `openspec validate personal-foods --strict` after the view and archive revisions; confirm all active and anonymous access rules and report any unavailable check.

## Workflow follow-up

- After implementation review and explicit approval, sync the delta spec and archive this change.
