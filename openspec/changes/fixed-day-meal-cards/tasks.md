# Tasks

## 1. Fixed-day card updates

- [x] 1.1 Make planned-card updates accept and persist servings only, leaving the existing weekday unchanged; add repository and action tests for a supplied alternate weekday, invalid servings, and owner isolation, and verify they pass.
- [x] 1.2 Remove the Day selector and day-change draft logic from planned-card controls while retaining automatic serving saves, errors, and removal; update focused component tests for rapid edits and retry, and verify they pass.

## 2. Weekly board behavior and documentation

- [x] 2.1 Update the weekly-plan browser flow to verify no Day selector, retained day after serving edits, and working removal on desktop and mobile; run the browser check.
- [x] 2.2 Update the roadmap's weekly-plan and future drag-and-drop acceptance criteria for fixed-day cards, and verify they match the spec and UI.

## 3. Integration checks

- [x] 3.1 Run type checking, lint, unit tests, the relevant browser tests, a production build, and strict OpenSpec validation; verify existing add, edit-servings, remove, and privacy behavior remains intact.
