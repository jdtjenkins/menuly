# Spec Delta

## Purpose

Let signed-in users turn a shared global food into an editable personal entry while keeping the two food records and their identities independent.

## ADDED Requirements

### Requirement: A signed-in user can prepare a personal copy from a global food

The application SHALL offer a "Copy to My foods" action on signed-in global-food results that opens a personal-food creation draft prefilled with the selected global food's name, unit, reference amount, and available nutrition values.

#### Scenario: Open a complete global food
- **WHEN** a signed-in user chooses "Copy to My foods" for a global food with complete nutrition
- **THEN** the creation draft contains that food's reference values and no personal food has been saved yet

#### Scenario: Open a global food with unknown optional nutrition
- **WHEN** a selected global food has an unknown protein, carbohydrate, or fat value
- **THEN** the corresponding draft field is blank rather than zero

#### Scenario: Open a global food without calories
- **WHEN** a selected global food has no calorie value
- **THEN** the draft opens with calories blank and identifies calories as required before saving

### Requirement: Saving a copy creates an independent personal food

The application SHALL save a reviewed cloning draft through personal-food validation as a new food owned by the current user, with a stable ID distinct from the source global food, and SHALL leave the global food unchanged.

#### Scenario: Save unchanged copied values
- **WHEN** the owner submits a valid draft without changing its prefilled values
- **THEN** the new personal food has the source's name, unit, reference amount, and known and unknown nutrition values, with its own ID and owner

#### Scenario: Review and change copied values
- **WHEN** the owner changes valid draft values before saving
- **THEN** the new personal food stores the reviewed values and the global source remains unchanged

#### Scenario: Required or invalid value remains
- **WHEN** the draft has blank calories or another value invalid for personal foods
- **THEN** no copy is saved and the form identifies the field for correction while preserving entered values

#### Scenario: Copy the same source again
- **WHEN** the same user saves another valid draft from the same global food
- **THEN** it creates another independent personal food with a different ID

#### Scenario: Edit a copied personal food
- **WHEN** the owner later edits a copied food
- **THEN** only that personal food changes, and the source global food and any other copies stay unchanged

### Requirement: Cloning respects account and catalog boundaries

The application SHALL require a current signed-in account for every clone draft and save, SHALL accept only an existing global food as the source, and SHALL not expose a cloning action or full nutrition to anonymous visitors.

#### Scenario: Anonymous visitor searches global foods
- **WHEN** an anonymous visitor uses public food search
- **THEN** no cloning action or full reference nutrition is exposed

#### Scenario: Anonymous or ended session requests a draft or save
- **WHEN** a request for a cloning draft or personal-food save has no current account
- **THEN** no private copy is created or full source details returned

#### Scenario: Invalid source ID
- **WHEN** a signed-in user requests a clone draft for an ID that does not identify a global food
- **THEN** no draft with source values is shown and no global or personal food is changed

#### Scenario: Global food remains read-only
- **WHEN** a user saves, edits, or archives a personal copy
- **THEN** the source global food remains unchanged
