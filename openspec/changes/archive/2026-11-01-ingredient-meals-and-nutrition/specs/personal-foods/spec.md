# Spec Delta

## MODIFIED Requirements

### Requirement: An owner can archive a personal food
The application SHALL offer a confirmed archive action for an active personal food. Before confirmation, it SHALL list the names of the owner's meals that reference that food. Archiving SHALL remove it from active personal views while retaining its stored record, owner, unit, nutrition, stable ID, and existing meal references.

#### Scenario: Owner confirms archive
- **WHEN** the owner confirms archiving an active personal food
- **THEN** the food disappears from their active list and its stored record and ID remain intact

#### Scenario: Owner cancels archive
- **WHEN** the owner cancels the archive confirmation
- **THEN** the food remains active and unchanged

#### Scenario: Archived food is requested directly
- **WHEN** an archived food's edit page or mutation is requested
- **THEN** it is unavailable through the active personal-food flow

#### Scenario: Food is used by meals
- **WHEN** the owner starts archiving a personal food referenced by one or more of their meals
- **THEN** the confirmation lists the affected meal names before the owner can proceed

#### Scenario: A meal reference appears before confirmation completes
- **WHEN** a meal begins referencing the food after the warning was shown but before archive submission
- **THEN** the archive is not completed without renewed confirmation that includes the newly affected meal

#### Scenario: Owner confirms archive of a used food
- **WHEN** the owner confirms archiving a food after seeing the affected meal names
- **THEN** the food is absent from active personal views and its existing meal references and nutrition calculations remain available to the owner
