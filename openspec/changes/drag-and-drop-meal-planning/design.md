# Design

## Context

See `proposal.md` for motivation and `specs/weekly-meal-plan/spec.md` for behavior. `/meal-plan` currently renders a server-fetched seven-column table with a client autocomplete in each day. `/meals` renders the owner's saved meals separately. `addPlannedMealAction` already validates a meal ID, weekday, and servings through the owner-scoped plan service, then reconciles shopping checks and revalidates the plan. The board has narrow-screen horizontal scrolling and height rules that the new source list must preserve.

## Goals / Non-Goals

**Goals:**
- Keep drag source and day targets in one route, with clear visual feedback and a stable board layout.
- Reuse the existing add mutation and its security and shopping behavior.
- Keep the day autocomplete and card controls fully usable without dragging.

**Non-Goals:**
- Moving existing cards, changing their servings while dragging, or dragging across browser tabs/routes.
- A new persistence model, drag library, or touch-specific gesture system.

## Decisions

### Put a saved-meals list in Meal Plan

Fetch the owner's meal summaries alongside plan cards and shopping items in the server page. Present them as a compact source list adjacent to the board on wide screens and stacked before it on narrow screens. Keep the list outside the seven-column table; constrain its width so it does not cause page-level overflow, while retaining the board's own horizontal scroll when needed. Reuse the existing `listCurrentMeals` owner-scoped read, rendering a create-meal link for an empty list. This avoids dragging across route navigation and keeps the separate Meals page focused on management. An always-open source list is preferred to a modal, because a modal would hide the day targets while dragging.

### Use native drag events around the existing add action

A small client boundary will own active meal ID, hovered weekday, pending state, and errors. Make only saved-meal entries draggable. Encode a Menuly-specific drag payload and mark the operation as a copy; day cells accept only that payload. On a valid drop, pass its meal ID, target weekday, and `servings=1` to `addPlannedMealAction`. The server remains authoritative about ownership and valid input; the client payload is never trusted. This avoids adding a dependency and preserves the autocomplete's mutation semantics. No drag handlers or draggable attributes go on planned cards.

### Keep drag feedback local and recoverable

Highlight eligible day targets during a meal drag and the current target on hover. Clear highlights on leave, drop, cancel, or drag end. Show pending feedback for a submitted drop and a nearby error if the add fails. Prevent duplicate submission while that drop is pending, then allow a fresh drop of the same meal to create another card. Preserve the existing plan on failure. Keyboard and touch users continue to use the accessible day autocomplete and card controls.

## Risks / Trade-offs

- [A source panel reduces horizontal space for the seven-day table] → Keep the panel compact, retain board-local horizontal scrolling, and verify no page-level overflow at desktop and mobile widths.
- [Native HTML drag-and-drop support varies on touch devices] → Keep autocomplete as the complete non-drag path; do not make touch gestures a prerequisite for planning.
- [A forged or stale client drag payload could name an unavailable meal] → Accept only app drag payloads in the UI and rely on the existing owner-scoped server validation for the final decision.
- [A drop can fail after the hover state has cleared] → Keep error feedback visible near the board with enough detail to retry via drag or autocomplete.

## Migration Plan

No schema or data migration is needed. Deploy the UI with the existing add action. Rollback is removal of the new source list and drag handlers; stored planned cards remain valid.
