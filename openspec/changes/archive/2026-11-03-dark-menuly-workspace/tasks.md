# Tasks

## 1. Menuly dark theme

- [x] 1.1 Replace the built-in emerald theme with the custom `Menuly` daisyUI theme in `app/globals.css` and apply it at the root; verify a production build and computed dark theme colours and `color-scheme` on Food, Meals, and Meal Plan.
- [x] 1.2 Tune shared page, form, card, button, validation, and feedback styling for the planned typography, spacing, surface, and colour hierarchy; add browser coverage for representative hover, focus, disabled, error, and Google sign-in states, and verify the checks pass.

## 2. Left navigation shell

- [x] 2.1 Replace the desktop top navigation with the persistent labelled sidebar and account footer while keeping the main region wide; omit the redundant "Workspace" caption in desktop and mobile navigation; verify Food, Meals, and Meal Plan navigation and current-area indication at desktop widths.
- [x] 2.2 Keep the compact mobile header and left modal drawer with the same links and account action; update navigation and authentication browser tests for keyboard focus, dismissal, breakpoint changes, and mobile containment, and verify they pass.

## 3. Content canvas and responsive pages

- [x] 3.1 Add the subtle dotted grid only to the main content canvas, keep content surfaces opaque, and suppress decoration in forced-colours mode; verify readability and grid placement in rendered desktop and mobile pages.
- [x] 3.2 Adapt Food, Meals, forms, and the seven-day board to the sidebar's available width; keep meal forms narrow, make personal food Create, Copy, and Edit pages full width with responsive fields, place each day's accessible autocomplete above its cards without a visible label or separator, remove the day-heading divider, and preserve board-local scrolling; add browser checks at 360px, tablet, 1440px, and wide desktop, and verify no page-level overflow or lost plan controls.
- [x] 3.3 Update `docs/implementation-roadmap.md` for the delivered dark workspace and verify its status and acceptance criteria match the rendered UI.
- [x] 3.4 Make one weekly day column fill the available board width on mobile and add a visible horizontal-scroll hint; update the roadmap and browser checks at 360px and 375px to verify the hint, full-width day, reachable Sunday, no page-level overflow, and unchanged desktop board.
- [x] 3.5 Make mobile weekly day columns fill the remaining visible height below the heading and scroll hint, while allowing content to grow the board and page vertically; update the roadmap and browser checks for empty and populated days at 360px and 375px, horizontal scrolling, reachable controls, and unchanged desktop height.
- [x] 3.6 Make desktop weekly day columns fill the remaining visible height below the page heading while allowing meal cards to grow the board and page vertically; update the roadmap and browser checks for sparse and populated plans at desktop widths, equal column heights, reachable controls, and no nested vertical scrolling.

## 4. Integration checks

- [x] 4.1 Run type checking, lint, unit tests, relevant browser tests, a production build, and strict OpenSpec validation; verify navigation, authentication, Food, Meals, and Meal Plan behavior remains intact.

## Workflow follow-up

- Reconcile the completed but unarchived light visual changes with this successor before archiving them; archival requires separate approval.
