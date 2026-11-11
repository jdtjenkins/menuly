# Tasks

## 1. Responsive navigation

- [x] 1.1 Keep the existing desktop top links and account action, and add a labelled mobile menu toggle with a left-side panel containing all three links and the account action; verify Food, Meals, and Meal Plan navigation at 360px, tablet, and wide desktop widths.
- [x] 1.2 Implement modal panel behavior for backdrop, close control, Escape, route selection, focus entry and return, inactive background, and reduced motion; verify these behaviors with keyboard and pointer browser tests.
- [x] 1.3 Update navigation and authentication browser tests for anonymous and signed-in mobile states, current-link indication, Google branding, and desktop alignment; verify the targeted tests pass.

## 2. Light page presentation

- [x] 2.1 Tune shared light theme tokens and reusable page patterns for neutral surfaces, subtle borders, restrained green accents, moderate spacing, and consistent headings and actions; verify representative controls retain legible contrast and visible hover, focus, and disabled states.
- [x] 2.2 Apply the shared presentation to Food, Meals, and Meal Plan lists, cards, headings, and action groups while keeping local forms readable and the seven-day table as a standalone wide workspace; verify each area at 360px, tablet, and 1440px without page-level horizontal overflow.
- [x] 2.3 Extend representative browser coverage for page hierarchy, form width, and board containment, and update `docs/implementation-roadmap.md` to reflect the delivered presentation; verify the tests pass and the roadmap matches the UI.

## 3. Integration checks

- [x] 3.1 Run the project type check, lint, relevant browser tests, and production build; verify no navigation, authentication, or meal-plan behavior regresses.

## Workflow follow-up

- Reconcile this change with the completed `modern-responsive-app-layout` change when the project archives its visual-system specification.
