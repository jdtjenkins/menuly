# Design

## Context

See [proposal.md](proposal.md) for motivation and the three spec deltas for behavior. Foods already have stable IDs, fixed g/ml units, reference amounts, nullable nutrients, and owner-scoped personal-food queries. `personal_foods.archived_at` retains archived rows, but the active-food repository hides them. The first meal implementation is present: the editor currently separates search from a select control and renders ingredient cards; the Meals list links only titles; meal detail shows separate whole-recipe and selected-serving totals. Numbered TypeScript migrations are hashed after application, so prior migration files must remain unchanged.

## Goals / Non-Goals

**Goals:** Keep meal storage normalized around food IDs; enforce account boundaries at every read and write; use one nutrition calculation path for whole and selected servings; keep archive warnings consistent with current meal references.

**Non-Goals:** Meal sharing, food diary entries, automatic ingredient substitution, nutrient snapshots, or deletion of archived food records.

## Decisions

### Store meal identity and ingredient references in a new migration

Add `0005_ingredient-meals.ts`: `meals` has a stable ID, `user_id` referencing `app_users`, nonblank name, and positive serving yield. `meal_ingredients` has stable line ID, meal FK, position, positive amount, and exactly one nullable FK of `global_food_id` or `personal_food_id` (an exclusive-or check). Add indexes for owner meal listings, ingredient order, and reverse lookup by personal food. Food FKs restrict deletion; account deletion cascades through meals and ingredients under the existing account lifecycle. Keep the personal-food record when archived.

Two nullable FKs and a check preserve database referential integrity for both food sources. A single polymorphic `food_source`/`food_id` pair would need application-only existence checks. Repeated ingredient lines are allowed and summed independently; line IDs and positions make edits predictable.

### Validate and save a meal as one owner-scoped operation

The server validates name, finite positive yield and amounts, at least one line, supported food source, and source ownership. It fetches global foods and active personal foods by ID, never trusting submitted unit or nutrition. Create and edit run in a transaction: verify current owner and eligible references, then write the meal and its complete ordered line set. Existing lines referencing an archived personal food may remain or have their amount changed; an archived food cannot be introduced as a new line or replacement. The form retains entered values and field-specific errors on rejection. Owner-scoped reads and updates, plus `requireAccount`, protect direct URLs and actions.

Replacing a global line with a cloned personal food is a regular explicit ingredient change. Copy creation alone does not rewrite any meal. This keeps food identities and ownership clear.

### Calculate from current food rows at read time

Meal queries join each line to its current global or owner-owned personal food, including archived rows for existing references. A pure calculation function handles four nutrients independently: sum known `amount / referenceAmount * nutrient`; track which ingredient foods have `null` for each nutrient. Scale the subtotal by `selectedServings / meal.servingYield` for positive finite selections. Keep full precision internally and round only for display; measured zero remains complete. Mark each nutrient with any missing contribution as incomplete and list affected food names. On meal detail, initialize the Selected servings input from the saved yield and render only one result panel. When the input text differs from that yield, show a small icon button with an accessible Reset servings label; reset restores the yield and hides the button. Computing on read avoids stale cached totals after personal-food edits; a stored nutrition snapshot would violate the live-update requirement.

### Use one autocomplete picker and an ingredient table

Replace the editor's separate search input, result select, and per-line food selects with one combobox-style text input and a suggestion popup. Query eligible personal and global foods as the owner types, identify source and fixed unit in each suggestion, and support pointer selection plus Arrow keys, Enter, and Escape. Choosing a suggestion adds a line; a row's Replace action targets the same picker so no second food select is needed. Keep the selected food ID and source in form state and submit those to the existing server validation; arbitrary typed text is never treated as a food ID. Keep archived foods visible in existing rows but out of suggestions. Handle delayed responses so older searches cannot replace newer suggestions.

Render chosen lines in a semantic table with Food, Amount, Unit, and Actions headers. Each row keeps its amount input, Remove button, and Replace action. Use horizontal scrolling at narrow widths instead of hiding controls or truncating essential labels. The create and edit routes share the form, so both receive the same interaction. This changes presentation and client state only; meal storage and validation remain as designed above.

### Offer a fully linked card list and responsive grid

Render each meal card as one link with a visible focus state, so the entire card opens the meal. Keep the list layout as the initial state and add an accessible List/Grid control on the Meals page. The grid uses three columns at wide widths and fewer at smaller widths. Keep the choice in page state; no database preference or migration is needed. The same owner-scoped meal query supplies both layouts.

### Confirm archive against current meal usage

Extend the archive control to load distinct names of the current owner's meals that reference the active food. Include those names in confirmation, or the existing generic prompt when unused. Submit an acknowledgement of the exact affected meal IDs/names shown. The server repeats the owner-scoped usage query in a write transaction and archives only if the acknowledgement still matches; otherwise it returns the updated list for renewed confirmation. This prevents a newly added reference from being hidden by a stale dialog. Existing meal reads continue through an archived-inclusive, owner-scoped reference query; active-food lists and new ingredient selection keep their existing archived filter.

## Risks / Trade-offs

- [A nutrient is unknown in one food] → Show a labeled known subtotal and the food responsible; never present it as a complete total.
- [Food values change while a meal is being viewed] → Recompute on the next server read; a refresh or navigation obtains current values. Browser-side serving scaling uses the returned recipe snapshot until then.
- [Archive and meal edit race] → Validate selection and archive acknowledgement within write transactions; a stale warning prompts renewed confirmation.
- [Large meal line count or numeric overflow] → Bound line count and finite input values in validation, reject nonfinite computed totals, and test representative extreme values.
- [Later roadmap overlap] → The `archive-personal-food` item will need its scope checked against these completed archive behaviors when that change is proposed.

- [Autocomplete results arrive out of order] → Ignore stale responses and verify keyboard selection and focus in browser checks.
- [Ingredient table overflows on mobile] → Allow horizontal scrolling while preserving column labels and actions.

## Migration Plan

The approved editor, listing, and nutrition display refinements require no additional database migration. Verify them against the existing owner-scoped data and calculation layer before archiving.

Add the next numbered migration without editing `0001`–`0004`; apply it through the existing local/remote migration runner. Existing food data requires no backfill because meals begin empty. Deploy the schema before routes that use it. For rollback during development, revert the application code and restore a database backup or create a forward migration; do not mutate applied migration history or drop referenced food rows.
