# Spec Delta

## Purpose

Give Menuly's primary areas a consistent, light page hierarchy and content density while respecting the different space needs of forms and data workspaces.

## ADDED Requirements

### Requirement: Primary pages share a visual hierarchy
The Food, Meals, and Meal Plan areas SHALL use a consistent light presentation for page headings, supporting text, content surfaces, and actions, with restrained accent color and clear boundaries between content regions.

#### Scenario: Move between primary areas
- **WHEN** a visitor moves between Food, Meals, and Meal Plan
- **THEN** headings, supporting text, content regions, and action emphasis follow the same visual hierarchy

### Requirement: Page density balances scanning and readability
Primary pages SHALL use moderate spacing and control sizing so lists, cards, and the weekly plan are easy to scan without crowding controls or wasting the available desktop width.

#### Scenario: Desktop content
- **WHEN** a visitor views Food, Meals, or Meal Plan on a wide desktop screen
- **THEN** the page uses the available content width for lists and workspaces while keeping controls and content legible

#### Scenario: Form content
- **WHEN** a visitor creates or edits a food or meal on a wide desktop screen
- **THEN** the form remains grouped at a comfortable reading width within the wider page layout

#### Scenario: Narrow screen
- **WHEN** a visitor views a primary page on a narrow screen
- **THEN** headings, actions, cards, and forms remain usable without page-level horizontal scrolling
