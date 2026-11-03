# Design

## Context

See `proposal.md` for motivation. The completed but unarchived `modern-responsive-app-layout` change widens the shared shell to 96rem, applies a light emerald daisyUI theme, and keeps the weekly plan as a standalone scrolling table. `PrimaryNavigation` currently renders wrapping links and the account action at all widths. The accepted `primary-navigation` and `user-authentication` specs describe the current always-visible mobile links and right-side account action; the deltas in this change revise those contracts.

## Goals / Non-Goals

**Goals:** Keep the existing desktop shell and top navigation; provide one clear mobile navigation path; establish repeatable page-level visual patterns without changing how content works.

**Non-Goals:** Add destinations, account features, dark mode, new planning interactions, or a new component library. The Railway reference guides visual character rather than exact colors or a copied layout.

## Decisions

### Navigation layout and breakpoint

Keep the brand, text links, and account action in the desktop header. At a breakpoint where that row no longer fits comfortably (initially the existing `lg` layout threshold), show the brand and a labelled menu toggle instead. This preserves the familiar desktop layout and gives narrower widths a stable header. A persistent desktop sidebar was considered and declined because Menuly has only three primary areas and the weekly board benefits from the width.

### Mobile panel behavior

Use one left-side overlay panel with a backdrop. Include the three primary links and the current Google sign-in or sign-out action in it. Keep account rendering tied to the existing server-side auth control, so no client-side account state or new data request is needed. Use accessible modal behavior: move focus into the open panel, keep background content out of the keyboard path, close on Escape, close control, backdrop, or route selection, and restore focus to the toggle after dismissal. A simple CSS-only checkbox drawer was considered, but it would make focus and route-change behavior harder to manage reliably. Respect reduced-motion preferences when animating the slide.

### Light visual system and page patterns

Build on the existing daisyUI theme and shared CSS tokens. Shift the emphasis toward near-white and soft neutral surfaces, charcoal text, subtle borders, restrained green action accents, compact controls, and modest corner radii. Use shadow sparingly. Define reusable styling patterns for page titles, supporting copy, section headers, content panels, list rows or cards, and action groups, then apply them consistently across Food, Meals, and Meal Plan. Keep spacing between the current roomy and dense extremes. Preserve the Google control's recognizable branding and the existing action hierarchy, focus states, and disabled states. A wholesale theme or component-library replacement would increase scope without helping these pages.

### Width and responsive content

Retain the 96rem aligned shell and narrow local form widths. Let lists and the standalone seven-day plan use the available desktop width. Keep wide tables scrolling within their named regions on mobile while ordinary page content remains within the viewport. The drawer must not cause page-level horizontal overflow or reduce the usable width when closed.

## Risks / Trade-offs

- [Two navigation presentations drift or expose duplicate interactive controls] -> Reuse one destination definition and confirm only the active desktop or mobile presentation is keyboard reachable at each breakpoint.
- [Account control loads after the panel opens] -> Keep a stable panel structure while the existing auth control resolves; verify both anonymous and signed-in states.
- [Drawer animation or dismissal disrupts keyboard use] -> Verify focus entry, Escape, backdrop, route selection, focus return, and reduced-motion behavior in browser tests.
- [Styling changes weaken contrast or recreate cramped pages] -> Review representative Food, Meals, and Meal Plan states at 360px, tablet, and wide desktop widths, including long content and focus/disabled states.
- [The earlier visual change is still unarchived] -> Implement on top of its current work without overwriting it; reconcile its accepted visual-system spec when the changes are archived.

## Migration Plan

No data migration is needed. Rollout is a UI change with updated browser coverage. Reverting the navigation component and shared/page styles restores the previous presentation without changing stored data or URLs.
