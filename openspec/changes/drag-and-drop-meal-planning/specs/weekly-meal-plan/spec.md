# Spec Delta

## ADDED Requirements

### Requirement: The plan offers saved meals as drag sources
The Meal Plan area SHALL show the signed-in owner's saved meals in a list from which a meal can be dragged toward the weekly board. The list SHALL identify each meal by name and remain usable when no meals have been saved.

#### Scenario: Saved meals available
- **WHEN** an owner with saved meals opens Meal Plan
- **THEN** their saved meals are available as drag sources in the same view as the seven day columns

#### Scenario: No saved meals
- **WHEN** an owner with no saved meals opens Meal Plan
- **THEN** the list shows an empty state and a way to create a meal, while the weekly board and its autocomplete remain available

#### Scenario: Private meal choices
- **WHEN** an owner opens the saved-meals list
- **THEN** another account's meals are not shown as drag sources

### Requirement: An owner can drop a saved meal onto a day
Each day column SHALL accept a dragged saved meal and add a new planned card for that day with one planned serving. A drop SHALL use the same ownership and input validation as adding through autocomplete. The interface SHALL indicate valid targets, an add in progress, and an add failure.

#### Scenario: Add by dropping
- **WHEN** the owner drags a saved meal onto Thursday and drops it on that day
- **THEN** a new Thursday card references that meal with one planned serving and the shopping list reflects the new occurrence

#### Scenario: Add another occurrence
- **WHEN** the owner drops the same saved meal onto a day more than once
- **THEN** each successful drop creates a separate card on the chosen day

#### Scenario: Cancel or drop outside a day
- **WHEN** the owner cancels a drag or releases the meal outside a valid day target
- **THEN** no card is created

#### Scenario: Invalid or unavailable meal
- **WHEN** a drop submits a missing or unowned meal ID
- **THEN** no card is created and the owner sees an error without information about another account's meal

#### Scenario: Add fails
- **WHEN** a valid drop cannot be saved
- **THEN** the owner sees an error and can retry without losing the existing plan

### Requirement: Drag planning preserves fixed cards and non-drag controls
Planned cards SHALL stay on the day where they were created and SHALL NOT be draggable to another day. The per-day autocomplete, serving editor, removal control, and Clear Week SHALL remain available independently of drag-and-drop.

#### Scenario: Existing card cannot be moved
- **WHEN** the owner attempts to drag a planned card toward another day
- **THEN** the card is not a drag source and its assigned day does not change

#### Scenario: Plan without dragging
- **WHEN** the owner uses a keyboard or touch device, or chooses not to drag
- **THEN** they can still add a saved meal through the day-specific autocomplete and manage planned cards with the existing controls
