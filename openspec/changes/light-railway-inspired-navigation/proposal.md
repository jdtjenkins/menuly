# Proposal

## Why

Menuly's wider shell still presents a crowded mobile header, and its pages use different densities and surface treatments. A light, Railway-inspired presentation can make navigation clearer and the three main areas feel like one product.

## What Changes

- Keep the wide desktop layout and top navigation. On mobile, replace the visible row of primary links with a toggle that opens a left-side navigation panel containing Food, Meals, Meal Plan, and the current account action.
- Give the mobile panel a backdrop and clear close behavior while keeping navigation keyboard accessible and the current area identifiable.
- Establish consistent page headings, content surfaces, borders, spacing, and control density across Food, Meals, and Meal Plan. Use a light palette with restrained green accents and a middle-ground density; keep wide data workspaces wide and forms comfortably narrow.
- Preserve navigation destinations, Google sign-in branding, authentication behavior, meal-plan interactions, and the existing desktop width and mobile overflow rules.

## Capabilities

### New Capabilities

- `page-presentation`: Consistent page hierarchy, content surfaces, and moderate density across the main areas.

### Modified Capabilities

- `primary-navigation`: Keep top links on desktop and provide a mobile navigation panel with accessible open and close behavior.
- `user-authentication`: Place the existing sign-in or sign-out control inside the mobile navigation panel while retaining its desktop position and Google branding.

## Impact

- Shared shell and navigation in `app/layout.tsx`, `app/primary-navigation.tsx`, `app/navigation-auth.tsx`, and `app/globals.css`; presentation in the Food, Meals, and Meal Plan routes and their existing components.
- Browser coverage for navigation, authentication controls, responsiveness, and representative page layouts. No data model, API, or new dependency is expected.
- Builds on the completed but unarchived `modern-responsive-app-layout` change; its shared visual-system work should be retained when this change is implemented.
