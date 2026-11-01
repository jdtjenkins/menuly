# Design

## Context

See `proposal.md` for motivation and the two delta specs for behavior. The first implementation now has a separate `personal_foods` table, owner-scoped create/read/update operations, and a Food page that shows the global catalog above My foods. Account sessions resolve through `getCurrentAccount` and `requireAccount`. Migration `0003_personal-foods.ts` may already be applied and must remain unchanged.

## Goals / Non-Goals

**Goals:**

- Establish a stable personal-food identity and owner relationship usable by later meal references.
- Enforce owner checks at the server data boundary for reads and writes, including direct action requests.
- Keep form validation and unknown-versus-zero handling consistent across creation and edits.

**Non-Goals:**

- A shared food table refactor, global-food editing or cloning, meal integration, permanent personal-food deletion, meal-reference archive warnings, or account deletion UI.

## Decisions

### Keep personal foods in a separate owner-scoped table

The existing `0003_personal-foods.ts` adds a separate `personal_foods` table: opaque stable ID, `user_id` referencing `app_users(id)` with `ON DELETE CASCADE`, name, unit, reference amount, calories, and nullable protein/carbohydrates/fat. Its constraints and owner/name index remain in place. A separate table preserves the existing global-food schema and its public projection. A future meal ingredient can identify its source plus stable food ID; matching names never imply the same food. Editing changes the row in place so later references can read current values.

### Archive through an additive migration and an owner-scoped action

Add `0004_personal-food-archive.ts` with a nullable `archived_at` column; do not edit `0003`. List and active detail/edit queries filter `archived_at IS NULL`. A server action calls `requireAccount` and updates only `WHERE id = ? AND user_id = ? AND archived_at IS NULL`, retaining the row and its stable ID. Unknown, already archived, and other-owner IDs get the same not-found outcome. The UI labels the action "Archive food" and requires explicit confirmation explaining that it removes the food from My foods. The later `archive-personal-food` roadmap item can add meal-reference warnings and rules when meals exist. A hard delete was rejected because it would break future references and contradict the user's archive choice.

### Validate once at the mutation boundary and make ownership part of each query

Use a small typed validator for trimmed name and numeric form values. Treat blank optional nutrients as `null`, explicit `0` as zero, and reject malformed, negative, infinite, or out-of-range input rather than coercing blanks to zero. Bound input lengths and numeric precision to safe storage limits. Server actions call `requireAccount` and use parameterized SQL. Reads include `WHERE user_id = ?`; detail and update use both `id` and `user_id`, returning the same not-found result for unknown and other-owner IDs. The edit form shows the unit as read-only text; the mutation rejects a supplied different unit and never updates that column. Database constraints backstop the validator. This avoids relying on a hidden UI control or client-only checks for authorization. A generic repository method without an explicit owner argument was rejected because it makes accidental cross-account reads easier.

### Add a personal section and focused forms within Food

Keep anonymous global search unchanged. For a signed-in user, render My foods as the default Food view with a clear empty state, bounded owner-only list, and Create/Edit/Archive actions. Put a "See global foods" control above the personal list; choosing it shows the existing signed-in global search and pagination, with a "My foods" return control. A URL view parameter can preserve the chosen view across global search and pagination without putting personal data in the anonymous response. Remove the visible ID line from global cards while retaining IDs in server data for stable references and ordering. Put create and edit forms on `/food/personal/new` and `/food/personal/[id]/edit` so a direct URL also passes through the account boundary. An anonymous direct visit returns to the public Food area without private data; an unknown, archived, or other-owner edit ID shows a not-found state. Use accessible labels, field-level errors, keyboard-operable actions, and a narrow layout. On a successful save or archive, revalidate Food and return to My foods. Preserve submitted values and show field errors on validation failure. Server Components can load owner-scoped data behind Suspense; a small client form may use action state for feedback.

### Verify isolation with disposable databases and browser journeys

Migration and repository tests use disposable libSQL files with two accounts and a global entry. Cover existing validation and isolation, then add archive persistence, active-list filtering, retained IDs, and other-owner/archive replay refusal. Playwright uses the local OIDC provider to verify My foods as the signed-in default, the global view switch and return, no visible IDs, archive confirmation/cancellation, archived-food absence, direct-access denial, narrow screens, and keyboard interaction. Keep existing anonymous and global catalog tests as regression checks.

## Risks / Trade-offs

- [Owner data leaks through a direct route or stale page] → Check the account in every loader and action, scope each SQL statement by owner, avoid shared caching of personal results, and test direct requests and sign-out.
- [Blank input becomes a misleading zero] → Parse optional fields separately and preserve `NULL`; test clearing an optional field and explicit zero.
- [A unit change makes future meal quantities ambiguous] → Exclude unit from updates and reject a mismatched supplied unit; retain the stored unit in the edit UI.
- [Existing global behavior changes while adding personal UI] → Keep the global and personal readers separate and run the public and signed-in catalog browser checks.
- [Archiving a food loses meal references later] → Retain the row and ID; defer meal-specific warnings to the later meal-aware archive change.
- [A hidden global view becomes hard to find] → Place a clearly labeled "See global foods" control above the default personal list and offer a return action in global view.

## Migration Plan

1. Keep `0001_global-foods.ts`, `0002_accounts.ts`, and the potentially applied `0003_personal-foods.ts` unchanged. Add and apply `0004_personal-food-archive.ts` before deploying the archive action.
2. Deploy archive filtering/action and the revised Food view together. Existing global foods and anonymous public search remain available.
3. On application rollback, leave the additive archive column and migration ledger intact; do not rewrite an applied migration. A later migration can change the schema if needed.
