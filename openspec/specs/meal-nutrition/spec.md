# meal-nutrition Specification

## Purpose

Give meal owners trustworthy nutrition totals for a whole recipe and any positive serving quantity, including clear treatment of nutrients that have not been measured.

## Requirements

### Requirement: Whole-recipe nutrition uses current ingredient references
For calories, protein, carbohydrates, and fat, the application SHALL sum each known ingredient contribution as ingredient amount divided by that food's reference amount, multiplied by the food's current nutrient value.

#### Scenario: Multiple ingredients
- **WHEN** an owner views a meal containing foods with known nutrition and positive amounts
- **THEN** each whole-recipe nutrient equals the sum of its scaled ingredient contributions

#### Scenario: Food nutrition changes
- **WHEN** an owner edits a personal food already referenced by a meal
- **THEN** the next meal view uses that food's current reference amount and nutrition values without requiring a meal edit

#### Scenario: Referenced food is archived
- **WHEN** an owner archives a personal food already referenced by a meal
- **THEN** the meal continues to calculate from that food's stored current values

### Requirement: Selected servings scale recipe nutrition
The meal detail SHALL show one Selected servings nutrition panel. Its input SHALL start at the meal's serving yield, permit positive finite fractions, and scale each whole-recipe nutrient by selected servings divided by yield. A labeled reset icon button SHALL appear when the input differs from yield and restore that default when activated.

#### Scenario: Default shows the full recipe
- **WHEN** the owner opens a meal that yields four servings
- **THEN** Selected servings starts at four and the single nutrition panel shows full-recipe values

#### Scenario: Fractional serving selection
- **WHEN** a meal yields four servings and the owner selects 1.5 servings
- **THEN** the selected-serving nutrition is 1.5/4 of each whole-recipe value

#### Scenario: Invalid serving selection
- **WHEN** the selected serving quantity is zero, negative, or not finite
- **THEN** no nutrition is presented as valid for that selection and the input is identified

#### Scenario: Reset a changed selection
- **WHEN** the owner changes the selected serving quantity away from the recipe yield
- **THEN** a keyboard-accessible reset icon button appears with a clear accessible label, and activating it restores the yield and hides the button

### Requirement: Unknown nutrients remain visibly incomplete
The application SHALL distinguish an unknown nutrient from a measured zero. If any ingredient lacks a nutrient value, the selected-serving panel SHALL show the sum of known contributions as incomplete and identify the affected nutrient and food at the selected scale.

#### Scenario: One ingredient lacks protein
- **WHEN** one referenced food has unknown protein and other ingredients have known protein
- **THEN** protein is labeled an incomplete known subtotal with that food identified, while other fully known nutrients remain complete

#### Scenario: Measured zero
- **WHEN** an ingredient has a measured zero for a nutrient
- **THEN** that zero is included as known and does not make the result incomplete

#### Scenario: All contributions unknown
- **WHEN** every ingredient lacks a value for one nutrient
- **THEN** that nutrient is shown as unavailable or an incomplete zero-known subtotal, never as a complete measured zero
