# Proposal

## Why

Meal cards already belong to a day when they are added. A second Day selector on every card adds clutter to the weekly board and exposes a move action the user does not need.

## What Changes

- **BREAKING:** Remove the Day selector and the ability to reassign an existing planned card to another day.
- Keep automatic serving edits and card removal. A card's day is chosen through that day's add-meal autocomplete.
- Make the update action and repository change servings only, so a direct update cannot move a card.
- Reconcile weekly-plan browser and unit checks and the roadmap's future drag-and-drop entry with fixed-day cards.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `weekly-meal-plan`: Planned cards keep their assigned day after creation; card controls edit servings and remove the occurrence without a day-move option.

## Impact

- `app/meal-plan/planned-meal-controls.tsx`, the planned-meal update action and repository, weekly-plan tests, and `docs/implementation-roadmap.md`.
- No database migration or new dependency is needed. Existing cards retain their assigned day and servings.
