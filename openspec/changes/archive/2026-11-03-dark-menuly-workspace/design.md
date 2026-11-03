# Design

## Context

See `proposal.md` for motivation and the capability deltas for observable behavior. The current app uses Geist, Tailwind CSS 4, daisyUI 5, a built-in `emerald` theme with local overrides, a 96rem shell, desktop top links, and a native-dialog mobile drawer. The seven-day plan is a semantic table with its own horizontal scroll region. Two completed but unarchived changes describe the present light UI, while accepted navigation and authentication specs still describe the older top-navigation arrangement.

The supplied Linear image shows a full text sidebar, compact rows, strong title contrast, quiet metadata, and thin dividers across charcoal surfaces. The supplied Railway image shows a near-black violet canvas with low-contrast dots and restrained green and purple accents. The pink gradient around the Linear window is framing, not part of its app UI; do not reproduce it.

## Goals / Non-Goals

**Goals:** Make Menuly's own dark visual language from these references; keep the main workspace as wide as the sidebar permits; preserve the mobile drawer's accessible behavior and existing product flows.

**Non-Goals:** Reproduce either product's branding, icons, data density, or extra navigation destinations; add a light-theme toggle; replace daisyUI components; change plan data or server actions.

## Decisions

### Custom Menuly theme

Use daisyUI for component classes, with its built-in themes disabled and one custom theme named `Menuly` defined in `app/globals.css` using daisyUI 5's `@plugin "daisyui/theme"` syntax. Set it as the default, set `color-scheme: dark`, and apply `data-theme="Menuly"` at the root. Define the full semantic colour set and component radii, sizes, and border tokens so controls do not inherit a built-in palette. Keep the theme's CSS variable name stable and use custom CSS for page-specific surfaces and the canvas. A built-in dark theme with scattered overrides would repeat the current styling drift.

Start with near-black violet for the content canvas, charcoal for the sidebar, one step lighter for panels and inputs, and quiet borders. Use near-white for primary text, muted grey-violet for supporting copy, a restrained green primary accent that keeps Menuly's existing identity, and violet as a secondary accent. Preserve semantic warning and error colours. Adjust the initial values after checking actual contrast and rendered states; the screenshot colours are reference proportions, not exact values to copy. Keep the Google mark multicolour and its sign-in control recognizable in the dark sidebar.

### Typography, spacing, and hierarchy

Keep Geist. Bring the current 44px desktop page heading closer to a compact workspace scale (roughly 28-32px), with section headings around 18-20px, body copy around 14-16px, and metadata around 12-13px. Use weight and foreground contrast before accent colour to establish hierarchy. Use an 8px spacing rhythm: roughly 16-20px panel padding, 20-28px between sections, and compact desktop sidebar rows. Keep mobile tap targets at least 44px. Use subtle borders and selected-row fills; reserve stronger colour for primary actions, focus, status, and errors. Avoid pervasive shadows and oversized card padding. This follows the reference images' density without making Menuly's recipe forms cramped.

### Desktop shell and mobile navigation

Use a two-column shell at the existing large-screen breakpoint: an approximately 15rem, full-height left sidebar and a `min-width: 0` main region. Put Menuly's brand at the top, the three labelled primary links directly below without a "Workspace" caption, and the current account action in a sidebar footer. Keep the sidebar visible while the main page scrolls. Use a subtle active-row treatment plus the current link semantics and visible keyboard focus. A slim icon rail was considered; the user chose visible labels. A top nav was considered; the user chose the left sidebar.

Below the breakpoint, show a compact header with brand and menu toggle, and reuse the existing left modal drawer, backdrop, Escape, focus return, and reduced-motion behavior. Keep the same destinations and account control in both presentations, without a "Workspace" caption in the drawer. Do not add duplicate keyboard-reachable controls at any viewport width.

### Dotted content canvas and responsive width

Draw the grid with a CSS radial gradient on the main content canvas, using small low-opacity dots at roughly a 24px interval. Keep the sidebar solid and give forms, list rows, and meal cards opaque surfaces so dots never compete with text. Do not use a bitmap or repeat the dots inside every card. Suppress decorative dots in forced-colours mode. The grid is static, so no motion setting is needed for it.

Retain the broad content cap but size the main region from the space left after the sidebar. The old expectation of 1280px of content at a 1440px viewport is incompatible with a labelled sidebar and must be replaced by a remaining-width rule. Keep meal create and edit forms at a readable local width. Personal food Create, Copy, and Edit pages use the full available content width, with responsive field columns to keep labels and values scannable. Reassess the weekly table's current 77rem minimum width and column spacing so all seven days remain scannable around 1440px where practical; on smaller screens, keep horizontal scrolling inside its named board region. Place each day-specific autocomplete above its cards, remove the visible "Add meal to" label and its separator, keep a screen-reader label, and remove the divider under each day heading.

Below the mobile breakpoint, size each day column to the board's available content width so one complete day is visible at a time. Keep the seven-column semantic table inside its focusable horizontal scroll region and keep the scroll width local to that region. Show a short "Scroll to see more days →" hint adjacent to the board on mobile; the hint must remain readable without covering the day heading or controls. Keep the existing compact seven-day layout on desktop. Check the visible column width, all seven reachable days, and page-level overflow at 360px and 375px.

Give the weekly board a minimum height equal to the viewport space remaining below its top edge: after the heading and scroll hint on mobile, and after the heading on desktop. Let the table's body cells stretch together so empty days have a full-height surface at either size. Use a minimum height rather than a fixed height: meal cards may extend the board and page vertically, with no nested vertical scroll. Account for the mobile header and viewport changes through the board's actual position and dynamic viewport height. Preserve the seven-column desktop width and board-local horizontal scrolling where needed. Check sparse and populated days at mobile and desktop sizes, including after horizontal scrolling on mobile.

## Risks / Trade-offs

- [A dark palette can hide low-emphasis labels, focus rings, validation, and disabled states] -> Review contrast and interaction states across forms, food lists, meal cards, and the board, including browser-native controls.
- [A sidebar can make the seven-day board too narrow] -> Check the board at 1440px and smaller desktop widths, adjust column density without shrinking controls below usability, and retain local scrolling when needed.
- [Canvas dots can reduce reading clarity or create visual noise] -> Use low opacity, place them only in exposed main-canvas space, keep content surfaces opaque, and check dense pages and mobile.
- [Desktop and mobile navigation can drift] -> Share one destination definition and verify active state, account action, keyboard reachability, and breakpoint behavior in browser tests.
- [Earlier unarchived specs still say light theme, top nav, and 1280px content at 1440px] -> Treat this change as the intended successor and reconcile those specs in a separately approved archive sequence before merging durable requirements.

## Migration Plan

No data migration is required. Implement this on the current UI branch after review, update the browser expectations that encode the old theme and header geometry, and verify the dark shell at mobile, tablet, and desktop sizes. Rollback is a UI code and CSS revert. Archival of the earlier changes remains a separate approval step.
