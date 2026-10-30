# Proposal

## Why

The Food area currently shows an empty state, so visitors cannot find even the basic foods needed for later meal features. A small global catalog and safe public search make this area useful while keeping full nutrition and account features for their later changes.

## What Changes

- Add shared global-food storage with stable IDs, fixed g or ml units, reference amounts, and calorie, protein, carbohydrate, and fat values. Ordinary visitors cannot change these records.
- Add a separate, opt-in development seed migration containing 30 common foods. It runs only against a local development database; production catalog import remains a later change.
- Replace the Food empty state with term-based anonymous search. Limit the result count and expose only food names and calories, plus a prompt that full nutrition requires sign-in.
- Keep Google sign-in, authenticated catalog details, personal foods, and the production dataset outside this change.

## Capabilities

### New Capabilities

- `global-food-catalog`: Persistent shared food records, stable identities, read-only public access, and the local development seed.
- `public-food-search`: Term-based, bounded anonymous search with calorie-only public results and a full-nutrition sign-in prompt.

### Modified Capabilities

None. The existing primary-navigation specification already permits the Food area to gain its planned feature.

## Impact

- Adds a global-food schema migration and a separate development seed migration and command using the existing libSQL data layer.
- Adds server-side catalog queries and replaces `app/food/page.tsx` content; no database credentials or full nutrition values enter public output.
- Adds database, public-field filtering, and browser search tests. No new runtime service or authentication dependency is required.
