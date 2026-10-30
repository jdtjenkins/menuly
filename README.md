# Menuly

Menuly is a meal planning application. This first delivery provides the Food, Meals, and Meal Plan areas as accessible, informative starting points. Their full features are planned in [the implementation roadmap](docs/implementation-roadmap.md).

## Run locally

Install dependencies with `pnpm install`, then start the development server:

```sh
pnpm dev
```

Open <http://localhost:3000>. The entry page takes you to Food.

## Checks

Run the unit and component tests:

```sh
pnpm test:unit
```

Playwright uses Chromium. Install its browser binary once on each machine:

```sh
pnpm exec playwright install chromium
```

Build the app before browser tests. The Playwright configuration starts and stops a local production server on port 3100 automatically:

```sh
pnpm build
pnpm test:e2e
```

Run the linter separately:

```sh
pnpm lint
```

The test scripts are defined in `package.json`; the browser server and test directory are defined in `playwright.config.ts`.
