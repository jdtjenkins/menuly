# Spec Delta

## MODIFIED Requirements

### Requirement: An owner can manage each planned card
The application SHALL keep a planned card on the day selected when it was added. The owner SHALL be able to change its positive finite planned serving count automatically after a brief pause in editing, without a Save card button, and SHALL be able to remove the card. These changes SHALL leave its day, meal reference, and other occurrences unchanged. Card controls SHALL NOT offer a day selector.

#### Scenario: Card has no day-move control
- **WHEN** the owner views a planned meal card
- **THEN** its controls show serving editing and removal without a Day selector or other way to move that card

#### Scenario: Move a card with controls
- **WHEN** the owner attempts to reassign a card from Monday to Friday using its controls
- **THEN** no move control is available and the card remains on Monday

#### Scenario: Update cannot change the assigned day
- **WHEN** an update request includes a different day for an existing card
- **THEN** the card remains on its originally assigned day

#### Scenario: Change serving count
- **WHEN** the owner changes one card from two servings to 0.5 servings
- **THEN** the card stores 0.5 servings after a brief pause, without a save button, and other cards remain unchanged

#### Scenario: Rapid serving edits
- **WHEN** the owner changes a card's serving count more than once before automatic saving settles
- **THEN** the latest valid value is the one stored for that card

#### Scenario: Remove one occurrence
- **WHEN** the owner removes one of two cards referencing the same meal
- **THEN** only the selected card disappears

#### Scenario: Invalid card update
- **WHEN** a card update supplies a serving count that is blank, zero, negative, or not finite
- **THEN** the invalid change is not saved, the existing stored card remains unchanged, and the invalid input is identified

#### Scenario: Automatic save fails
- **WHEN** a valid automatic card update cannot be saved
- **THEN** the user sees a save error and can retry without losing the entered value
