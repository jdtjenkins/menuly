# Tasks

## 1. Responsive shared shell

- [x] 1.1 Widen and align the shared header and main container in `app/layout.tsx`, preserve readable local form widths, and verify Food, Meals, and Meal Plan use at least 1280px of aligned space at a 1440px viewport.
- [x] 1.2 Adapt header spacing and small-screen layout for brand, plain text navigation links, and authentication controls; extend `tests/e2e/navigation.spec.ts` to verify 360px viewport containment and keyboard reachability.

## 2. Palette and action styling

- [x] 2.1 Switch the daisyUI theme to the chosen light green palette and tune shared color or shape tokens only where visual review shows weak contrast; verify Food, Meals, and Meal Plan use consistent surfaces and legible action text.
- [x] 2.2 Apply primary, secondary, quiet, and destructive button treatments across existing Food, Meals, Meal Plan, and auth controls while preserving Google sign-in branding; update relevant interaction tests and verify hover, focus, and disabled states.

## 3. Weekly plan board

- [x] 3.1 Present the existing semantic seven-day table as a standalone full-width board section without an enclosing card, using distinct day columns and usable card/control widths; verify all days are scannable on wide desktop.
- [x] 3.2 Keep overflow inside the named board region on narrow screens and preserve day headers, cards, autocomplete, automatic servings save, day reassignment, and removal; extend `tests/e2e/weekly-meal-plan.spec.ts` to verify mobile scrolling and existing interactions.
- [x] 3.3 Record the completed visual refresh in `docs/implementation-roadmap.md` when implemented, and verify its status reflects the delivered UI.

## 4. Integration verification

- [x] 4.1 Run the project type check, lint, relevant browser tests, and production build; verify the approved layout and plan behavior have no regressions across mobile, tablet, and desktop widths.
