# Proposal

## Why

The weekly plan currently stores meal occurrences but does not tell users what to buy. Generating exact quantities from its current cards completes the core planning-to-shopping journey and provides the basis for a later persistent checklist.

## What Changes

- Show a generated, read-only shopping list within Meal Plan for the signed-in user's current week.
- Scale each ingredient by the card's planned servings divided by the meal's serving yield, then combine amounts only for the same food entry.
- Preserve each food's current name and fixed g or ml unit, including separate rows for same-named global and personal foods.
- Recalculate the list when relevant cards, meals, or food names change, and remove quantities no longer required.
- Show a useful empty state when the plan has no ingredients to buy.

Persistent checked state and Clear Week remain in the subsequent `shopping-checklist-and-clear-week` change. Package estimates, pantry deductions, export, and sharing remain outside V1.

## Capabilities

### New Capabilities

- `shopping-list`: Derive and display an owner's exact shopping quantities from the current weekly plan.

### Modified Capabilities

None.

## Impact

- Add an owner-scoped shopping-list calculation and read path using the existing plan, meal ingredient, and food tables.
- Add shopping-list presentation to `app/meal-plan` and refresh it after relevant existing mutations.
- Add calculation, repository, and user-journey coverage. No new external dependency or database migration is expected for this read-only slice.
