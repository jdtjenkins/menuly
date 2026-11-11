# Spec Delta

## MODIFIED Requirements

### Requirement: Navigation works across input methods and viewport sizes
The application SHALL keep the three primary areas reachable through keyboard interaction at narrow and wide viewport sizes. On narrow screens, an accessible navigation toggle SHALL open a left-side panel containing the primary areas. The panel SHALL close through its close control, Escape, backdrop activation, or selection of a destination.

#### Scenario: Keyboard navigation
- **WHEN** a visitor navigates with a keyboard on a wide screen
- **THEN** each primary item can receive visible focus and be activated

#### Scenario: Narrow viewport
- **WHEN** a visitor uses a narrow viewport
- **THEN** a visible navigation toggle opens a panel where all three primary areas are reachable without content obscuring them

#### Scenario: Keyboard use of mobile panel
- **WHEN** a keyboard user opens the mobile panel
- **THEN** focus moves into the panel, its links and close control have visible focus, and closing it returns focus to the toggle

#### Scenario: Close mobile panel
- **WHEN** a visitor activates the close control or backdrop, presses Escape, or selects a primary destination
- **THEN** the mobile panel closes and the page remains usable

### Requirement: Primary areas appear as text links
The application SHALL present Food, Meals, and Meal Plan as plain text links without button, pill, or segmented-control styling in the desktop navigation and mobile panel. The current area's link SHALL use bold text while the other area links use normal text weight. Keyboard focus SHALL remain visible.

#### Scenario: Current area is shown through text weight
- **WHEN** a visitor opens any primary area on a wide screen or opens the mobile panel
- **THEN** its navigation link is bold, the other area links have normal weight, and the links do not appear as a button or radio group

#### Scenario: Keyboard navigation remains visible
- **WHEN** a visitor focuses a primary area link with a keyboard
- **THEN** the link has a visible focus state and can still be activated

#### Scenario: Text links remain usable on a narrow screen
- **WHEN** a visitor opens the mobile panel at a narrow width
- **THEN** all three text links remain legible and reachable without horizontal overflow
