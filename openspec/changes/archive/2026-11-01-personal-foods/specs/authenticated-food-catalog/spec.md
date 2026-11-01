# Spec Delta

## MODIFIED Requirements

### Requirement: Signed-in users can browse and search global foods
The application SHALL let a signed-in user open the global catalog from the Food area and browse or search it by food name, with deterministic bounded pages of results.

#### Scenario: Browse without a term
- **WHEN** a signed-in user chooses "See global foods" without a search term
- **THEN** the first page of global foods is shown with a way to reach later pages

#### Scenario: Search by name
- **WHEN** a signed-in user enters a food-name term in the global-food view
- **THEN** matching global foods are shown in a consistent order with bounded page size

#### Scenario: No matching food
- **WHEN** the signed-in search matches no global food
- **THEN** a clear no-results state is shown

### Requirement: Signed-in results include complete reference nutrition
The application SHALL show each signed-in global-food result's fixed unit, positive reference amount, calories, protein, carbohydrates, and fat for that reference amount, while keeping its stable ID out of the visible food card.

#### Scenario: Complete food record
- **WHEN** a signed-in user views a global food with all four nutrition values
- **THEN** the values are presented with the food's reference amount and unit

#### Scenario: Missing nutrient value
- **WHEN** a global food lacks a nutrition value
- **THEN** that value is shown as unavailable rather than as a measured zero

#### Scenario: Food card omits internal ID
- **WHEN** a signed-in user views a global-food card
- **THEN** the card shows the food information without displaying its internal ID
