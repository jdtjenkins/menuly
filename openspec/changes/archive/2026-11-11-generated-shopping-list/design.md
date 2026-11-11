# Design

## Context

See `proposal.md` and `specs/shopping-list/spec.md`. The existing `planned_meals` table stores owner, meal ID, day, and servings; `meals` stores serving yield; `meal_ingredients` stores food references and amounts. Food names and fixed units live in global or personal food tables. The Meal Plan page already reads the current account and renders the seven-day board.

## Goals / Non-Goals

**Goals:**
- Derive shopping quantities from current records through one owner-scoped server read, without persisting derived totals.
- Keep food identity and unit intact through aggregation, including archived personal foods still referenced by meals.
- Present the list alongside the existing board and ensure navigation or card mutations show current data.

**Non-Goals:**
- Introducing a shopping-list table or migration for generated quantities.
- Storing checked state or adding Clear Week; the next roadmap change owns those behaviors.

## Decisions

1. **Query the current ingredients for the owner's planned cards.** Add a shopping-list repository read that joins `planned_meals`, `meals`, and `meal_ingredients`, then left-joins the matching global or personal food record. Constrain cards and meals to the owner and personal foods to that same owner. Include archived personal foods when referenced. Select card servings, meal yield, ingredient amount, food source and ID, name, and unit. This avoids repeated per-meal reads and guarantees the list uses current saved values. Reusing `getMeal` once per card would duplicate queries and repeated occurrences.
2. **Aggregate in a pure calculation function.** For each row, calculate `ingredient amount * planned servings / meal yield`, reject non-finite or non-positive source values, and add by a composite `(source, food ID)` key. Carry the food's unit and latest name into the result. Do not group by name or convert units. Use the existing numeric conventions for stored `REAL` values and render a readable decimal quantity without integer-only rounding or package estimates. A database `SUM` could aggregate, but keeping the formula in a tested function makes the scaling and identity rules explicit.
3. **Compute on request and invalidate the Meal Plan view after mutations.** Add a server-only read that requires the current account and passes its ID to the repository. Render the list in the existing dynamic Meal Plan page, with an empty state for no contributions and stable ordering by food name, source, then ID. Revalidate `/meal-plan` after plan serving edits and relevant meal or personal-food writes, as well as existing add/remove actions. The list needs no client-side persistence or polling; the current server render is authoritative when the user visits or refreshes Meal Plan.
4. **Keep the list read-only in this slice.** Use a semantic list or table with visible food name, quantity, and g/ml unit. Distinguish same-named entries by their global or personal source label so users can tell them apart. Do not add disabled checkboxes as a placeholder for the next change.

## Risks / Trade-offs

- **Binary floating-point artifacts in fractional totals** → Test fractional and repeated contributions, guard against non-finite totals, and use a decimal display formatter that removes representation noise without estimating packages or changing the stored values.
- **Stale Meal Plan after saving elsewhere** → Revalidate `/meal-plan` in the existing meal and personal-food action paths; query live records on render.
- **Large plan produces a large joined result** → Aggregate in one server read and render one item per distinct food. The current plan has no card limit, so avoid a query per card.
- **Missing or cross-owner food reference** → Keep owner checks in joins, reject incomplete source rows rather than exposing another account's record, and cover isolation in repository tests.

## Migration Plan

No schema migration or backfill is required. Deploy the read path and UI together. A rollback can remove this feature without changing stored plan, meal, or food data.
