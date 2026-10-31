# Tasks

## 1. Google identity and application sessions

- [x] 1.1 Add a numbered migration for `app_users` and unique `(provider, subject)` `provider_identities`, plus a transactional find-or-create account reader using the exact Google subject; test first, repeat, concurrent, and changed-profile sign-ins against disposable libSQL databases, and verify no email, name, picture, or provider-token columns are persisted with `pnpm test:unit`.
- [x] 1.2 Add the compatible Auth.js/NextAuth.js Google provider and callback route with explicit minimal JWT and session callbacks; test verified-subject mapping, failed/cancelled sign-in, token/session field limits, and same-origin return paths, then verify `pnpm test:unit` passes.
- [x] 1.3 Add a server-only current-account boundary that validates the session and checks account existence before protected reads, plus sign-out that clears the browser session; test missing, tampered, expired, and orphaned sessions and post-sign-out access, then verify `pnpm test:unit` passes.
- [x] 1.4 Add safe `.env.example` entries and README setup for `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`, and the Google callback URL; verify secrets remain untracked and browser bundles do not contain configured credentials.

## 2. Signed-in global catalog

- [x] 2.1 Add a separate server-only full-catalog reader guarded by the current-account boundary, with literal case-insensitive name search, blank-term browsing, deterministic 20-row pages, bounded page input, and `NULL` nutrition preservation; test authorized and unauthorized direct calls, page edges, and field projections with `pnpm test:unit`.
- [x] 2.2 Add sign-in and sign-out controls and update the Food page so anonymous users retain calorie-only search and a working sign-in path, while signed-in users can browse/search complete reference nutrition and navigate result pages; document the behavior in the README and verify keyboard and narrow-screen behavior with Playwright.
- [x] 2.3 Add deterministic browser coverage using a controlled local OIDC provider or isolated provider configuration for redirect/callback, returning session, sign-out, direct unauthorized access, and absence of profile fields, tokens, and full nutrition from anonymous output; verify `pnpm test:e2e` passes without production Google credentials.
- [x] 2.4 Move the anonymous "Sign in with Google" action from the Food card to the right side of the global navigation with a multicolor Google mark and accessible label; keep the Food prompt pointing to it, hide sign-in for active accounts, preserve sign-out, and verify keyboard and narrow-screen behavior in Playwright.
- [x] 2.5 Present the three primary area links as plain text with normal inactive weight, bold current-page weight, no pill or segmented-control background, and visible keyboard focus; add a distinct Google button hover state and vertically align it with the links on wide screens while keeping narrow layouts usable. Verify active/inactive styling, hover, focus, alignment, and overflow in Playwright, then run lint and build.
- [x] 2.6 Replace the Food-card sign-out button with an accessible sign-out action in the exact right-side navbar slot used by anonymous Google sign-in; show only the action matching the current session on Food, Meals, and Meal Plan, return to Food after sign-out, and update the README. Verify position, keyboard access, narrow layout, session-state changes, and anonymous access after sign-out with Playwright, then run lint and build.

## 3. Integration verification

- [x] 3.1 Run `pnpm lint`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e`, and `openspec validate google-sign-in-and-catalog-access --strict`; verify a fresh migrated database has only the intended identity columns, report whether a live Google OAuth smoke test could run, and document any unavailable prerequisite.

## Workflow follow-up

- After implementation review and explicit approval, sync the delta specs and archive this change.
