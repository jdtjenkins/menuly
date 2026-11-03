# Proposal

## Why

The current desktop shell limits both navigation and page content to a narrow column, while the weekly plan's enclosing panel makes its seven-day workspace feel cramped. A wider, responsive layout and a consistent visual style will make the app easier to scan and use across desktop and mobile.

## What Changes

- Widen the shared header and main content on desktop while keeping navigation, forms, and page content usable without page-level horizontal overflow on narrow screens.
- Replace the current daisyUI `cupcake` look with a calmer green-led palette and establish consistent primary, secondary, quiet, and destructive button treatments across existing flows. Keep the Google sign-in control recognisably Google branded.
- Give the weekly plan its own full-width board section: seven day columns in the existing semantic table, with cards and per-day autocomplete inside each column, horizontal scrolling within the board on narrow screens, and no enclosing card around the whole table.
- Preserve current navigation labels and plain text-link treatment, plan behaviors, ownership rules, and automatic card updates. Drag and drop remains a separate roadmap change.

## Capabilities

### New Capabilities

- `application-visual-system`: Responsive shared page and header layout, coherent palette, and consistent action styling across the app.

### Modified Capabilities

- `weekly-meal-plan`: Present the existing day-column table as a standalone, full-width board rather than inside an enclosing card.

## Impact

- Shared layout and theme in `app/layout.tsx` and `app/globals.css`; navigation and existing button styles across Food, Meals, Meal Plan, and authentication controls.
- Weekly plan presentation in `app/meal-plan/page.tsx` and related visual styling, without changing plan data or server actions.
- Responsive and interaction coverage in existing browser tests; no database, API, or dependency change is expected.
