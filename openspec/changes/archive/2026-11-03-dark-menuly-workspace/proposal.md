# Proposal

## Why

Menuly's current light theme and top navigation do not match the focused workspace feel shown in the supplied Linear and Railway references. A dark Menuly visual system and a persistent left navigation will give the app a clearer hierarchy while preserving its wide meal-planning workspace.

## What Changes

- Replace the current light presentation with one dark-only Menuly theme, authored in custom CSS while continuing to use daisyUI components.
- Apply a consistent hierarchy of typography, spacing, muted text, borders, surfaces, and restrained accent colours across Food, Meals, Meal Plan, and their forms.
- Add a subtle dotted grid to the main content canvas, behind readable opaque content surfaces.
- Replace the desktop top navigation with a persistent, labelled left sidebar for Food, Meals, and Meal Plan, without a redundant "Workspace" caption. Keep the account action in that sidebar. On mobile, retain a compact header and the existing left slide-out navigation pattern with the same destinations and account action.
- Let the desktop content use the space remaining beside the sidebar; keep meal forms comfortably narrow, make personal food Create, Copy, and Edit pages full width, and preserve local horizontal scrolling for the weekly board.
- Put each weekly day's meal autocomplete at the top of its column, without a visible "Add meal to" label, separator above it, or divider under the day heading. Retain an accessible day-specific name for the input.
- On mobile, let one day column fill the weekly board's visible width and the remaining visible height below the page heading and scroll hint. Let columns grow taller for their meal cards, and show a brief "Scroll to see more days →" hint so the horizontal navigation is apparent.
- On desktop, let all seven weekly day columns fill the remaining visible height below the page heading. Let the board grow taller when meal cards need more room.

## Capabilities

### New Capabilities

- `workspace-presentation`: Dark Menuly appearance, visual hierarchy, dotted content canvas, and responsive use of available content width.

### Modified Capabilities

- `primary-navigation`: Replace desktop top links with a persistent labelled left sidebar while retaining the mobile slide-out panel and current-area indication.
- `user-authentication`: Present the existing Google sign-in or sign-out action in the desktop sidebar and mobile panel.

## Impact

- Shared shell, navigation, authentication presentation, and theme CSS in `app/layout.tsx`, `app/primary-navigation.tsx`, `app/navigation-auth.tsx`, and `app/globals.css`; page-level styles across Food, Meals, Meal Plan, and forms.
- Browser coverage for responsive navigation, keyboard access, contrast, theme identity, canvas containment, forms, and the weekly board. No new data, API, or dependency is expected.
- This proposal supersedes the light palette and desktop top-navigation direction in the completed but unarchived `modern-responsive-app-layout` and `light-railway-inspired-navigation` changes. Their specification history must be reconciled before archival so it does not reintroduce conflicting requirements.
