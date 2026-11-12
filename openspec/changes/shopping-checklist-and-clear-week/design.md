# Design

## Context

See `proposal.md` and the two delta specs. `lib/shopping/calculation.ts` derives amounts from current plan and meal records; `lib/shopping/repository.ts` reads them for one owner. The list is rendered without checkboxes. Plan add, update, and remove writes live in `lib/plan/repository.ts`; meal saves use a write transaction in `lib/meals/repository.ts`. There is no checklist table yet. The accepted weekly-plan spec keeps cards on their assigned day.

## Goals / Non-Goals

**Goals:**
- Persist only the state needed to remember checked current food entries and their last reconciled required amount.
- Reconcile after each successful quantity-changing application write, in the same write transaction, so intermediate visits are unnecessary to detect increases.
- Keep checkbox and Clear Week writes owner-scoped and atomic.

**Non-Goals:**
- Persisting generated shopping quantities as the source of truth, retaining old checked items after they disappear, or changing food quantity calculations.
- Clearing saved meals or foods, adding package estimates, or adding a dated plan history.

## Decisions

1. **Store checked entries only.** Add migration `0007_shopping-checklist.ts` with a table keyed by `(user_id, food_source, food_id)`, a positive finite `observed_amount`, and an owner foreign key with cascade deletion. An absent row means unchecked. The composite identity preserves separate global and personal foods with the same name. Storing a row for every generated item would duplicate transient list data and require additional cleanup for unchecked items.
2. **Reconcile at the write boundary.** Extract a shopping read that accepts the repository's transaction client, and add an owner-scoped reconciliation function. After a successful plan add, serving update, card removal, or save of a planned meal, calculate the owner's current totals within that write transaction. Delete checked rows for absent foods or increased totals; update `observed_amount` when totals stay equal or decrease. Do this before commit, after a meal's ingredient replacement finishes. A read-time-only comparison would miss a decrease followed by an increase between visits. Personal-food rename, nutrition edit, and archive retain food identity and ingredient amounts, so their existing Meal Plan revalidation remains sufficient.
3. **Serialize check changes with plan writes.** A server action accepts food source, food ID, and the intended checked value; a server-only function obtains the current account. In a write transaction, derive the owner's current list, reject an absent food, then insert or update its checked row with the current amount, or delete it when unchecked. Revalidate `/meal-plan` after success and return actionable failure feedback. Sending a complete checklist from the browser would allow stale items to be recreated and complicate concurrent edits.
4. **Read current amounts and checks together.** The Meal Plan server read merges generated items with the owner's checked rows by source and ID; it never trusts submitted names, units, or amounts. Use a stable order for contribution rows so repeated floating-point sums are reproducible. If an unexpected out-of-band change makes a stored amount lower than the generated amount, render that item unchecked; application writes still perform the persistent reconciliation. The UI uses labelled native checkboxes, visible pending and error states, and keeps the existing empty state.
5. **Clear Week atomically.** Add an owner-scoped repository operation that deletes the owner's `planned_meals` and checked rows in one write transaction, including an already empty plan. Put an explicit confirmation step in Meal Plan before calling its server action. The action revalidates `/meal-plan` on success and reports failure without showing a partially cleared board. Clearing one table and then the other outside a transaction could leave an inconsistent plan.

## Risks / Trade-offs

- **Checklist write misses a quantity change:** Cover all current plan and meal mutation paths with repository tests; keep reconciliation inside their write transactions rather than relying on page revalidation.
- **Binary floating-point noise appears as an increase:** Make contribution ordering deterministic and compare stored and recomputed numeric amounts using the same calculation path; test fractional totals and repeated lines.
- **Concurrent check and plan edits race:** Use write transactions for both paths and derive the quantity inside the check transaction; test stale-item and cross-owner requests.
- **An existing plan has no checklist rows after migration:** Missing rows naturally render unchecked; no backfill is needed.

## Migration Plan

Apply the new additive migration before serving checklist writes. Existing plans then show unchecked items until the owner checks them. Deploy the read and write paths with the migration. Rollback of application code leaves the new table unused and preserves existing plan and meal data; removing the table later would discard only checklist state.
