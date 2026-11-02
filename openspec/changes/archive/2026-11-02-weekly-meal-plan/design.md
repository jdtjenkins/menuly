# Design

## Context

See proposal.md for motivation and specs/weekly-meal-plan/spec.md for behavior. The implemented plan uses a seven-column table and per-day add pickers. Each card still has a form that requires Save card for serving and day changes; this revision changes that interaction.

## Goals / Non-Goals

**Goals:**
- Store each planned occurrence independently while preserving its meal reference and account ownership.
- Keep plan reads and writes on the server, with validation at the action and database boundaries.
- Present all seven days as table columns and make each column's picker usable by keyboard and pointer.
- Persist card edits without a separate save action while keeping invalid drafts and failures understandable.

**Non-Goals:**
- Persisting a separate week header or date range; the seven-day view is derived from cards.
- Precomputing nutrition or shopping quantities in plan records.
- Drag and drop, card ordering controls, or deletion of the entire week.

## Decisions

1. **Store cards in a new `planned_meals` table.** Add a migration after `0005_ingredient-meals` with card ID, `user_id`, `meal_id`, weekday integer (Monday=0 through Sunday=6), and positive finite serving count. Index by owner/day and meal. Use foreign keys with cascade on account and meal deletion. This is simpler than a `weekly_plans` parent table because every account has exactly one implicit reusable plan; an empty plan needs no row. An alternative parent table would add a one-to-one lifecycle without storing any plan-level attributes.
2. **Check meal ownership in each write.** Resolve the current account in server-only functions and constrain card operations by `user_id`. On add, look up `meal_id` under that owner in the same write transaction before inserting. A foreign key alone verifies existence, not ownership. Return the same unavailable response for missing and foreign IDs. Card update and removal use both card ID and owner ID. An alternative of trusting IDs received from the UI would expose cross-account mutations.
3. **Read current meal data through a join.** List cards joined to meals under the same owner and show the current meal name; do not copy it onto cards. This keeps renamed meals current and provides the meal identity needed by later shopping-list work. Do not store shopping totals or calculated servings on the card.
4. **Use a scrollable table for the week.** Render one table with seven day headers and one cell per day containing its cards followed by an add-meal picker. Give the cells enough width to keep controls readable and let the table's wrapper scroll horizontally on narrow screens. An adaptive grid would rearrange days into multiple rows, which would lose the requested column comparison. Keep the signed-out state outside the table.
5. **Use one picker instance per day.** Each instance binds its weekday rather than asking the user to choose it. A bounded, owner-filtered search supplies suggestions. A pointer choice or Enter on the highlighted option calls the existing add action with the selected meal ID, bound weekday, and `servings: "1"`; after success clear and refocus that picker. Keep typed text without a selected suggestion inert. Render suggestions in the cell's flow so the horizontal scroll container does not clip an overlay. Reuse the existing search and server validation; no new dependency or database change is needed.
6. **Validate independently of HTML controls.** Parse weekday and serving values server-side; accept only Monday-Sunday and positive finite numbers, including fractions. Apply database constraints as a final guard. The per-day picker always submits one serving; the existing card controls support later fractional edits and day moves.
7. **Save card controls automatically.** Keep a local draft for each card. Debounce valid serving changes for a short pause (about 300 ms), and submit a day selection immediately through the existing owner-scoped update action. Remove the Save card submit button and form submission path. Validate the draft before sending; show an error for blank, non-positive, or non-finite servings while preserving the last stored value. Serialize or coalesce writes for each card so an older response cannot overwrite a newer edit. Show saving and failure feedback, retain the draft on failure, and allow retry from the field without restoring the stale value. A separate save button would preserve the extra step the user asked to remove; updating on every keystroke would send transient partial numbers.

## Risks / Trade-offs

- **Concurrent meal deletion or ownership mismatch** → Check meal ownership and insert in one transaction; foreign keys reject a deleted meal. Return a generic unavailable message.
- **Autocomplete results change while typing** → Ignore stale responses and make the server recheck the selected meal on submission.
- **Duplicate submission or focus loss** → Disable a picker's suggestions while its add action is pending, clear it only after success, and restore focus to that day's input.
- **Narrow viewport and clipped suggestions** → Keep a minimum table width inside a labeled horizontal scroll region and expand suggestion lists within their cells.
- **Fraction precision** → Store numeric servings as `REAL`, as recipe yields already are; reject non-finite and non-positive values. Display values without forced integer rounding.
- **Overlapping automatic saves** → Serialize or coalesce updates per card and let the latest valid draft win; test rapid successive edits and a day change while a serving edit is pending.
- **Invalid or failed automatic save** → Keep the entered value visible, show field or save feedback, leave stored data unchanged, and retry on a later edit or blur.
- **Migration after deployment** → Existing databases have no plan data, so the additive migration needs no backfill. Apply it before deploying code that reads the table; if deployment is rolled back, leave the additive table in place and use a later migration for schema corrections rather than editing applied migration history.

## Migration Plan

Add `0006_weekly-meal-plan.ts`, run the existing migration command in each environment before serving the new route, and deploy the application. Existing meals and accounts remain untouched. Roll back application code if needed while retaining the additive table and its data.
