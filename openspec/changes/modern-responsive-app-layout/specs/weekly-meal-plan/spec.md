# Spec Delta

## MODIFIED Requirements

### Requirement: The week is shown as a day-column table
The Meal Plan area SHALL show a standalone, full-width board section with a table of Monday through Sunday as seven columns, each containing that day's cards and an add-meal autocomplete below them. The board SHALL not be enclosed in a single content card. The table SHALL remain usable when it extends beyond a narrow viewport by allowing horizontal scrolling within the board.

#### Scenario: View all days
- **WHEN** the owner opens the plan
- **THEN** the day headers appear in Monday-to-Sunday order above their respective cards and add controls

#### Scenario: Narrow screen
- **WHEN** the owner views the plan on a screen narrower than the table
- **THEN** they can scroll horizontally to reach every day's cards and add control

#### Scenario: Standalone board
- **WHEN** the owner opens the plan on a wide desktop viewport
- **THEN** the seven day columns use the available page width as one workspace without an enclosing card around the table
