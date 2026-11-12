# Menuly V1 product vision

## Purpose

Menuly helps a signed-in user plan meals for a simple Monday-to-Sunday week and produce an in-app shopping list with the exact amounts of food needed. Nutrition calculations help users build and understand meals, but the shopping list is the main outcome.

The three main areas of the application are **Food**, **Meals**, and **Meal Plan**. A meal is an ingredient-only recipe, not a record of food already eaten.

This document is the high-level product reference for V1. It is not an OpenSpec change proposal or a set of implementation tasks.

## Main user journeys

1. **Find a food.** A visitor can search the global catalog by entering a search term. Public results are capped and show food names and calories only, with a prompt to sign in for full nutrition values. A signed-in user can browse and search the full catalog.
2. **Manage personal foods.** A signed-in user can create and edit private foods or clone a global food into an independent, editable private copy. Cloning does not change recipes that already use the global food.
3. **Build a meal.** A user names a meal, sets how many servings the whole recipe makes, and adds foods with amounts in each food's fixed unit. The app calculates nutrition for the whole recipe and for a chosen number of servings, including fractional servings.
4. **Plan the week.** A user adds saved meals to a non-dated Monday-to-Sunday view. Each day can have multiple meal cards. Meals can be added by dragging from a saved-meals list in Meal Plan or by typing into an autocomplete field and selecting a saved meal. Cards stay on the day where they were added. Each planned card can request a different number of servings from the recipe's stated yield.
5. **Shop.** The app combines the required amounts from all planned meal cards into an in-app shopping list. The user can check items off. Removing a card or changing a meal or food updates the list; **Clear Week** removes all cards and resets the list.
6. **Leave the app.** A user can sign out or delete their account. Account deletion removes their private foods, meals, plan, and checklist state, while leaving the global catalog intact.

## Food and nutrition rules

- The global food catalog is shared and read-only to ordinary users. Development uses a few basic seeded foods. Production uses one larger import; automated catalog refresh is not planned for V1. The production dataset has not been chosen yet.
- Each food uses exactly one measurement unit: grams (**g**) or millilitres (**ml**). The app does not convert between mass and volume.
- A food's nutrition values describe a specified reference amount in its own unit, such as 120 kcal per 30 g or 50 kcal per 100 ml. A recipe ingredient can use a different positive amount; values scale proportionally.
- V1 calculates calories, protein, carbohydrates, and fat. A custom food requires a name, a positive reference amount, a unit, and calories. Its other three values are optional. Global imported foods are expected to have all four values, but the app must tolerate incomplete entries.
- Missing nutrition is distinct from a measured zero. When any ingredient lacks a value, the meal shows the sum of known values as an incomplete subtotal, marks the affected total, and names the foods and values that are missing.
- Nutrition is calculated from the current food values rather than stored as a static total on a meal. Editing a private food automatically updates every meal that references it. A global food and its private clone remain independent.
- A meal's full-recipe nutrition is the sum of its scaled ingredients. Nutrition for a selected number of servings is the full-recipe total multiplied by `selected servings / recipe yield`.
- A user can archive a private food. Before archiving a food used in meals, the app lists those meals and requires explicit confirmation. Archiving removes the food from selection for new uses while preserving existing meal references and their calculations. A user can manually replace a global ingredient with a private clone in a meal.

## Weekly plan and shopping-list rules

- V1 has one saved, reusable, non-dated Monday-to-Sunday plan per user. It has no breakfast, lunch, or dinner slots.
- A planned meal card refers to a saved meal and stores the number of servings planned for that occurrence. The same meal can appear more than once. Shopping quantities scale by `planned servings / recipe yield` for each card.
- The shopping list sums amounts only when they refer to the **same food entry**. Foods with the same name remain separate if they are different entries, including a global food and a private clone. Each food's fixed g or ml unit carries through to the list.
- The list shows exact combined amounts. It does not estimate packets or bottles or subtract pantry stock.
- Checked state belongs to the user's current list. An unchanged item keeps its checked state. If a plan or recipe change increases the required amount, that item becomes unchecked so the extra amount is noticed. Items no longer needed disappear. Clear Week removes all planned meals and resets every check.
- The plan and checklist persist for the signed-in user between visits. The list is used in the app; export, printing, and sharing are outside V1.

## Privacy and access

- Google is the only sign-in provider in V1. The identity design should allow another provider to be added later, but automatic account linking is not part of V1.
- The application stores the Google subject ID as the provider identity. It does not persist OAuth email addresses, names, profile pictures, or provider access/refresh tokens. Custom food and meal names are free text; the application does not inspect them for personal information.
- Private foods, meals, plans, and checklist state are accessible only to their owner. Public catalog responses contain only the fields intended for anonymous visitors; hiding fields in the UI alone is insufficient.
- Anonymous catalog access requires a search term and returns a limited number of results. Request-rate controls can discourage bulk scraping, but a public search cannot guarantee prevention of copying.

## Architecture and technical direction

- The existing application is a Next.js App Router and React starter. The V1 UI will use React, Tailwind CSS, and daisyUI, with a friendly and approachable visual style.
- Next.js server-side code owns database access, authentication checks, public-field filtering, and mutations. The browser does not connect directly to libSQL.
- Development uses a local libSQL database file. On Railway, the Next.js app and a Dockerized libSQL server run as separate services. The database service stores its files on a persistent Railway volume, and the app reaches it through Railway's private network. The database service does not need a public endpoint.
- The conceptual data model has provider identities/accounts, foods, meals, meal ingredients, weekly plan cards, and shopping-list check state. Foods distinguish global entries from user-owned entries; archived user foods remain addressable by existing meals. Stable food IDs preserve meal references and prevent unintended merging in the shopping list.
- A shared data-access and calculation layer should work with the local file and remote libSQL connection. The exact auth library, database schema/migration tool, and import format remain technical design choices; they are not product decisions made here.
- Vitest covers calculation and data-rule unit tests. Playwright covers user journeys such as public versus signed-in catalog access, meal creation, recalculation after a food edit, weekly planning, and shopping-list updates. Next.js currently recommends end-to-end testing for async Server Components rather than relying on Vitest alone.

## Incremental product features

These are user-visible delivery slices, not implementation tasks or approved OpenSpec changes:

1. Public food search with a small development catalog and calorie-only anonymous results.
2. Google sign-in, full catalog access, and private custom foods.
3. Ingredient-only meals with live nutrition calculation and missing-value warnings.
4. The Monday-to-Sunday plan and generated, checkable shopping list.
5. Global-food cloning, private-food archiving, account deletion, and the one-time larger catalog import as separately reviewable additions where practical.

## Explicitly out of scope for V1

- Food diary or logging what was eaten.
- Cooking instructions, preparation notes, or other recipe content beyond a name and ingredient list.
- Dated weeks, plan history, recurring schedules, and breakfast/lunch/dinner slots.
- Public or shared meals, plans, or personal foods.
- More than one OAuth provider at launch or automatic linking across providers.
- Users editing global foods; automated global-catalog refreshes.
- Converting g to ml, household measures, package-size calculations, pantry tracking, or purchase recommendations.
- Shopping-list export, print, or sharing.
- A guarantee that public food search cannot be scraped.

## Open dependency

The source and format of the large production food dataset remain to be chosen. The importer should preserve stable food identities and validate the expected nutrition fields, while the application continues to handle missing fields safely.

## Technical references

- [Google OpenID Connect subject identifier](https://developers.google.com/identity/openid-connect/openid-connect)
- [libSQL Docker image and persistent data path](https://github.com/tursodatabase/libsql/blob/main/docs/DOCKER.md)
- [Railway private networking](https://docs.railway.com/networking/private-networking) and [volumes](https://docs.railway.com/volumes)
- [daisyUI Tailwind installation](https://daisyui.com/docs/install/)
- [Next.js Vitest](https://nextjs.org/docs/app/guides/testing/vitest) and [Playwright](https://nextjs.org/docs/app/guides/testing/playwright) guidance
