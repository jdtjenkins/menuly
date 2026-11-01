# Tasks

## 1. Meal storage and access

- [x] 1.1 Add `0005_ingredient-meals.ts` with owner-bound meals, ordered ingredient lines, source FKs, constraints, and indexes; verify migration applies to a fresh test database and earlier migration hashes remain unchanged.
- [x] 1.2 Add meal input validation and owner-scoped transactional create/edit/read repositories, including archived-line preservation and rejection of new archived or foreign foods; verify repository tests cover valid saves, invalid values, direct access, and cross-account attempts.

## 2. Nutrition calculation

- [x] 2.1 Add a pure four-nutrient recipe and selected-serving calculator using current food reference values and per-nutrient missing-food tracking; verify unit tests cover scaling, fractional servings, measured zero, missing values, and nonfinite input.
- [x] 2.2 Connect meal reads to archived-inclusive owner-scoped food lookups and the calculator; verify integration tests show food edits change meal results while archived references still calculate.

## 3. Meals interface

Tasks 3.1–3.3 record the first implementation. Tasks 3.4–3.7 refine its presentation and interaction.

- [x] 3.1 Replace the Meals empty state with owner-only meal listing, create, detail, and edit flows using the existing navigation and form patterns; verify browser tests cover creating and editing a meal with global and personal ingredients and reject anonymous access.
- [x] 3.2 Show whole-recipe and selected-serving nutrition with a fractional-serving input, incomplete subtotals, and affected food names; verify browser tests cover known, missing, zero, and invalid-selection states.
- [x] 3.3 Support explicit replacement of a global ingredient with an independently created personal copy; verify a browser test shows cloning alone leaves the original meal reference unchanged and saving the replacement changes only that line.
- [x] 3.4 Replace the create/edit form's separate food search and select controls with one accessible autocomplete text input for adding and replacing ingredients; verify browser tests cover typing, pointer and keyboard selection, unselected text, source/unit labels, and archived-food exclusion.
- [x] 3.5 Render create/edit ingredient lines as a table with Food, Amount, Unit, Replace, and Remove controls, keeping narrow-screen access; verify browser tests cover amount changes, removal, replacement, and mobile usability.
- [x] 3.6 Make each Meals listing card one keyboard-focusable link and add a List/Grid view choice with three grid columns at wide widths; verify browser tests cover full-card activation, focus, both layouts, and narrow screens.
- [x] 3.7 Replace the meal detail's dual nutrition panels with one Selected servings panel defaulted to the recipe yield and a labeled reset icon that appears after a change; verify browser tests cover initial full-recipe values, fractional and invalid input, reset, and incomplete nutrition.

## 4. Meal-aware personal-food archive

- [x] 4.1 Extend the archive confirmation and action to list owner-visible affected meal names, recheck acknowledged usage transactionally, and preserve existing references; verify tests cover used, unused, canceled, stale, and cross-account archive attempts.
- [x] 4.2 Exclude archived foods from new ingredient choices while displaying them in existing meals; verify a browser test covers the archive warning, retained calculation, and blocked new selection.

## 5. Integration checks

- [x] 5.1 Run `pnpm lint`, `pnpm test:unit`, `pnpm build`, and the relevant Playwright suite; verify all required checks pass and document any environment-dependent limits in the implementation handoff.
- [x] 5.2 After the UI refinements, run `pnpm lint`, `pnpm test:unit`, `pnpm build`, and the relevant Playwright suite; verify all checks pass and report any environment-dependent limits.
