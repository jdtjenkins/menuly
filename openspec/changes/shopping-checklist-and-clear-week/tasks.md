# Tasks

## 1. Checklist storage and owner-scoped operations

- [x] 1.1 Add the `0007_shopping-checklist.ts` migration for checked food identities and observed amounts; verify fresh and upgraded database fixtures enforce owner, identity, and positive-amount constraints and apply repeatedly.
- [x] 1.2 Add an owner-scoped read and check/uncheck repository operation that derives the current amount inside a write transaction and rejects stale or foreign items; verify database tests cover persistence, same-named global and personal foods, two accounts, unchecking, and absent items.

## 2. Quantity reconciliation

- [x] 2.1 Add a transaction-safe reconciliation function for checked rows and wire it into successful plan add, serving update, and card removal; verify repository tests cover unchanged, decreased, increased, and removed totals, including a decrease followed by an increase before any page read.
- [x] 2.2 Reconcile after a planned meal save finishes its yield and ingredient changes, before that write commits; verify tests cover changed amounts, food references, repeated ingredient lines, and no checklist change when validation fails.

## 3. Shopping checklist presentation

- [x] 3.1 Render owner check state beside each generated item with accessible labelled checkboxes while preserving name, exact amount, unit, source label, and empty state; verify focused component tests for checked, unchecked, and same-named items.
- [x] 3.2 Add the authenticated check action with pending and error feedback and `/meal-plan` revalidation; verify action tests and a Playwright journey for checking, returning, unchecking, and a stale-item rejection.

## 4. Clear Week

- [x] 4.1 Add an owner-scoped Clear Week repository and server operation that deletes cards and checked rows atomically; verify database tests for populated and empty plans, other-account isolation, saved meal preservation, and rollback on failure.
- [x] 4.2 Add a visible Clear Week control with confirmation, cancellation, pending and error states, and successful `/meal-plan` refresh; verify a Playwright journey that cancellation preserves the plan, confirmation empties all days, and newly added items start unchecked.

## 5. Integration verification

- [x] 5.1 Run the relevant unit tests, checklist and Clear Week Playwright journeys, lint, type check, production build, and strict OpenSpec validation; compare the result with every scenario in both delta specs.
