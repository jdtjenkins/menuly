# Spec Delta

## Purpose

Give signed-in users access to the global catalog's complete reference nutrition while keeping those details unavailable to anonymous visitors.

## ADDED Requirements

### Requirement: Signed-in users can browse and search global foods
The application SHALL let a signed-in user browse the global catalog without a search term and search it by food name, with deterministic bounded pages of results.

#### Scenario: Browse without a term
- **WHEN** a signed-in user opens the Food area without a search term
- **THEN** the first page of global foods is shown with a way to reach later pages

#### Scenario: Search by name
- **WHEN** a signed-in user enters a food-name term
- **THEN** matching global foods are shown in a consistent order with bounded page size

#### Scenario: No matching food
- **WHEN** the signed-in search matches no global food
- **THEN** a clear no-results state is shown

### Requirement: Signed-in results include complete reference nutrition
The application SHALL show each signed-in catalog result's stable food ID, fixed unit, positive reference amount, calories, protein, carbohydrates, and fat for that reference amount.

#### Scenario: Complete food record
- **WHEN** a signed-in user views a global food with all four nutrition values
- **THEN** the values are presented with the food's reference amount and unit

#### Scenario: Missing nutrient value
- **WHEN** a global food lacks a nutrition value
- **THEN** that value is shown as unavailable rather than as a measured zero

### Requirement: Full catalog data requires server-verified access
The application SHALL check the current application session before returning full global-food details from any page or server endpoint.

#### Scenario: Anonymous direct request
- **WHEN** an anonymous visitor requests a signed-in catalog page or endpoint directly
- **THEN** full nutrition, reference details, and internal IDs are not returned

#### Scenario: Valid signed-in request
- **WHEN** a request has a valid session for an existing account
- **THEN** the signed-in catalog reader may return the full fields needed by that user

#### Scenario: Signed-out request
- **WHEN** a user signs out and repeats a full-catalog request
- **THEN** the request receives only anonymous access
