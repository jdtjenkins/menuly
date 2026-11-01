# ingredient-meals Specification

## Purpose

Let signed-in users build and revise private ingredient-only recipes from shared foods and their own foods while keeping meal and food identities separate.

## Requirements

### Requirement: An owner can create and edit an ingredient meal
The application SHALL let a signed-in user save and edit a private meal with a stable identity, nonblank name, positive serving yield, and at least one ingredient with a positive amount in that food's fixed g or ml unit.

#### Scenario: Create a valid meal
- **WHEN** a signed-in user saves a named meal with a positive serving yield and valid ingredient amounts
- **THEN** the meal is stored under that account and can be viewed and edited by its owner

#### Scenario: Edit meal details and ingredients
- **WHEN** the owner changes the meal name, serving yield, ingredient amounts, or ingredient lines and saves valid values
- **THEN** the same meal identity reflects those changes without modifying any source food

#### Scenario: Invalid meal input
- **WHEN** the name is blank, serving yield is not positive, there are no ingredients, or an ingredient amount is not a positive finite number
- **THEN** the meal is not saved and the invalid input is identified

### Requirement: Meal ingredients reference eligible foods
The application SHALL let an owner choose a global food or their own active personal food for a new ingredient line, keep each line's source identity and amount, and show that source food's fixed unit.

#### Scenario: Choose eligible foods
- **WHEN** an owner adds a global food or one of their active personal foods to a meal
- **THEN** the ingredient line references that food and its amount uses the food's g or ml unit

#### Scenario: Reject ineligible food
- **WHEN** a new ingredient line references a nonexistent food, an archived personal food, or another account's personal food
- **THEN** the meal change is rejected without disclosing another account's food

#### Scenario: Preserve an existing archived ingredient
- **WHEN** a personal food already referenced by a meal is archived
- **THEN** the existing ingredient remains in that meal with its original food identity and amount, but the archived food cannot be selected for a new line or replacement

### Requirement: Meal editors offer a single autocomplete food picker
The create and edit meal forms SHALL use one text input with an accessible autocomplete dropdown to find eligible personal and global foods. Choosing a suggestion SHALL add an ingredient line or replace the line being edited; typed text alone SHALL NOT select a food.

#### Scenario: Search and add a food
- **WHEN** the owner types part of a food name and chooses a suggestion
- **THEN** a line for that food is added and the suggestion identifies its personal or global source and fixed unit

#### Scenario: Replace a line through the picker
- **WHEN** the owner chooses to replace an existing ingredient and selects a different suggestion
- **THEN** that line uses the selected food after the meal is saved, without changing other lines

#### Scenario: Use the picker with a keyboard
- **WHEN** the owner focuses the picker, moves through suggestions with the keyboard, and confirms one
- **THEN** the same food is selected as with a pointer, and focus remains usable after selection

#### Scenario: Leave text unselected
- **WHEN** the owner types a name but does not choose a suggestion
- **THEN** no ingredient is added or replaced from that text

### Requirement: Meal ingredients are editable in a table
The create and edit meal forms SHALL present selected ingredients as rows in a table with labeled food, amount, unit, and action columns. Each row SHALL retain a Remove action, and the table SHALL remain usable at narrow widths.

#### Scenario: Edit and remove rows
- **WHEN** the owner changes an amount or removes an ingredient row
- **THEN** the table reflects the change before saving and the saved meal reflects the remaining valid rows

#### Scenario: View on a narrow screen
- **WHEN** the owner opens the meal editor at a narrow viewport
- **THEN** food names, amounts, units, and row actions remain readable and operable

### Requirement: Replacing a global ingredient is explicit
The application SHALL replace a global-food ingredient with a personal-food ingredient only when the meal owner explicitly selects the personal food and saves the meal.

#### Scenario: Owner replaces a global ingredient with a copy
- **WHEN** an owner creates a personal copy of a global food, selects that copy for an existing ingredient line, and saves
- **THEN** that line references the personal copy and the global record remains unchanged

#### Scenario: Copy without meal edit
- **WHEN** an owner creates a personal copy of a global food without editing a meal that references the global food
- **THEN** the meal continues to reference the original global food

### Requirement: Meals are isolated by account
The application SHALL require a current account on every meal read and mutation and restrict meal access and personal-food references to the owning account.

#### Scenario: Anonymous request
- **WHEN** an anonymous visitor directly requests a meal page, record, or mutation
- **THEN** no private meal information is returned or changed

#### Scenario: Another account's meal
- **WHEN** a signed-in user requests or attempts to change another account's meal
- **THEN** that meal and its ingredients are neither disclosed nor changed

#### Scenario: Another account's personal ingredient
- **WHEN** a signed-in user submits another account's personal-food ID as a meal ingredient
- **THEN** the meal is not changed and no information about that food is disclosed

### Requirement: Meal listing offers list and grid views
The Meals area SHALL show the owner's meals as fully clickable, keyboard-focusable cards. It SHALL default to a list and offer a list/grid choice; the grid SHALL show three cards per row on wide screens and adapt to narrower screens.

#### Scenario: Open a meal from its card
- **WHEN** the owner activates any part of a meal card by pointer or keyboard
- **THEN** that meal's detail page opens

#### Scenario: Change the layout
- **WHEN** the owner switches between List and Grid
- **THEN** the same meals remain available, with three cards per row on a wide grid and fewer columns at narrow widths
