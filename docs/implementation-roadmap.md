# Menuly V1 implementation roadmap

This roadmap orders the planned OpenSpec changes for V1. The overall product requirements, user journeys, architecture, and scope are in the [V1 product vision](product-vision.md). Each change below should be specified, reviewed, implemented, and validated on its own after its dependencies are complete.

Statuses are **Not Started**, **In Progress**, or **Complete**. Completed changes are marked in their sections below. The current shell follows `dark-menuly-workspace`; the earlier light layout entries record the design that preceded it.

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

- **Status:** Complete
- **Dependencies:** 2 — `libsql-data-foundation`; 4 — `public-global-food-search`
- **Description:** Add Google sign-in, application sessions, and signed-in access to full global-food nutrition.
- **Acceptance criteria:**
  - A user can sign in with Google and sign out.
  - Signed-in users can view full catalog nutrition; unauthenticated requests cannot obtain private fields or resources.
  - Persisted provider identity uses Google's subject ID without storing OAuth email, name, picture, access token, or refresh token.

## 6. `personal-foods`

- **Status:** Complete
- **Dependencies:** 4 — `public-global-food-search`; 5 — `google-sign-in-and-catalog-access`
- **Description:** Let signed-in users create, edit, and archive private foods. My foods is their default Food view, with a switch to the global catalog.
- **Acceptance criteria:**
  - A private food requires a name, fixed g or ml unit, positive reference amount, and calories; protein, carbohydrates, and fat are optional.
  - Users can view and edit only their own private foods.
  - Nutrition values describe the food's reference amount and remain distinct from a measured zero when missing.
  - Archiving removes a private food from active views while preserving its record and stable ID. Meal-aware archive warnings remain in change 9.

## 7. `clone-global-food`

- **Status:** Complete
- **Dependencies:** 4 — `public-global-food-search`; 6 — `personal-foods`
- **Description:** Let signed-in users review a global food in a prefilled personal-food form, save an independent private copy, and edit it later. Missing calories must be supplied before saving.
- **Acceptance criteria:**
  - A clone has its own food ID and owner.
  - Editing the clone leaves the global entry unchanged.
  - Existing meals are never switched to the clone automatically.

## 8. `ingredient-meals-and-nutrition`

- **Status:** Complete
- **Dependencies:** 4 — `public-global-food-search`; 5 — `google-sign-in-and-catalog-access`; 6 — `personal-foods`
- **Description:** Let users create and edit private ingredient-only meals and see nutrition calculated from current food values. Include the meal-aware archive warning and retained references from the later archive item.
- **Acceptance criteria:**
  - A meal has a name, a positive serving yield, and food ingredients with positive amounts in each food's fixed unit.
  - Ingredient nutrition scales from each food's reference amount; whole-meal and selected fractional-serving totals calculate correctly.
  - Editing a food updates meals that use it without storing stale static meal totals.
  - Missing values produce marked known subtotals and identify the affected foods and nutrients.
  - Users can access only their own meals and can manually replace a global ingredient with a private clone.

## 9. `archive-personal-food`

- **Status:** Complete (delivered in `ingredient-meals-and-nutrition`)
- **Dependencies:** 6 — `personal-foods`; 8 — `ingredient-meals-and-nutrition`
- **Description:** Let users archive private foods without breaking existing meals.
- **Acceptance criteria:**
  - Before archiving a food used in meals, the interface names those meals and requires explicit confirmation.
  - Archived foods cannot be selected for new meal ingredients.
  - Existing meals retain their references and continue to calculate nutrition.

## 10. `weekly-meal-plan`

- **Status:** Complete
- **Dependencies:** 5 — `google-sign-in-and-catalog-access`; 8 — `ingredient-meals-and-nutrition`
- **Description:** Add one saved, non-dated Monday-to-Sunday plan per user, initially managed through autocomplete and simple card controls.
- **Acceptance criteria:**
  - Users can select saved meals through autocomplete and place multiple cards on any day.
  - Each card has a positive planned serving count, including fractional values; the same meal can appear more than once.
  - Users can edit a card's planned servings or remove it. Cards keep the day selected when they were added, and the plan persists between visits.
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
  - Existing cards stay on the day where they were added and cannot be dragged between days.
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

## 16. `modern-responsive-app-layout`

- **Status:** Complete
- **Dependencies:** 1 — `app-ui-and-test-foundation`; 10 — `weekly-meal-plan`
- **Description:** Widen the shared desktop shell, make the app responsive on mobile, refresh its daisyUI palette and action styling, and present the weekly table as a standalone board.
- **Acceptance criteria:**
  - Header and main content align in a wider desktop layout while ordinary mobile content stays within the viewport.
  - Actions use a consistent visual hierarchy with visible focus and disabled states.
  - The seven-day plan remains a semantic table and scrolls inside its own board region on narrow screens, without an enclosing card.

## 17. `light-railway-inspired-navigation`

- **Status:** Complete
- **Dependencies:** 16 — `modern-responsive-app-layout`
- **Description:** Keep the wide desktop top navigation, add a mobile slide-out navigation panel with account controls, and make Food, Meals, and Meal Plan share a restrained light presentation.
- **Acceptance criteria:**
  - The mobile panel contains Food, Meals, Meal Plan, and the existing sign-in or sign-out action, and closes through its control, backdrop, Escape, or route selection.
  - Desktop top links and account action remain visible, with current-area indication and keyboard focus.
  - Primary pages use consistent headings and content surfaces, forms remain comfortably narrow, and the weekly board stays wide without page-level mobile overflow.

## 18. `dark-menuly-workspace`

- **Status:** Complete
- **Dependencies:** 16 — `modern-responsive-app-layout`; 17 — `light-railway-inspired-navigation`
- **Description:** Present a dark-only custom Menuly daisyUI theme, persistent labelled desktop sidebar, mobile slide-out navigation, and a subtle dotted content canvas.
- **Acceptance criteria:**
  - Food, Meals, Meal Plan, and their forms use one dark Menuly palette with legible text and visible hover, focus, disabled, validation, and feedback states.
  - The full desktop sidebar keeps all three current-area links and the account action visible without a redundant Workspace caption; the mobile drawer retains the same controls and closes by control, backdrop, Escape, route selection, or crossing the desktop breakpoint.
  - Dots appear only on the main canvas, behind opaque content surfaces, and disappear in forced-colours mode.
  - The main area uses the width beside the sidebar; personal food Create, Copy, and Edit pages use the full content width while meal forms remain readable.
  - Each weekly day has an accessible meal search at the top of its column, with no visible search label or separator and no divider beneath the day heading. On mobile, one day fills the board width and the remaining visible height below the heading and scroll hint. On desktop, all seven days fill the remaining visible height below the heading. Days grow taller for meal cards, and the mobile hint explains that other days are reached by scrolling. The board scrolls horizontally within the page without nested vertical scrolling or page-level horizontal overflow.

## 19. `fixed-day-meal-cards`

- **Status:** Complete
- **Dependencies:** 10 — `weekly-meal-plan`; 18 — `dark-menuly-workspace`
- **Description:** Keep planned meal cards on their assigned day and simplify each card to serving editing and removal.
- **Acceptance criteria:**
  - A card's controls have no Day selector or move action, including on mobile.
  - Automatic serving edits and card removal remain available.
  - An update request cannot change the card's assigned day, including when an alternate weekday is supplied.
