# Spec Delta

## Purpose

Let signed-in users keep one private, reusable Monday-to-Sunday plan of saved meal occurrences with independently chosen serving quantities.

## ADDED Requirements

### Requirement: An owner has one reusable weekly plan
The application SHALL show a signed-in user one persistent, non-dated Monday-to-Sunday plan containing only that user's planned meal cards.

#### Scenario: Empty plan
- **WHEN** a signed-in user with no planned cards opens Meal Plan
- **THEN** all seven named days are available and the user can add a saved meal

#### Scenario: Return to plan
- **WHEN** the owner returns to Meal Plan after adding cards or signs in again later
- **THEN** the same cards appear on their assigned days

### Requirement: The week is shown as a day-column table
The Meal Plan area SHALL show a table with Monday through Sunday as seven columns, each containing that day's cards and an add-meal autocomplete below them. The table SHALL remain usable when it extends beyond a narrow viewport by allowing horizontal scrolling.

#### Scenario: View all days
- **WHEN** the owner opens the plan
- **THEN** the day headers appear in Monday-to-Sunday order above their respective cards and add controls

#### Scenario: Narrow screen
- **WHEN** the owner views the plan on a screen narrower than the table
- **THEN** they can scroll horizontally to reach every day's cards and add control

### Requirement: An owner can add saved meals to a day
Each day column SHALL offer an accessible autocomplete of the owner's saved meals. Clicking a suggestion or pressing Enter on a highlighted suggestion SHALL immediately add that meal to that day with one planned serving. Typed text alone SHALL NOT add a card.

#### Scenario: Add with a pointer
- **WHEN** the owner clicks a saved-meal suggestion beneath Wednesday
- **THEN** a Wednesday card referencing that meal is saved with one planned serving

#### Scenario: Add with Enter
- **WHEN** the owner highlights a saved-meal suggestion beneath Friday and presses Enter
- **THEN** a Friday card referencing that meal is saved with one planned serving and the input remains usable

#### Scenario: Multiple occurrences
- **WHEN** the owner adds the same meal twice to one day or to different days
- **THEN** each occurrence is a separate card with its own day and serving count

#### Scenario: Typed name without selection
- **WHEN** the owner types a meal name and presses Enter without highlighting or selecting a suggestion
- **THEN** no card is created from that text

#### Scenario: Invalid meal, day, or servings
- **WHEN** an add request uses a missing or unowned meal, a day outside Monday through Sunday, or a serving count that is zero, negative, or not finite
- **THEN** no card is created and the user receives actionable feedback without disclosure of another user's meal

### Requirement: An owner can manage each planned card
The application SHALL save a card's day immediately when selected and save a positive finite planned serving count automatically after a brief pause in editing, without a Save card button. The owner SHALL be able to remove the card. These changes SHALL leave its meal reference and other occurrences unchanged.

#### Scenario: Move a card with controls
- **WHEN** the owner reassigns a card from Monday to Friday
- **THEN** the change saves without another action and that card appears on Friday with its meal and serving count preserved

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
- **WHEN** a card update supplies an invalid day or a serving count that is blank, zero, negative, or not finite
- **THEN** the invalid change is not saved, the existing stored card remains unchanged, and the invalid input is identified

#### Scenario: Automatic save fails
- **WHEN** a valid automatic card update cannot be saved
- **THEN** the user sees a save error and can retry without losing the entered value

### Requirement: Planned cards retain meal identity
Each planned card SHALL reference a saved meal by stable identity and show that meal's current name rather than storing an independent meal copy.

#### Scenario: Meal renamed
- **WHEN** the owner renames a meal that appears on their plan
- **THEN** its planned cards display the updated name and retain their day and serving count

### Requirement: Weekly plans are private
The application SHALL verify the current account for every plan read and mutation and SHALL restrict cards and selectable meals to that account.

#### Scenario: Anonymous access
- **WHEN** an anonymous visitor requests the plan or a plan mutation directly
- **THEN** no private plan or meal data is returned or changed

#### Scenario: Another owner's card
- **WHEN** a signed-in user requests or attempts to change another account's card
- **THEN** that card is neither disclosed nor changed

#### Scenario: Another owner's meal
- **WHEN** a signed-in user submits another account's meal ID to add a card
- **THEN** no card is created and no information about that meal is disclosed
