# Tasks

## 1. Saved-meals source in Meal Plan

- [x] 1.1 Fetch the current owner's meal summaries on `/meal-plan` and render a named saved-meals source list with a create-meal empty state; verify an owner sees their meals and an empty account sees the empty state in the weekly-plan end-to-end test.
- [x] 1.2 Place the source list beside the board on wide screens and before it on narrow screens without page-level overflow; verify the existing desktop and mobile board geometry checks and source-list visibility in the end-to-end test.

## 2. Drop interaction and feedback

- [x] 2.1 Make saved-meal entries draggable and day cells accept only the app's meal payload; use the existing add action with the target weekday and one serving, and verify a drop adds the correct card and a second drop creates a distinct occurrence in an interaction test.
- [x] 2.2 Add valid-target, hover, pending, and failure feedback, clear drag state on cancel or invalid drop, and prevent duplicate submission while pending; verify these states and unchanged plan content on a failed add in interaction tests.
- [x] 2.3 Keep planned cards non-draggable and autocomplete, serving editing, removal, and Clear Week usable; verify these paths and shopping-list reconciliation in the weekly-plan end-to-end test.
- [x] 2.4 Correct the product vision's card-moving sentence to match the accepted fixed-day rule; verify it agrees with the weekly-plan spec and roadmap.

## 3. Integration verification

- [ ] 3.1 Run the relevant unit and end-to-end tests, TypeScript check, lint, and production build; verify each passes or record a concrete environment limitation and affected behavior.
