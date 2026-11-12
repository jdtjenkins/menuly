# Proposal

## Why

Planning currently requires searching for a saved meal in each day column, even when the owner can identify the meal in their Meals list. A visible saved-meals list beside the weekly board will let owners place meals directly on a day while keeping the existing autocomplete flow.

## What Changes

- Show the owner's saved meals as drag sources in the Meal Plan view, alongside the Monday-to-Sunday board.
- Let the owner drop a saved meal onto a day to create a new card on that day with one planned serving; repeated drops create separate occurrences.
- Keep existing cards fixed to their assigned days and retain autocomplete, serving editing, removal, and Clear Week.
- Provide clear drop, pending, and error feedback, while preserving non-drag access on touch and keyboard devices.

The product vision still says cards can be moved between days. The accepted `weekly-meal-plan` specification and the current roadmap explicitly keep cards fixed; this change follows those later, more specific requirements.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `weekly-meal-plan`: Add a saved-meal drag source and day drop targets as another way to create planned cards.

## Impact

The Meal Plan page, client interaction components, and weekly-plan interaction tests will change. The existing owner-scoped add action and plan repository can handle dropped meals; no database migration or new API is expected. The saved-meals list will need an owner-scoped read on the Meal Plan page. The separate Meals page remains available for meal management.
