# Spec Delta

## ADDED Requirements

### Requirement: Desktop navigation occupies a left sidebar
On wide screens, the application SHALL show persistent, labelled links to Food, Meals, and Meal Plan in a left sidebar beside the main content.

#### Scenario: Navigate on desktop
- **WHEN** a visitor opens any primary area on a wide screen
- **THEN** the left sidebar remains visible and the visitor can reach the other primary areas without opening a menu

#### Scenario: Navigation starts with destinations
- **WHEN** a visitor views the desktop sidebar or opens the mobile panel
- **THEN** the Food, Meals, and Meal Plan links appear without a redundant "Workspace" caption above them

## MODIFIED Requirements

### Requirement: Navigation works across input methods and viewport sizes
The application SHALL keep the three primary areas reachable through keyboard interaction at narrow and wide viewport sizes. On narrow screens, an accessible toggle SHALL open a left-side navigation panel. The panel SHALL close through its close control, Escape, backdrop activation, or selection of a destination.

#### Scenario: Keyboard navigation
- **WHEN** a visitor navigates with a keyboard on a wide screen
- **THEN** each primary item in the sidebar can receive visible focus and be activated

#### Scenario: Narrow viewport
- **WHEN** a visitor uses a narrow viewport
- **THEN** a visible navigation toggle opens a left-side panel where all three primary areas are reachable without content obscuring them

#### Scenario: Keyboard use of mobile panel
- **WHEN** a keyboard user opens the mobile panel
- **THEN** focus moves into the panel, its links and close control have visible focus, and closing it returns focus to the toggle

#### Scenario: Close mobile panel
- **WHEN** a visitor activates the close control or backdrop, presses Escape, or selects a primary destination
- **THEN** the mobile panel closes and the page remains usable

### Requirement: Primary areas appear as text links
The application SHALL present Food, Meals, and Meal Plan as labelled text links in the desktop sidebar and mobile panel. The current area SHALL be identifiable through text weight and a restrained selected-row treatment; keyboard focus SHALL remain visible.

#### Scenario: Current area is shown through text weight
- **WHEN** a visitor opens any primary area on a wide screen or opens the mobile panel
- **THEN** its navigation link is bold and visibly selected while the other area links have normal text weight

#### Scenario: Keyboard navigation remains visible
- **WHEN** a visitor focuses a primary area link with a keyboard
- **THEN** the link has a visible focus state and can still be activated

#### Scenario: Text links remain usable on a narrow screen
- **WHEN** a visitor opens the mobile panel at a narrow width
- **THEN** all three text links remain legible and reachable without horizontal overflow
