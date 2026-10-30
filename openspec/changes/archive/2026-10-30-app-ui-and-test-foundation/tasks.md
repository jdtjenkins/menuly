# Tasks

## 1. Styling and test tooling

- [x] 1.1 Add daisyUI and the supported Tailwind CSS 4 PostCSS pipeline, resolve the starter's custom Turbopack CSS rule, and verify the stylesheet compiles in both `pnpm dev` and `pnpm build`.
- [x] 1.2 Add Vitest, jsdom, React Testing Library, configuration, and a `test:unit` script; verify the runner loads with `pnpm test:unit --passWithNoTests`.
- [x] 1.3 Add Playwright configuration and a `test:e2e` script with a managed local server; verify `pnpm exec playwright --version` and the test configuration load.
- [x] 1.4 Document the unit and browser test commands, including browser installation, in the project README; verify each documented command matches the package scripts and Playwright configuration.

## 2. Application shell and navigation

- [x] 2.1 Replace starter metadata and content with the shared Menuly shell and `/food`, `/meals`, and `/meal-plan` pages, and make `/` enter the Food area; verify each destination opens directly with its heading and an honest empty state.
- [x] 2.2 Add the responsive primary navigation with semantic links, visible keyboard focus, and current-area indication; add Vitest component checks for all three labels, active semantics, and empty-state content, then verify `pnpm test:unit` passes.
- [x] 2.3 Add Playwright journeys for entry navigation, moving among all three areas, keyboard access, and a narrow viewport; verify `pnpm test:e2e` passes against the built app and the links remain visible and usable.

## 3. Integration validation

- [x] 3.1 Run `pnpm lint`, `pnpm test:unit`, `pnpm build`, and `pnpm test:e2e`, then verify the styled shell also renders during `pnpm dev` without CSS or navigation regressions.
