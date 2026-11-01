# Proposal

## Why

Users can browse shared foods and create personal foods, but cannot use a shared food as the starting point for an editable private entry. Cloning removes repeated entry of reference nutrition while preserving the shared catalog and the user's control over their own values.

## What Changes

- Add a "Copy to My foods" action to signed-in global-food results. It opens a personal-food form prefilled from the selected global food; no copy is saved until the user submits the form.
- Save the reviewed values as a new owner-scoped personal food with its own stable ID. The global food remains read-only, and the new food can be edited or archived through the existing personal-food flow.
- Preserve unknown optional nutrients as unknown. If the global food has no calories, leave that required field blank and require the user to enter a valid value before saving.
- Keep anonymous search calorie-only and without a cloning action. Leave meal creation and manual replacement of existing meal ingredients to later changes.

## Capabilities

### New Capabilities

- `global-food-cloning`: Copy a global food's reference values into a reviewed, independent, owner-scoped personal food.

### Modified Capabilities

None. Existing global catalog, personal-food validation, ownership, and editing requirements remain in force.

## Impact

- Signed-in global-food cards and the personal-food create form gain a clone entry path.
- Server-side global-food lookup and personal-food creation enforce account access and validate the saved copy; no schema migration or new dependency is expected.
- Repository, server-boundary, and browser tests cover independent IDs, copied and missing values, authorization, repeated copies, and global-food immutability.
