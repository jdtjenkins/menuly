# shopping-list Specification

## Purpose

Give signed-in users an accurate in-app list of the food quantities required by their current weekly meal plan.

## Requirements

### Requirement: A weekly plan generates exact shopping quantities
The application SHALL calculate each planned card's ingredient quantity as its meal ingredient amount multiplied by `planned servings / meal serving yield`, including fractional servings, without package or pantry adjustments.

#### Scenario: Scale a card by its servings
- **WHEN** a meal yields four servings, uses 300 g of a food, and a card plans two servings
- **THEN** that card contributes 150 g of the food to the shopping list

#### Scenario: Repeat a meal with different servings
- **WHEN** two cards for the same two-serving meal plan one and 0.5 servings, and the meal uses 200 ml of a food
- **THEN** the cards contribute 100 ml and 50 ml respectively

### Requirement: Shopping quantities combine by food identity
The application SHALL sum contributions only for the same food entry, preserve that entry's fixed g or ml unit, and display its current name. It SHALL keep different entries separate even when their names match.

#### Scenario: Same food across meals and lines
- **WHEN** multiple planned cards or ingredient lines reference the same food entry
- **THEN** their scaled amounts appear as one combined quantity in that food's unit

#### Scenario: Same-named foods are distinct
- **WHEN** a global food and a personal food have the same name and both occur in the plan
- **THEN** they appear as separate list items with quantities calculated for their respective identities

#### Scenario: Mixed fixed units
- **WHEN** the plan uses a food measured in g and another measured in ml
- **THEN** each item retains its own unit and no mass-to-volume conversion occurs

### Requirement: The list reflects the current plan and food data
The application SHALL derive the list from the owner's current planned cards, meal yields and ingredients, and food names and units whenever the list is viewed. It SHALL omit foods with no remaining contribution.

#### Scenario: Card changes
- **WHEN** the owner adds, removes, or changes the planned servings of a card
- **THEN** the list reflects the new required amounts when the plan is shown

#### Scenario: Meal changes
- **WHEN** the owner changes a planned meal's yield, ingredient amounts, or food references
- **THEN** the list reflects the saved meal changes when the plan is shown

#### Scenario: Food changes and archived references
- **WHEN** the owner renames a personal food or archives one still used by a planned meal
- **THEN** the list shows its current name and continues to include the retained ingredient reference

#### Scenario: Food no longer needed
- **WHEN** a card or meal edit removes the last contribution of a food
- **THEN** that food no longer appears in the list

### Requirement: The shopping list is available in Meal Plan
The application SHALL show signed-in users their generated shopping list in the Meal Plan area with each food's name, exact combined amount, and unit, and SHALL explain when the list is empty.

#### Scenario: Populated plan
- **WHEN** a signed-in user views a plan with saved cards
- **THEN** the shopping list shows the required food items and quantities in the app

#### Scenario: Empty plan
- **WHEN** a signed-in user views a plan with no cards
- **THEN** the shopping list shows an empty state rather than stale items

### Requirement: Shopping quantities are private
The application SHALL require the current account for a shopping-list read and SHALL calculate from only that account's cards, meals, and eligible food records.

#### Scenario: Anonymous request
- **WHEN** an anonymous visitor requests shopping-list data directly or opens Meal Plan
- **THEN** no private shopping-list data is disclosed

#### Scenario: Another account's data
- **WHEN** one signed-in user views their list while another account has planned cards and personal foods
- **THEN** the other account's cards, foods, and quantities are absent

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
