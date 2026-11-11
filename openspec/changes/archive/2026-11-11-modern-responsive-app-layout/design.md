# Design

## Context

See `proposal.md` for the motivation. `app/layout.tsx` currently gives the header and main area the same `max-w-6xl` limit, `app/globals.css` enables daisyUI's `cupcake` theme, and most actions already use daisyUI `btn` variants. The primary navigation is deliberately plain text links under its existing spec. The weekly plan is a semantic table with a keyboard-focusable horizontal scroll region, presently styled as one bordered white panel with 16-rem day columns. Existing form pages use narrower local widths, and the Google sign-in button has its own brand styling.

## Goals / Non-Goals

**Goals:**

- Use one wider container rule for the header and main area, with responsive gutters and locally constrained form widths.
- Define an intentional light, green-led palette and button hierarchy through the installed daisyUI system.
- Make the plan read as a seven-column workspace with individual day surfaces and planned-meal cards, while preserving table semantics and scoped scrolling.

**Non-Goals:**

- New meal-planning interactions, drag and drop, data changes, or different navigation destinations.
- Changing the plain text-link primary navigation contract or the Google sign-in identity treatment.

## Decisions

### Wider shared container

Raise the shared shell cap from 72rem to around 96rem (or the closest existing Tailwind utility), keeping aligned header and main gutters. Let the width grow with the viewport below that cap. Preserve local form width limits so long fields do not become difficult to read. This changes the shared layout once instead of assigning separate widths to every route; an uncapped full-bleed shell would create oversized reading lines and inconsistent alignment.

### Palette and action hierarchy

Use the installed daisyUI `emerald` light theme as the starting palette: neutral surfaces with green primary and a blue secondary accent. Tune only a small set of shared colors or radii if visual review finds contrast or hierarchy weak. Use existing daisyUI button variants consistently: filled primary for the principal action, outline or neutral for secondary, ghost for low-emphasis actions, and error for confirmed destructive actions. Preserve visible focus and disabled states. Keep Google sign-in branding separate, since turning it into a generic green button would weaken recognition. A custom component library is unnecessary for this CSS-level change.

### Standalone weekly workspace

Keep the native table, headers, cell associations, per-day autocomplete, and card controls. Style the region as a board section without an outer card border, fill, shadow, or inset padding; use subtle column surfaces and separators to give the Trello-like day rhythm. Size columns responsively so all seven can fit a wide desktop where practical, but keep a minimum usable column width and horizontal scrolling in the existing named region on smaller widths. Keep planned-meal cards as individual items within each column. Replacing the table with div columns would lose existing table semantics and require more accessibility work without meeting an additional user need.

### Responsive verification

Check the shell at mobile, tablet, and wide desktop widths, including long labels and the Google control. Use browser tests to assert viewport containment, scroll-region behavior, header alignment, and preserved plan interactions. Existing navigation tests assert exact font weights, branded Google colors, focus, and alignment; update only expectations that the approved presentation changes, while retaining behavior and accessibility checks.

## Risks / Trade-offs

- [Emerald colors may be too light for some action text or focus rings] → Review primary, error, and secondary contrast in rendered pages and adjust theme tokens or variants if needed.
- [Wider shell may expose overflow from forms or cards] → Check Food, Meals, and Meal Plan at 360px, tablet, and desktop widths; constrain children and keep wide tables in local scroll regions.
- [Narrower day columns may crowd card controls] → Set a usable column minimum and allow the board to scroll when that minimum cannot fit.
- [Style changes may invalidate pixel-specific browser assertions] → Retain functional and accessibility assertions; revise only style expectations tied to the old palette or shell dimensions.

## Migration Plan

No data migration is needed. Rollback is a code and CSS revert of the shared shell, theme, button classes, and plan presentation.
