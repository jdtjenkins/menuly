# Proposal

## Why

The generated shopping list shows what to buy but cannot record shopping progress. Completing the V1 planning-to-shopping journey also needs a way to clear the reusable week and start fresh.

## What Changes

- Add persistent, owner-private checkboxes to current shopping items in Meal Plan.
- Keep checked state for an item while its required amount stays the same or decreases; uncheck it when the required amount increases. Remove state when the item is no longer needed, so a later reappearance starts unchecked.
- Add Clear Week to remove all of the owner's planned cards and reset checklist state together, leaving saved meals and foods intact.
- Keep generated amounts, units, and food identity rules unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `shopping-list`: Add persistent checklist state, quantity-change reconciliation, and owner-private check mutations.
- `weekly-meal-plan`: Add an owner-scoped Clear Week action that resets the plan and checklist.

## Impact

- Add a libSQL migration for checklist state keyed by owner and food source/ID.
- Extend shopping and plan server reads, repository writes, and Meal Plan actions and presentation.
- Cover state transitions, account isolation, atomic clearing, and the signed-in shopping journey with Vitest and Playwright.
