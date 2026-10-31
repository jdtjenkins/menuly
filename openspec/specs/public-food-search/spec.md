# public-food-search Specification

## Purpose

Let anonymous visitors find shared foods by name while exposing only the limited calorie information intended for public access.

## Requirements

### Requirement: Public search requires a term
The application SHALL search global-food names only when a visitor supplies a nonblank search term.

#### Scenario: No term provided
- **WHEN** a visitor opens the Food area without a search term
- **THEN** the page invites a search and returns no catalog entries

#### Scenario: Whitespace-only term
- **WHEN** a visitor submits only whitespace
- **THEN** the application returns no catalog entries

### Requirement: Public search is bounded and predictable
The application SHALL match global-food names without case sensitivity, return at most 20 entries, and order matching entries consistently.

#### Scenario: Matching name
- **WHEN** a visitor searches for a term contained in a global-food name with different letter case
- **THEN** the matching entry can appear in the results

#### Scenario: More than 20 matches
- **WHEN** a term matches more than 20 global foods
- **THEN** only the first 20 entries in the defined order are returned

#### Scenario: No matches
- **WHEN** a valid term matches no global foods
- **THEN** the page clearly reports that no foods were found

### Requirement: Anonymous results reveal only public fields
The application SHALL expose only food names and calories in anonymous catalog results and SHALL not expose full nutrition, measurement details, owner data, or database configuration through public output.

#### Scenario: Visitor searches the catalog
- **WHEN** an anonymous visitor receives search results
- **THEN** each result presents its food name and calorie value without protein, carbohydrate, fat, unit, reference amount, or internal ID

### Requirement: Full nutrition is presented as a future sign-in benefit
The Food area SHALL prompt anonymous visitors to sign in for full nutrition and direct them to the working Google sign-in action in the global navigation.

#### Scenario: Visitor views results
- **WHEN** an anonymous visitor sees food results
- **THEN** the page explains that full nutrition requires sign-in and points to the Google-branded action in the global navigation

#### Scenario: Visitor follows the prompt
- **WHEN** an anonymous visitor follows the Food page's prompt to the navigation sign-in action
- **THEN** the visitor can begin Google sign-in and return to the Food area afterward
