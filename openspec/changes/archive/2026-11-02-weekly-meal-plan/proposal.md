# Proposal

## Why

Users can save meals and plan them across a reusable week. Showing every day side by side and adding meals directly within a day makes the plan easier to scan and fill out; saving each card separately adds unnecessary friction when adjusting servings.

## What Changes

- Present the reusable, non-dated Monday-to-Sunday plan as a seven-column table that can scroll horizontally when needed.
- Put an accessible saved-meal autocomplete below the cards in each day column. Clicking a suggestion or pressing Enter on a highlighted suggestion immediately adds that meal to that day with one planned serving.
- Let users add more than one card to a day and add the same meal more than once; typing without selecting a suggestion does not create a card.
- Give each card its own positive planned serving count, including fractions. Save valid serving changes automatically after a brief pause and day changes immediately, without a Save card button; retain the Remove control.
- Persist the plan across visits and enforce ownership on all reads and mutations.
- Keep drag and drop, shopping quantities, checklist state, and Clear Week in their separate roadmap changes.

## Capabilities

### New Capabilities

- `weekly-meal-plan`: Owner-scoped weekly meal cards, meal selection, serving quantities, day reassignment, and persistence.

### Modified Capabilities

None.

## Impact

- Add a new database migration for planned meal cards and server-side plan access and mutations using the existing account and libSQL patterns.
- Change `app/meal-plan/page.tsx` and its add-meal component from separate day sections and one shared add form to a scrollable table with a picker in each day column; retain the anonymous sign-in state.
- Update card controls and browser journey coverage for automatic serving and day changes, invalid input, and removal of the Save card button. No new dependency is expected.
