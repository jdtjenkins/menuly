# Spec Delta

## ADDED Requirements

### Requirement: An owner can clear the current week
The Meal Plan area SHALL offer Clear Week to a signed-in owner. After confirmation, the application SHALL remove all of that owner's planned cards and reset their shopping checks together while preserving saved meals and foods.

#### Scenario: Clear a populated week
- **WHEN** the owner confirms Clear Week for a plan with cards and checked shopping items
- **THEN** all seven days have no cards, the shopping list shows its empty state, and no prior check state remains

#### Scenario: Start planning again
- **WHEN** the owner adds a meal after clearing the week
- **THEN** its required shopping items appear unchecked

#### Scenario: Cancel clearing
- **WHEN** the owner cancels Clear Week before confirmation
- **THEN** the planned cards and shopping checks remain unchanged

#### Scenario: Clear an already empty week
- **WHEN** the owner confirms Clear Week while the plan has no cards
- **THEN** the plan remains empty and any obsolete shopping checks are removed

#### Scenario: Clear operation fails
- **WHEN** Clear Week cannot complete
- **THEN** the owner sees an error and neither their cards nor their checks are partly cleared

#### Scenario: Another account or anonymous visitor
- **WHEN** an anonymous visitor or one owner attempts to clear another owner's week
- **THEN** no other account's cards or shopping checks are changed
