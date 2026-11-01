# Proposal

## Why

Signed-in users can inspect the shared catalog but cannot record foods with their own nutrition values. Personal foods are the next dependency for building meals from user-owned ingredients.

## What Changes

- Let a signed-in user create, find, view, edit, and archive their own foods from the Food area. Archiving removes a food from the active list while retaining its record and stable ID.
- Give each personal food a stable ID and owner, a required name, fixed g or ml unit, positive reference amount, required calories, and optional protein, carbohydrates, and fat. Keep unknown nutrients distinct from measured zero.
- Keep the chosen unit unchanged after creation; allow edits to the name, reference amount, and nutrition values.
- Enforce ownership for every read and mutation, including direct requests, while preserving anonymous calorie-only global search and read-only global foods.
- Show personal foods by default for signed-in users, with a "See global foods" control that opens the shared catalog and a clear way back. Remove visible IDs from food cards while keeping identities stable internally.
- Leave global-food cloning, meal-aware archive warnings, meals, and account deletion to their separate roadmap changes.

## Capabilities

### New Capabilities

- `personal-foods`: Owner-scoped personal food creation, listing, detail, editing, archiving, validation, and stable nutrition references.

### Modified Capabilities

- `authenticated-food-catalog`: Open the signed-in global list on request rather than by default, and omit internal food IDs from visible catalog cards while retaining full nutrition.

## Impact

- Keep the existing personal-food migration unchanged and add a later migration for archival state, plus owner-scoped archive actions and active-list filtering.
- Put the personal-food list first for signed-in users and show the global catalog after an explicit view switch. Keep anonymous public search behavior unchanged.
- Add archive, view-switch, card-presentation, isolation, and browser journey tests plus updated documentation.
