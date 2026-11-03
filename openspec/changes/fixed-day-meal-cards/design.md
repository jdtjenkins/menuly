# Design

## Context

See proposal.md for motivation and the weekly-meal-plan delta for observable behavior. The current card editor stores a draft day and serving count, submits both in one update action, and the repository updates both columns. The add-meal autocomplete already chooses the day from its column. The roadmap also describes future dragging of existing cards between days.

## Goals / Non-Goals

**Goals:** Reduce each card to serving and remove controls while making the assigned day immutable after creation through the existing update path.

**Non-Goals:** Change the day selected when adding a card, remove existing cards, alter their stored data, or add drag-and-drop.

## Decisions

### Serving-only updates

Keep the add action's day and serving validation. Give card updates a serving-only input and update only the servings column for the authenticated owner. This makes the update action incapable of moving a card even if a caller supplies an extra weekday field. Retaining a hidden Day field or merely hiding the selector would leave the old behavior reachable through the update action.

### Simplified card editor

Remove the Day selector and day-change draft logic. Keep debounced serving saves, latest-value handling, error feedback, and removal. The card's assigned day remains available from its existing data for the remove button's accessible name.

### Roadmap reconciliation

Revise the completed weekly-plan acceptance criterion to describe fixed-day cards. Revise the future drag-and-drop entry so adding a saved meal to a day remains possible but dragging an existing card between days is not planned.

## Risks / Trade-offs

- [Callers that submit a weekday during an update may expect a move] -> The update ignores that field and preserves the stored day; browser and repository tests verify this.
- [Removing a control can disturb automatic serving saves] -> Keep the existing save flow and cover rapid edits, invalid input, retry, and removal in focused tests.

## Migration Plan

No database migration is needed. Existing cards stay on their current day. Rollback can restore the former editor and update behavior without changing stored data.
