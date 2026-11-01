# Design

## Context

See `proposal.md` and `specs/global-food-cloning/spec.md`. Signed-in users reach the global catalog through `/food?view=global`; its cards already have stable internal global IDs but no visible ID line. The existing `/food/personal/new` form creates owner-scoped rows after validation. Global-food calories and optional nutrients can be `NULL`; personal-food calories cannot. Global rows can also contain values outside the personal form's length, precision, or maximum-value limits. There are no meal records yet.

## Goals / Non-Goals

**Goals:**

- Reuse the personal-food creation boundary and validation for a reviewed copy.
- Keep the source global row and all other personal copies independent from the new row.
- Authorize source lookup and creation on the server for each request.

**Non-Goals:**

- Add a source-to-copy relationship, migration, global-food writes, automatic synchronization, or meal-ingredient replacement.

## Decisions

### Use one reviewed creation flow for every global food

A "Copy to My foods" link on each signed-in global card opens `/food/personal/new?clone=<global-id>`. The server loads the exact global row after checking the current account and passes its values as initial form input. The form remains editable, so the user can correct missing calories or any source value outside personal-food limits before saving. `NULL` nutrients become blank fields; explicit zero stays `0`. No personal row is inserted by opening or cancelling the form. A direct insert was considered, but it cannot handle missing required calories or out-of-range source values consistently.

### Recheck identity and source on submit

The clone form uses a server action bound to the source global ID, rather than trusting a hidden form field or client-provided nutrition as proof of the source. The action checks the current account, confirms the source still exists in `global_foods`, validates the reviewed fields with the existing personal-food validator, and inserts through the owner-scoped personal repository. Missing source and invalid form values return safe, distinct feedback without a write. A generic create action alone would still enforce ownership, but would not detect a source removed after the draft opened.

### Reuse independent personal-food storage

The personal repository generates a fresh `personal-` ID for each save, with the current account as owner. No source ID or provenance column is stored. This keeps copies editable and archivable under the existing rules and ensures repeat copies and same-named foods remain separate. Global reads are exact and parameterized; neither saving nor later editing a copy updates `global_foods`. A schema link was considered, but V1 only requires an independent copy, and automatic follow-up from global changes would contradict that behavior.

### Keep public and signed-in rendering separate

Only the signed-in full-catalog cards render a copy link. Anonymous public search retains its name/calorie projection and has no clone controls. The clone route checks the account before looking up the full source row; anonymous or expired sessions return to the public Food area without source details, consistent with the existing new-food route. An unknown or personal-food ID used as a source gets a not-found state. On success, revalidate Food and return to My foods; cancellation can return to the global catalog.

## Risks / Trade-offs

- [Global source has missing or invalid-for-personal values] → Prefill without coercion, keep unknown optional nutrients blank, and show existing field-level validation errors until corrected.
- [Source disappears after the form opens] → Recheck the global ID on submit and save nothing if absent.
- [Forged source ID or stale session] → Resolve the exact global row server-side and check the current account on draft load and submission.
- [A cloned value appears tied to the source] → Give each save a fresh personal ID and document that future edits to either record do not propagate.
- [Private details leak through public search] → Render clone controls and full nutrition only after session verification; cover direct anonymous route and action attempts in tests.

## Migration Plan

No database migration is needed. Deploy the server lookup/action and the UI together; rollback removes the new entry path while saved personal copies remain ordinary personal foods.
