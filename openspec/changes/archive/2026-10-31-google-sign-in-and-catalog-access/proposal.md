# Proposal

## Why

Visitors can search global foods but cannot sign in or see the full nutrition stored in the catalog. Google sign-in and an application session unlock the next V1 step while establishing an identity boundary for later private foods and meals.

## What Changes

- Add Google sign-in, sign-out, and application sessions that persist across visits and distinguish a valid signed-in account from an anonymous visitor.
- Persist an internal account ID and Google's stable subject ID as the provider identity. Do not persist OAuth email, name, picture, access token, or refresh token, and do not link accounts by email.
- Let signed-in users browse and search the global catalog with its reference amount, unit, calories, protein, carbohydrates, and fat, while preserving missing values as unknown.
- Keep anonymous catalog results limited to names and calories. Keep the Food sign-in prompt, and use one right-side global-navigation position for Google-branded sign-in when anonymous or sign-out when signed in.
- Present the primary area links as plain text with the current page in bold, and align them vertically with a Google sign-in action that has a visible hover state.
- Leave personal foods, additional providers, production catalog import, and account deletion for their later changes.

## Capabilities

### New Capabilities

- `user-authentication`: Google identity verification, minimal persisted provider identity, application sessions, and sign-out.
- `authenticated-food-catalog`: Signed-in browsing and searching of full global-food nutrition with server-side access checks.

### Modified Capabilities

- `public-food-search`: Make the sign-in prompt actionable while preserving the calorie-only anonymous response contract.
- `primary-navigation`: Replace the button-like area selector styling with text links that identify the current page through bold weight.

## Impact

- Adds an account identity migration, authentication routes and configuration, session handling, and sign-in/out UI. The right side of the global navigation shows the Google-branded sign-in action or, in the same position, sign-out for an active account.
- Refines global navigation styling so primary links read as text and the sign-in action aligns with them and responds visibly to hover.
- Extends the Food page and server-side catalog reader with an authenticated full-nutrition path; the existing anonymous query remains field limited.
- Adds auth and catalog tests plus environment setup documentation for Google OAuth credentials and the application secret.
