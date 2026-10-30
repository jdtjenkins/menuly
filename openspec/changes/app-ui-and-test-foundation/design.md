# Design

## Context

See [proposal.md](proposal.md) for motivation and [primary-navigation](specs/primary-navigation/spec.md) for user-visible behavior. The repository is a Next.js 16 App Router starter with React 19, Tailwind CSS 4, a single generated home page, and no test runner. Its current `next.config.ts` has a custom Turbopack CSS loader, while `app/globals.css` imports Tailwind directly. The product vision establishes Food, Meals, and Meal Plan as the three main areas, but their feature content belongs to later changes.

## Goals / Non-Goals

**Goals:**

- Give later changes stable places to add each area's content without reworking the top-level navigation.
- Keep the shell navigable without JavaScript-heavy routing or data dependencies.
- Provide reliable unit and browser test commands that can grow with later changes.

**Non-Goals:**

- Database access, authentication, or working food, meal, and plan controls.
- A reusable component library beyond the small shell and empty-state components needed here.
- Visual regression snapshots or a full cross-browser test matrix at this stage.

## Decisions

### Use three App Router destinations and a shared shell

Use `/food`, `/meals`, and `/meal-plan` as stable destinations, with `/` taking visitors to Food. Put the brand, primary navigation, and content frame in the shared root layout so they remain present across areas. Keep page-specific headings and honest empty states in the corresponding route pages. This is simpler for later features than one page switching panels with client state; it also gives each area a linkable URL.

The navigation can use a small client component to identify the active pathname and expose it through visible styling and `aria-current="page"`. Use semantic links and a `<nav>` landmark. Keep all three items visible at narrow widths rather than hiding them behind an unimplemented menu. A minimal client boundary is justified for current-area state; the pages themselves can remain server rendered.

### Use the supported Tailwind CSS 4 and daisyUI integration

Add daisyUI as the CSS plugin and use the standard Tailwind PostCSS integration documented by the installed Next.js guide and daisyUI. Replace the starter's custom Turbopack CSS rule if it would process the same stylesheet a second time. Preserve the existing font approach where it works, but replace starter colors and metadata with a consistent Menuly theme. Favor daisyUI component classes for common surfaces and Tailwind utilities for layout and responsive spacing. Avoid adding a JavaScript UI kit.

The alternative is to keep the custom Turbopack loader and adapt daisyUI to it. That would retain a project-specific CSS path without a demonstrated benefit, so the standard integration is the clearer foundation. Validate both development and production rendering during implementation because the stylesheet pipeline changes.

### Separate unit checks from browser journey checks

Configure Vitest with jsdom and React Testing Library for synchronous UI behavior, such as navigation labels, current-area semantics, and empty-state rendering. Configure Playwright with a managed local web server and tests that open the app, navigate among all three areas, and verify the shell at desktop and narrow viewport sizes. Prefer a production build for the Playwright smoke run, in line with the installed Next.js testing guide. Keep test scripts distinct so unit tests run quickly without a browser and end-to-end tests exercise the built app.

The alternative is to test every route only in Vitest. That would not verify actual navigation, responsive rendering, or the Next.js runtime; the installed Next.js guide also notes limitations for unit-testing async Server Components. Conversely, using only Playwright would make later calculation unit tests slower and less focused.

## Risks / Trade-offs

- [CSS pipeline change could render differently under dev and build] -> Run both rendering paths before marking the change complete, and adjust the configuration within this change if they disagree.
- [A narrow navigation bar could overflow or hide links] -> Keep all destinations visible, allow a compact responsive layout, and include a narrow-viewport browser check.
- [Empty states could imply unavailable features work already] -> Use explanatory copy and omit nonfunctional actions.
- [Browser binaries may be missing locally or in CI] -> Document the Playwright install requirement and keep unit tests runnable independently.

## Migration Plan

Replace the generated landing content and metadata with the Menuly shell and empty areas. No user data or database migration is involved. If the UI or CSS build fails, revert this isolated shell/test change; later roadmap changes do not depend on its implementation until it is validated.
