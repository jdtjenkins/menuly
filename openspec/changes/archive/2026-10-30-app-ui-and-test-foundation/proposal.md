# Proposal

## Why

Menuly is still the generated Next.js starter. Before food, meal, and planning features can be delivered independently, users need a coherent application shell and the project needs reliable unit and browser test entry points.

## What Changes

- Replace the starter landing screen with a friendly, usable shell for the **Food**, **Meals**, and **Meal Plan** areas.
- Make the three areas reachable through clear, accessible navigation that works at narrow and wide viewport sizes.
- Establish Tailwind CSS and daisyUI as the styling foundation.
- Set up Vitest and Playwright with meaningful smoke checks for the shell and navigation.
- Keep feature content as honest empty states until later roadmap changes add foods, meals, and plans. This change does not add authentication, data storage, or nutrition behavior.

## Capabilities

### New Capabilities

- `primary-navigation`: Users can identify and move among the Food, Meals, and Meal Plan areas of the application.

### Modified Capabilities

None. The project has no existing OpenSpec capability specs.

## Impact

- Replaces the current starter content in the Next.js App Router UI and updates application metadata and styling.
- Adds daisyUI and unit/browser test dependencies, configuration, scripts, and smoke tests.
- Introduces no new API, database, or external service dependency.
