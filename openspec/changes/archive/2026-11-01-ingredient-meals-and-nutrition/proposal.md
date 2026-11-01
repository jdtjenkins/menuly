# Proposal

## Why

Menuly can store foods but cannot combine them into private recipes or show nutrition for a chosen number of servings. Meals need to stay accurate when food values change and honest when a nutrient is unknown.

## What Changes

- Let signed-in users create and edit private, ingredient-only meals with a name, positive serving yield, and positive amounts of global or their own active personal foods in each food's fixed g/ml unit.
- Show nutrition for a positive, potentially fractional, number of servings, initially set to the recipe yield so the full recipe is visible by default. Recalculate from current food references, and mark known subtotals incomplete when any ingredient lacks a nutrient value.
- Use one autocomplete text input to find and add eligible foods, and present ingredient lines in an editable table with a Remove action. Use the same editor on creation and editing.
- Make each meal card in the Meals list a single link and offer list and responsive three-column grid views.
- Show one Selected servings panel on a meal, with a reset icon that appears when the serving quantity differs from the recipe yield.
- Let an owner replace a global ingredient with a separately created personal copy through an explicit meal edit; never substitute it automatically.
- Before archiving a personal food used in meals, list the affected meal names and require confirmation. Existing meal references and calculations continue to use the archived record, while new ingredient selection excludes it. This pulls the meal-aware warning forward from the later `archive-personal-food` roadmap item at the user's request.

## Capabilities

### New Capabilities

- `ingredient-meals`: Owner-only meal creation, editing, ingredient selection and replacement, and retention of existing references to archived foods.
- `meal-nutrition`: Whole-recipe and selected-serving calculations, live food-value updates, and explicit handling of unknown nutrients.

### Modified Capabilities

- `personal-foods`: Archiving a food referenced by meals now identifies affected meal names before confirmation and preserves those meal references.

## Impact

- New meal and ingredient tables through a new numbered migration; existing migrations remain untouched.
- New owner-scoped meal reads and mutations, nutrition calculation, Meals UI, and an archive confirmation that queries the owner's affected meals. The approved UI refinements affect the meal editor, listing, and detail components without changing storage.
- Unit, integration, and browser coverage for calculations, incomplete nutrition, archive behavior, and account isolation.
