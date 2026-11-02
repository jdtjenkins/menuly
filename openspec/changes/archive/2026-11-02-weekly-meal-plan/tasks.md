# Tasks

## 1. Plan storage and rules

- [x] 1.1 Add `0006_weekly-meal-plan.ts` with owner, meal, weekday, and positive serving constraints plus indexes; verify fresh and upgraded databases apply it once and preserve existing meals in migration tests.
- [x] 1.2 Add plan input validation and owner-scoped repository operations for listing, adding, updating, removing, and bounded meal search; verify unit and repository tests cover fractions, invalid input, duplicate occurrences, renamed meals, and cross-account IDs.

## 2. Server access and Meal Plan interface

- [x] 2.1 Add server-only plan functions and actions that resolve the current account, recheck meal ownership on add, return safe errors, and revalidate the plan; verify tests reject anonymous, missing, and foreign IDs without mutation or data disclosure.
- [x] 2.2 Replace the Meal Plan placeholder with seven day sections, a signed-out state, and an empty-plan path to creating a meal; verify the page renders all days and only owner cards in browser tests.
- [x] 2.3 Add an accessible saved-meal autocomplete and add-card form with selected meal identity, day, and fractional servings; verify keyboard selection, unselected text, validation feedback, and multiple occurrences in browser tests.
- [x] 2.4 Add per-card day, servings, and remove controls with clear labels and error feedback; verify one occurrence can move, change to fractional servings, or be removed without affecting another in browser tests.
- [x] 2.5 Replace the day-section grid with a seven-column table whose cells contain cards and an add control below them; verify day order, header-to-card association, and horizontal access to Sunday at a narrow viewport in browser tests.
- [x] 2.6 Put an accessible saved-meal autocomplete in each day cell and make pointer selection or Enter on a highlighted suggestion add that meal immediately with one serving; verify both input methods, duplicate occurrences, no add from unselected text, and usable focus after adding in browser tests.
- [x] 2.7 Replace each card's Save card form with automatic serving and day updates, local validation, and saving or failure feedback; verify browser and component tests cover fractional servings, immediate day moves, invalid input, rapid edits, failed saves, retry, and the absence of Save card.

## 3. Integrated verification

- [x] 3.1 Run configured type checking, linting, unit tests, relevant Playwright journeys, and production build; resolve failures and verify the plan persists across a fresh visit and meal renames display current names.
- [x] 3.2 Run type checking, linting, unit tests, relevant Playwright journeys, and a production build after the table and per-day picker changes; verify the existing card controls, persistence, and meal renames still work.
- [x] 3.3 Run type checking, linting, unit tests, relevant Playwright journeys, and a production build after automatic card saving; verify add, remove, persistence, and meal renames still work.
