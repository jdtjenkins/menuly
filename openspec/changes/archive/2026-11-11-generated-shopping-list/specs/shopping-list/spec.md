# Spec Delta

## Purpose

Give signed-in users an accurate in-app list of the food quantities required by their current weekly meal plan.

## ADDED Requirements

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
