# Spec Delta

## ADDED Requirements

### Requirement: Current shopping items can be checked off
The application SHALL let a signed-in owner check or uncheck each current shopping item in Meal Plan and SHALL persist that state across visits for the same food entry.

#### Scenario: Check an item and return
- **WHEN** the owner checks a current item and later returns to Meal Plan
- **THEN** that item remains checked with its current name, amount, and unit

#### Scenario: Uncheck an item
- **WHEN** the owner unchecks a previously checked item
- **THEN** it remains unchecked on the next visit

#### Scenario: Same-named entries have separate checks
- **WHEN** a global food and a personal food share a name and the owner checks only one
- **THEN** only the selected food entry is checked

### Requirement: Checklist state follows current required quantities
The application SHALL retain a current item's checked state when its required amount stays the same or decreases. It SHALL uncheck the item when its required amount increases, remove checklist state when the item is no longer needed, and start a later reappearance unchecked.

#### Scenario: Rename without quantity change
- **WHEN** a checked personal food is renamed without changing its required amount
- **THEN** its current name appears and it remains checked

#### Scenario: Amount decreases
- **WHEN** a checked item's required amount decreases after a card or meal edit
- **THEN** the new amount appears and the item remains checked

#### Scenario: Amount increases
- **WHEN** a checked item's required amount increases after a card or meal edit
- **THEN** the new amount appears and the item is unchecked

#### Scenario: Food is no longer needed and later returns
- **WHEN** an edit removes the last contribution of a checked food and a later edit adds that food again
- **THEN** the food disappears while unneeded and returns unchecked

### Requirement: Checklist changes are private and current
The application SHALL require the current account for checklist reads and writes and SHALL accept a check change only for a food entry currently required by that account's plan.

#### Scenario: Anonymous checklist request
- **WHEN** an anonymous visitor requests checklist data or submits a check change
- **THEN** no private state is disclosed or changed

#### Scenario: Another account's item
- **WHEN** an owner submits a check change for a food required only by another account
- **THEN** the other account's check state is neither disclosed nor changed

#### Scenario: Stale item
- **WHEN** an owner submits a check change for an item no longer required by their plan
- **THEN** the change is rejected and that item does not reappear
