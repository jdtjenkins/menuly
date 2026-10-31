# Design

## Context

See `proposal.md` for motivation and the three delta specs for behavior. Menuly currently has no authentication code or account tables. The Food page streams a server-side, 20-result anonymous search from `global_foods`, selecting only `name` and `calories`. The app uses Next.js 16 Cache Components and the existing numbered libSQL migration runner. Production Google credentials and a public production catalog are not present in the repository.

## Goals / Non-Goals

**Goals:**

- Establish a durable internal account ID for later owner-scoped data without saving Google profile fields or provider tokens.
- Keep public and signed-in catalog projections separate at the server query boundary.
- Make session checks usable from future server-side data access code, including after an account is removed.

**Non-Goals:**

- A second identity provider, email-based account linking, editable foods, account deletion UI, or a production catalog import.
- Storing Google tokens for later Google API access; Menuly does not need those APIs.

## Decisions

### Auth.js handles Google OpenID Connect; Menuly owns its account mapping

Use the current NextAuth.js/Auth.js Google provider with its OAuth callback route and built-in OIDC checks. Configure `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and a stable `AUTH_SECRET` through untracked or deployment environment settings; document the Google callback URL and keep secrets out of browser code. Reject incomplete configuration when sign-in is attempted. A custom OIDC implementation was rejected because it would add security-sensitive protocol work without a product need.

Do not install a general Auth.js database adapter: its standard user/account model can persist profile and provider-token fields that the product explicitly forbids. Add numbered migrations for `app_users` (opaque internal ID) and `provider_identities` (provider, exact subject, user ID) with a unique provider/subject pair and a foreign key. Provision or find the account transactionally after Auth.js verifies Google sign-in. Ignore email, name, picture, and provider access/refresh tokens rather than saving them. The same subject always resolves to the same user ID; an email match never links two subjects. A separate identity table keeps the schema ready for a later provider without enabling that provider now. Google's `sub` is the identity key, not email.

### Minimal encrypted application session and account check at the data boundary

Use Auth.js's JWT session strategy without an adapter, with a seven-day maximum age and a stable deployment secret. On initial sign-in, map the verified Google subject to an internal ID; explicitly replace default profile-bearing JWT fields with that ID only. Expose only the minimal account identifier through the session callback. Let Auth.js set and clear its protected, HTTP-only session cookie; sign-out clears the current browser session. Do not log callback payloads or provider tokens.

Create a server-only `getCurrentAccount`/`requireAccount` boundary that validates the session and checks the internal account still exists in libSQL before returning protected data. This prevents a surviving cookie from authorizing a deleted account later. An encrypted cookie alone is insufficient for that check. Use request-scoped memoization only; do not cache user-specific access or full nutrition across requests. Next.js's Cache Components require the session-reading UI inside a Suspense boundary, as the current Food search already is.

### Separate signed-in catalog query and presentation

Keep the existing anonymous query and its 20-result, name/calorie-only projection. Add a separate server-only full-catalog reader that calls the account boundary before selecting `id`, `name`, `unit`, `reference_amount`, `calories`, `protein`, `carbohydrates`, and `fat`. Use the same trimmed, escaped, parameterized, case-insensitive name matching as public search. An empty signed-in term browses in deterministic pages of 20; search results use the same pagination. Bound and validate page input, and show next/previous controls only where data exists. Render `NULL` nutrients as unavailable rather than zero. A full-row query followed by client-side filtering was rejected because it could leak restricted fields into an anonymous response or server-component payload.

Place a Google-branded sign-in button on the right side of the global navigation, after the area links. Use a recognizable multicolor Google "G" mark with the visible label "Sign in with Google". Give the button a distinct hover appearance and keep its keyboard focus visible. On wide screens, center it vertically with the area links; at narrow widths, allow the navigation to reflow without clipping or horizontal overflow. Present Food, Meals, and Meal Plan as text links without an enclosing pill or segmented-control background. Use normal weight for inactive links and bold weight for the current link, retaining `aria-current="page"` and visible keyboard focus. Keep the Food prompt as explanatory text that points visitors to this navigation action, rather than a second sign-in button inside the Food card. Render session-dependent navigation controls behind a Suspense boundary. Hide sign-in when an account is active and keep sign-out available in signed-in UI. Keep redirects on same-origin application paths and return to Food after successful sign-in. Any direct full-catalog page or future route handler must use the same account boundary. Anonymous search remains available after sign-out.

Use one right-aligned navigation slot for the session action. Render the Google sign-in button there for anonymous visitors and an accessible "Sign out" button in exactly the same slot for signed-in visitors, including on Meals and Meal Plan. Remove the sign-out button from the Food card. Signing out clears the browser session and returns to Food; the navbar then shows sign-in again. Browser coverage should verify both states, the shared position, keyboard use, and narrow-screen layout across primary areas.

### Verification without production Google secrets

Test identity mapping, concurrent repeat sign-in, minimal stored columns, session callback shape, invalid/orphaned sessions, full-field queries, pagination, and public-field isolation against disposable libSQL databases. Exercise the browser's anonymous and signed-in catalog paths with a controlled test identity/provider fixture; test navigation link weights, absence of button-group styling, Google button hover, wide-screen alignment, keyboard focus, narrow-screen layout, and the button's absence after sign-in. Do not add a production bypass or test-only sign-in endpoint. Use a local OIDC test server or isolated provider configuration to verify the redirect/callback flow without real Google credentials. If a real Google OAuth test client is available, smoke-test its configured callback separately; report its absence rather than treating the deterministic tests as a live Google verification.

## Risks / Trade-offs

- [Provider credentials or profile fields leak] → Keep secrets server-side, use minimal JWT/session callbacks, avoid default adapter persistence, and inspect the database and browser output in tests.
- [JWT cookie remains usable after account deletion] → Check account existence on every protected data access; the later deletion change can revoke by removing the account.
- [A copied cookie survives browser sign-out until expiry] → Keep the cookie HTTP-only and secure in production, cap its lifetime, and clear it on sign-out. Immediate server-side revocation of copied JWTs would require a session ledger and is outside this slice.
- [Signed-in nutrition reaches an anonymous response] → Use distinct query types and require an account before the full projection; test direct route access as well as UI hiding.
- [Google setup is unavailable locally] → Keep deterministic provider and session tests independent of credentials, document the real callback setup, and report whether live OAuth verification was performed.

## Migration Plan

1. Add and apply the account/identity migration before deploying auth routes and signed-in catalog reads. The migration is additive and does not alter existing global-food rows.
2. Configure the Google OAuth client with the application's callback URL and provide `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` to the server. Keep these values out of source control and public environment variables.
3. Deploy sign-in, session checks, and signed-in catalog access together. Anonymous search continues to use the existing query and response shape.
4. Roll back the application version if needed, retaining the additive tables and applied migration record. Do not edit an applied migration file; use a later migration for schema changes.

## References

- [Auth.js Google provider](https://authjs.dev/getting-started/providers/google) and [Auth.js session callbacks](https://authjs.dev/reference/core).
- [Google OpenID Connect subject guidance](https://developers.google.com/identity/openid-connect/openid-connect).
- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication) and [Cache Components authentication](https://nextjs.org/docs/app/guides/authentication-with-cache-components).
