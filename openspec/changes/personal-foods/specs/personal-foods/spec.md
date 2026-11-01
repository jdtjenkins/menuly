# Spec Delta

## Purpose

Let signed-in users keep their own food entries with trustworthy reference nutrition, separate from the shared catalog and private to their account.

## ADDED Requirements

### Requirement: A signed-in user can create a personal food
The application SHALL let a signed-in user create a personal food with a stable identity, a nonblank name, one g or ml unit, a positive reference amount, required calories, and optional protein, carbohydrates, and fat values for that reference amount.

#### Scenario: Create a complete food
- **WHEN** a signed-in user submits a valid name, unit, reference amount, calories, and three optional nutrient values
- **THEN** a new food owned by that user is saved and can be viewed in their personal foods

#### Scenario: Create with unknown nutrients
- **WHEN** a signed-in user leaves one or more optional nutrient values blank
- **THEN** the food is saved with those values unknown and they are displayed as unavailable rather than zero

#### Scenario: Measured zero is known
- **WHEN** a user enters zero for calories or an optional nutrient
- **THEN** the value is saved and displayed as a measured zero

### Requirement: Personal food input is validated
The application SHALL reject invalid personal food values before saving and give the user actionable feedback without changing an existing valid food.

#### Scenario: Missing required value
- **WHEN** the name is blank, the unit is absent, or calories are blank
- **THEN** the food is not saved and the invalid field is identified

#### Scenario: Invalid amount or nutrient
- **WHEN** the reference amount is not positive, the unit is not g or ml, or a nutrition value is negative or not a finite number
- **THEN** the food is not saved and the invalid field is identified

### Requirement: A user can browse their own personal foods
The application SHALL show a signed-in user their active personal foods by default in the Food area with each food's name, unit, reference amount, and available nutrition values, without displaying internal food IDs on cards.

#### Scenario: View personal foods
- **WHEN** a signed-in user opens the Food area after creating foods
- **THEN** their foods are available to view and each can be opened for editing

#### Scenario: No personal foods yet
- **WHEN** a signed-in user has no personal foods
- **THEN** the Food area presents an empty state and a way to create one

#### Scenario: Archived food is absent from active list
- **WHEN** a user has archived one of their personal foods
- **THEN** that food is no longer shown in their active personal-food list

### Requirement: A signed-in user can switch between personal and global food views
The Food area SHALL show personal foods first to signed-in users and SHALL provide an accessible "See global foods" action to open the global catalog, with a way to return to personal foods.

#### Scenario: Signed-in default view
- **WHEN** a signed-in user opens the Food area without choosing a view
- **THEN** their personal foods are shown and the global-food list is not shown

#### Scenario: Open and leave global view
- **WHEN** a signed-in user activates "See global foods"
- **THEN** the global catalog is shown with a way to return to their personal foods

#### Scenario: Anonymous visitor opens Food
- **WHEN** an anonymous visitor opens the Food area
- **THEN** public global-food search remains available without exposing personal foods

### Requirement: A user can edit a personal food without changing its unit or identity
The application SHALL let the owner edit a personal food's name, reference amount, calories, and optional nutrients while keeping its stable ID and chosen g or ml unit unchanged.

#### Scenario: Edit values
- **WHEN** the owner saves valid changes to an existing personal food
- **THEN** the same food reflects the new values and retains its ID, owner, and unit

#### Scenario: Clear an optional nutrient
- **WHEN** the owner clears an optional nutrient and saves
- **THEN** the value becomes unknown rather than zero

#### Scenario: Unit change is attempted
- **WHEN** an edit request supplies a different unit for an existing food
- **THEN** the change is rejected and the stored unit is unchanged

### Requirement: An owner can archive a personal food
The application SHALL offer a confirmed archive action for an active personal food. Archiving SHALL remove it from active personal views while retaining its stored record, owner, unit, nutrition, and stable ID.

#### Scenario: Owner confirms archive
- **WHEN** the owner confirms archiving an active personal food
- **THEN** the food disappears from their active list and its stored record and ID remain intact

#### Scenario: Owner cancels archive
- **WHEN** the owner cancels the archive confirmation
- **THEN** the food remains active and unchanged

#### Scenario: Archived food is requested directly
- **WHEN** an archived food's edit page or mutation is requested
- **THEN** it is unavailable through the active personal-food flow

### Requirement: Personal foods are isolated by account
The application SHALL verify the current account on every personal-food read and mutation and SHALL restrict each operation to foods owned by that account.

#### Scenario: Anonymous access
- **WHEN** an anonymous visitor requests a personal-food page, record, or mutation directly
- **THEN** no personal-food data is returned or changed

#### Scenario: Another account's food
- **WHEN** a signed-in user requests or attempts to edit a food owned by a different account
- **THEN** the other account's food is neither disclosed nor changed

#### Scenario: Another account attempts archive
- **WHEN** a signed-in user attempts to archive a food owned by another account
- **THEN** the food is neither disclosed nor changed

#### Scenario: Session ends
- **WHEN** a user signs out and repeats a personal-food request
- **THEN** the request receives no personal-food data or mutation access

### Requirement: Personal foods remain separate from global foods
The application SHALL keep personal foods distinct from shared global foods and SHALL NOT let an ordinary user change a global record through a personal-food flow.

#### Scenario: Same name in both catalogs
- **WHEN** a personal food and a global food have the same name
- **THEN** they remain separate entries with distinct stable IDs and ownership

#### Scenario: Global ID is submitted for edit
- **WHEN** a user submits a global-food ID to a personal-food edit action
- **THEN** no global-food record is changed
