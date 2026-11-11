# Tasks

## 1. Shopping calculation and owner-scoped read

- [x] 1.1 Add a pure shopping-list aggregation function that scales each ingredient by planned servings / meal yield, groups by food source and ID, retains the fixed unit, and rejects invalid totals; verify with Vitest cases for fractional servings, repeated cards and lines, same-named distinct foods, and g/ml separation.
- [x] 1.2 Add an owner-scoped repository query and server-only read for current plan ingredients, including retained archived personal-food references; verify with a database fixture covering two accounts, current food names, and removal of the last contribution.

## 2. Meal Plan presentation and freshness

- [x] 2.1 Render the generated list and an empty state in Meal Plan with readable exact quantities, units, and source labels for same-named foods; verify with a focused rendered-component test or Playwright journey for populated and empty plans.
- [x] 2.2 Revalidate `/meal-plan` after successful plan serving edits and relevant meal and personal-food writes, preserving existing action outcomes; verify through action tests or a Playwright journey that saved card, meal, and food edits appear when Meal Plan is shown again.

## 3. Integration verification

- [x] 3.1 Run the relevant unit tests, shopping-list Playwright journey, lint, type check, and production build; verify all checks pass and compare the result with every shopping-list spec scenario.
