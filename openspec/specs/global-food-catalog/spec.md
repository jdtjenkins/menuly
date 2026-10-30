# global-food-catalog Specification

## Purpose

Provide shared, stable food records that visitors can search and later signed-in features can reference without changing catalog entries owned by the application.

## Requirements

### Requirement: Global foods have stable identities and nutrition references
The system SHALL persist each global food with a stable ID, name, one fixed g or ml unit, a positive reference amount, and calorie, protein, carbohydrate, and fat values for that amount.

#### Scenario: Read a stored global food
- **WHEN** a global food is read from the catalog
- **THEN** its ID, name, unit, reference amount, and available nutrition values describe the same persistent entry

#### Scenario: A nutrient is unavailable
- **WHEN** a global food has an unknown nutrient value
- **THEN** the stored value remains distinguishable from a measured zero

### Requirement: Ordinary visitors cannot change global foods
The system SHALL prevent ordinary visitors from creating, editing, or deleting global-food records.

#### Scenario: Anonymous visitor attempts a change
- **WHEN** an anonymous visitor requests a global-food mutation
- **THEN** no global-food record is changed

### Requirement: Local development catalog has 30 repeatable seed entries
The system SHALL provide a development-only migration that inserts 30 common global foods with stable IDs and valid reference nutrition after the global-food schema is available.

#### Scenario: Seed a fresh local development database
- **WHEN** the development seed migration runs against a migrated local database
- **THEN** exactly 30 named seed entries with distinct stable IDs are available for search

#### Scenario: Repeat the development seed migration
- **WHEN** the same development seed migration runs again
- **THEN** existing seed entries retain their IDs and values without duplication

#### Scenario: Target is remote or non-development
- **WHEN** the development seed is requested for a remote or non-development database
- **THEN** the seed is refused before any catalog entry is written
