# Spec Delta

## ADDED Requirements

### Requirement: Primary areas appear as text links
The application SHALL present Food, Meals, and Meal Plan as plain text links without button, pill, or segmented-control styling. The current area's link SHALL use bold text while the other area links use normal text weight. Keyboard focus SHALL remain visible.

#### Scenario: Current area is shown through text weight
- **WHEN** a visitor opens any primary area
- **THEN** its navigation link is bold, the other area links have normal weight, and the links do not appear as a button or radio group

#### Scenario: Keyboard navigation remains visible
- **WHEN** a visitor focuses a primary area link with a keyboard
- **THEN** the link has a visible focus state and can still be activated

#### Scenario: Text links remain usable on a narrow screen
- **WHEN** a visitor views the primary navigation at a narrow width
- **THEN** all three text links remain legible and reachable without horizontal overflow
