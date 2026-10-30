# Menuly V1 implementation roadmap

This roadmap orders the planned OpenSpec changes for V1. The overall product requirements, user journeys, architecture, and scope are in the [V1 product vision](product-vision.md). Each change below should be specified, reviewed, implemented, and validated on its own after its dependencies are complete.

Statuses are **Not Started**, **In Progress**, or **Complete**. `app-ui-and-test-foundation`, `libsql-data-foundation`, and `public-global-food-search` are complete; the remaining changes have not started.

## 1. `app-ui-and-test-foundation`

- **Status:** Complete
- **Dependencies:** None
- **Description:** Establish the Food, Meals, and Meal Plan navigation with a friendly React, Tailwind CSS, and daisyUI shell, plus the initial Vitest and Playwright setup.
- **Acceptance criteria:**
  - The starter screens are replaced by a usable application shell with the three named areas.
  - The shell uses the agreed styling tools.
  - Vitest and Playwright smoke checks run successfully.

## 2. `libsql-data-foundation`

- **Status:** Complete
- **Dependencies:** None
- **Description:** Establish server-side libSQL access and repeatable database migrations for local and remote environments.
- **Acceptance criteria:**
  - Local development uses a libSQL database file.
  - The same server-side data layer can be configured for remote libSQL.
  - Migrations can be applied repeatedly without corrupting existing data.

## 3. `railway-libsql-topology`

- **Status:** Not Started
- **Dependencies:** 2 — `libsql-data-foundation`
- **Description:** Prepare separate Next.js and Dockerized libSQL services on Railway, with persistent database storage and private connectivity.
- **Acceptance criteria:**
  - The application connects to libSQL over Railway's private network.
  - The database files live on a persistent Railway volume and survive a redeploy.
  - The database service has no public endpoint.

## 4. `public-global-food-search`

- **Status:** Complete
- **Dependencies:** 1 — `app-ui-and-test-foundation`; 2 — `libsql-data-foundation`
- **Description:** Add global food storage, a small development seed, and anonymous catalog search.
- **Acceptance criteria:**
  - Generate a migration with 30 common foods to be used in local development.
  - Anonymous searches require a search term and return a capped result set.
  - Public results contain food names and calories only, with a sign-in prompt for full nutrition.
  - Ordinary visitors cannot change global foods.

## 5. `google-sign-in-and-catalog-access`

- **Status:** Not Started
- **Dependencies:** 2 — `libsql-data-foundation`; 4 — `public-global-food-search`
- **Description:** Add Google sign-in, application sessions, and signed-in access to full global-food nutrition.
- **Acceptance criteria:**
  - A user can sign in with Google and sign out.
  - Signed-in users can view full catalog nutrition; unauthenticated requests cannot obtain private fields or resources.
  - Persisted provider identity uses Google's subject ID without storing OAuth email, name, picture, access token, or refresh token.

## 6. `personal-foods`

- **Status:** Not Started
- **Dependencies:** 4 — `public-global-food-search`; 5 — `google-sign-in-and-catalog-access`
- **Description:** Let signed-in users create and edit private foods.
- **Acceptance criteria:**
  - A private food requires a name, fixed g or ml unit, positive reference amount, and calories; protein, carbohydrates, and fat are optional.
  - Users can view and edit only their own private foods.
  - Nutrition values describe the food's reference amount and remain distinct from a measured zero when missing.

## 7. `clone-global-food`

- **Status:** Not Started
- **Dependencies:** 4 — `public-global-food-search`; 6 — `personal-foods`
- **Description:** Allow a user to copy a global food into their private catalog and edit the copy.
- **Acceptance criteria:**
  - A clone has its own food ID and owner.
  - Editing the clone leaves the global entry unchanged.
  - Existing meals are never switched to the clone automatically.

## 8. `ingredient-meals-and-nutrition`

- **Status:** Not Started
- **Dependencies:** 4 — `public-global-food-search`; 5 — `google-sign-in-and-catalog-access`; 6 — `personal-foods`
- **Description:** Let users create and edit private ingredient-only meals and see nutrition calculated from current food values.
- **Acceptance criteria:**
  - A meal has a name, a positive serving yield, and food ingredients with positive amounts in each food's fixed unit.
  - Ingredient nutrition scales from each food's reference amount; whole-meal and selected fractional-serving totals calculate correctly.
  - Editing a food updates meals that use it without storing stale static meal totals.
  - Missing values produce marked known subtotals and identify the affected foods and nutrients.
  - Users can access only their own meals and can manually replace a global ingredient with a private clone.

## 9. `archive-personal-food`

- **Status:** Not Started
- **Dependencies:** 6 — `personal-foods`; 8 — `ingredient-meals-and-nutrition`
- **Description:** Let users archive private foods without breaking existing meals.
- **Acceptance criteria:**
  - Before archiving a food used in meals, the interface names those meals and requires explicit confirmation.
  - Archived foods cannot be selected for new meal ingredients.
  - Existing meals retain their references and continue to calculate nutrition.

## 10. `weekly-meal-plan`

- **Status:** Not Started
- **Dependencies:** 5 — `google-sign-in-and-catalog-access`; 8 — `ingredient-meals-and-nutrition`
- **Description:** Add one saved, non-dated Monday-to-Sunday plan per user, initially managed through autocomplete and simple card controls.
- **Acceptance criteria:**
  - Users can select saved meals through autocomplete and place multiple cards on any day.
  - Each card has a positive planned serving count, including fractional values; the same meal can appear more than once.
  - Users can remove cards or reassign them to another day, and the plan persists between visits.
  - Users cannot access or change another user's plan.

## 11. `generated-shopping-list`

- **Status:** Not Started
- **Dependencies:** 8 — `ingredient-meals-and-nutrition`; 10 — `weekly-meal-plan`
- **Description:** Generate exact shopping quantities from the current weekly plan.
- **Acceptance criteria:**
  - Each card's ingredients scale by its planned servings divided by the meal's serving yield.
  - Amounts combine only for the same food ID and retain that food's g or ml unit; same-named global and private foods remain separate.
  - The list updates when relevant foods, meals, or plan cards change or disappear.
  - The list shows exact quantities without package or pantry adjustments.

## 12. `shopping-checklist-and-clear-week`

- **Status:** Not Started
- **Dependencies:** 10 — `weekly-meal-plan`; 11 — `generated-shopping-list`
- **Description:** Add persistent in-app checkboxes and a Clear Week action.
- **Acceptance criteria:**
  - Checked state persists between visits and stays with unchanged items.
  - If a change increases an item's required amount, that item becomes unchecked; items no longer needed disappear.
  - Clear Week removes all planned cards and resets the checklist.

## 13. `drag-and-drop-meal-planning`

- **Status:** Not Started
- **Dependencies:** 10 — `weekly-meal-plan`
- **Description:** Add drag-and-drop alongside the existing autocomplete planning flow.
- **Acceptance criteria:**
  - Users can drag a saved meal from the Meals list onto a day to add a card.
  - Users can drag an existing card between days.
  - Autocomplete and non-drag controls remain available.

## 14. `account-deletion`

- **Status:** Not Started
- **Dependencies:** 5 — `google-sign-in-and-catalog-access`; 6 — `personal-foods`; 8 — `ingredient-meals-and-nutrition`; 10 — `weekly-meal-plan`; 12 — `shopping-checklist-and-clear-week`
- **Description:** Let a signed-in user delete their account and all associated private data.
- **Acceptance criteria:**
  - Account deletion removes the user's private foods, meals, plan cards, and checklist state.
  - Global foods and other users' data remain unchanged.
  - The deleted account can no longer use its prior session.

## 15. `production-food-import`

- **Status:** Not Started
- **Dependencies:** 4 — `public-global-food-search`; production dataset source and format to be chosen
- **Description:** Perform the one-time import of the larger global food catalog. The small development seed allows earlier changes to proceed without this dataset.
- **Acceptance criteria:**
  - Imported entries receive stable food IDs and are read-only to ordinary users.
  - Import validation checks the expected calories, protein, carbohydrates, and fat values.
  - If an imported entry is incomplete, meals using it still show the agreed incomplete-nutrition warning.
  - No automated catalog refresh is introduced.
