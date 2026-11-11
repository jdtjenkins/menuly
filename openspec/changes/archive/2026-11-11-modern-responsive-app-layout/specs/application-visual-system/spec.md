# Spec Delta

## Purpose

Give Menuly a cohesive, readable visual system that uses desktop space well and keeps navigation and actions usable on small screens.

## ADDED Requirements

### Requirement: Shared layout uses available desktop width
The application SHALL align its primary header and main content within a shared, wider desktop layout while allowing content-specific forms and reading surfaces to remain comfortably sized.

#### Scenario: Wide desktop viewport
- **WHEN** a visitor opens Food, Meals, or Meal Plan at a viewport at least 1440 pixels wide
- **THEN** the header and main content align and each can use at least 1280 pixels of horizontal space

#### Scenario: Narrow form in a wide shell
- **WHEN** a visitor opens a food or meal form on a wide desktop viewport
- **THEN** the shared shell is wide while form controls remain grouped at a readable width

### Requirement: Shared layout adapts to narrow screens
The application SHALL keep its navigation and ordinary page content within a narrow viewport, with page-specific wide data surfaces scrolling inside their own regions.

#### Scenario: Mobile navigation and page content
- **WHEN** a visitor opens Food, Meals, or Meal Plan at a 360-pixel viewport width
- **THEN** the brand, primary links, authentication control, headings, and ordinary page actions remain visible and reachable without page-level horizontal scrolling

#### Scenario: Wide data surface on mobile
- **WHEN** a page contains a table wider than the viewport
- **THEN** that table scrolls within its own region while the surrounding page stays within the viewport

### Requirement: Pages share a coherent palette
The application SHALL use a consistent, legible light palette with green as a primary accent across the header, page surfaces, form controls, and actions.

#### Scenario: Move between primary areas
- **WHEN** a visitor moves between Food, Meals, and Meal Plan
- **THEN** the same color roles and surface treatment identify primary actions and distinguish content from the page background

### Requirement: Actions have consistent visual hierarchy
The application SHALL distinguish primary, secondary, quiet, and destructive actions consistently and provide visible hover, keyboard focus, and disabled states where those states apply.

#### Scenario: Primary and secondary actions
- **WHEN** a visitor sees a form submission beside a cancel or alternative action
- **THEN** the submission reads as primary and the companion action reads as secondary

#### Scenario: Destructive action
- **WHEN** a visitor sees a destructive action beside ordinary actions
- **THEN** the destructive action is visibly distinct and its purpose remains clear from its text or accessible name

#### Scenario: Keyboard and pending states
- **WHEN** a visitor focuses an action with a keyboard or an action becomes disabled while pending
- **THEN** the focus indicator is visible or the disabled state is visually apparent, respectively

#### Scenario: Google authentication control
- **WHEN** a visitor sees the Google sign-in action
- **THEN** it remains recognisably Google branded and accessible within the shared header
