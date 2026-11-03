# Spec Delta

## Purpose

Give Menuly a consistent dark workspace whose content hierarchy, canvas texture, and responsive width support food management and weekly meal planning.

## ADDED Requirements

### Requirement: The application presents a dark Menuly theme
The application SHALL present a consistent dark theme across navigation, primary pages, forms, controls, and feedback states, with legible text and visible focus, hover, and disabled states. This change SHALL not introduce a light-mode switch.

#### Scenario: Move between areas
- **WHEN** a visitor moves between Food, Meals, Meal Plan, and their create or edit pages
- **THEN** the same dark surface and colour roles are used throughout

#### Scenario: Interact with controls
- **WHEN** a visitor focuses, hovers, or disables a control where that state applies
- **THEN** its state remains visually distinct and its text remains legible

### Requirement: Pages maintain a clear content hierarchy
Primary pages SHALL distinguish headings, supporting copy, interactive controls, content panels, and muted metadata through consistent typography, spacing, surface contrast, and separators.

#### Scenario: Scan a primary page
- **WHEN** a visitor opens Food, Meals, or Meal Plan
- **THEN** the page title and primary action are prominent, supporting information is quieter, and content regions are visually separated

### Requirement: The main content has a subtle dotted canvas
The main content area SHALL show a restrained dotted grid behind its content. The dots SHALL remain secondary to text and controls, and content surfaces SHALL preserve readability above the grid.

#### Scenario: View main content
- **WHEN** a visitor opens a primary page on desktop or mobile
- **THEN** the dotted grid is visible in exposed canvas space without obscuring headings, cards, forms, or the weekly board

### Requirement: Workspace content uses available width responsibly
On desktop, the main content SHALL use the width remaining beside the persistent sidebar. Meal forms SHALL remain comfortably narrow. Personal food Create, Copy, and Edit pages SHALL use the available content width with responsive field columns. Wide data surfaces SHALL scroll within their own regions when they cannot fit. On mobile, one weekly day column SHALL fill the visible board width and the board SHALL indicate that more days are reachable by scrolling.

#### Scenario: Wide desktop
- **WHEN** a visitor opens Food, Meals, or Meal Plan on a wide desktop viewport
- **THEN** the content area fills the available workspace beside the sidebar, meal forms remain at a readable width, and personal food editors use the full content width

#### Scenario: Narrow viewport
- **WHEN** a visitor uses a narrow viewport
- **THEN** ordinary content stays within the viewport and the weekly board scrolls within its own region

#### Scenario: One mobile day fills the board
- **WHEN** a signed-in visitor views the weekly board on a mobile viewport
- **THEN** one day column fills the board's available width, its heading, add control, and cards stay within that width, and a visible hint indicates that more days can be reached by scrolling horizontally
- **AND** the visitor can reach Sunday within the board without page-level horizontal overflow

#### Scenario: Add a meal from a day column
- **WHEN** a signed-in visitor views the weekly board
- **THEN** each day's autocomplete appears above its meal cards, has an accessible day-specific name, and has no visible "Add meal to" label or separator above it
- **AND** the day heading has no divider beneath it

### Requirement: Mobile weekly day columns fill the remaining height
On mobile, each weekly day column SHALL have a shared minimum height that fills the visible viewport space below the page heading and scroll hint. The board SHALL grow vertically when meal cards need more space, without a nested vertical scroll region.

#### Scenario: Empty day fills the viewport remainder
- **WHEN** a signed-in visitor views or scrolls to a day with few or no meal cards on mobile
- **THEN** that day extends to the bottom of the remaining viewport space below the page heading and scroll hint

#### Scenario: Populated day grows for its cards
- **WHEN** a mobile day contains more meal cards than fit in the minimum height
- **THEN** the board and page grow vertically, and every card and control remains reachable by normal page scrolling

### Requirement: Desktop weekly day columns fill the remaining height
On desktop, all seven weekly day columns SHALL share a minimum height that fills the visible viewport space below the page heading. The board SHALL grow vertically when meal cards need more room, without a nested vertical scroll region.

#### Scenario: Sparse desktop plan fills the viewport remainder
- **WHEN** a signed-in visitor views a weekly plan with few or no meal cards on desktop
- **THEN** all seven day columns extend to the bottom of the remaining viewport space below the page heading

#### Scenario: Populated desktop plan grows for its cards
- **WHEN** a desktop day contains more meal cards than fit in the minimum height
- **THEN** the board and page grow vertically, and every card and control remains reachable by normal page scrolling
