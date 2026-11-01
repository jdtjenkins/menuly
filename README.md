# Menuly

Menuly is a meal planning application. The Food area supports public catalog search, Google sign-in for full reference nutrition, and owner-only personal foods; Meals and Meal Plan remain informative starting points. Their full features are planned in [the implementation roadmap](docs/implementation-roadmap.md).

## Run locally

Install dependencies with `pnpm install`, run `pnpm db:migrate` before serving a version with catalog search, then start the development server:

```sh
pnpm dev
```

Open <http://localhost:3000>. The entry page takes you to Food.

## Public food search

The Food page accepts a name search through its GET form at `/food?q=apple`. Empty or whitespace-only terms show a search invitation instead of listing the catalog. Matching ignores letter case and returns at most 20 foods in a consistent name order. No-match searches show an empty result message.

Anonymous results include names and calories only. Signed-in users see My foods first and can choose **See global foods** to browse without a term or search 20 global foods per page, with reference amount, unit, calories, protein, carbohydrates, and fat. Use **My foods** to return. Internal food IDs are not shown on cards. Missing nutrition values display as unavailable. Ordinary visitors have no global-food write endpoint. Apply the shared schema migration before serving the search page, then optionally seed a local development database as described below. A production database needs its separate planned catalog import; the development seed is not deployed there.

## Personal foods

Run `pnpm db:migrate` before using personal foods so the owner-scoped table exists. Sign in, open Food, and use **Create personal food** in **My foods**. Enter a name, choose grams (`g`) or millilitres (`ml`), a positive reference amount, and calories. Protein, carbohydrates, and fat are optional; leave them blank when unknown. Enter `0` only for a measured zero. All nutrition values describe the chosen reference amount.

Your foods appear in **My foods**, where **Edit** changes the name, reference amount, and nutrition values. The unit and food identity stay fixed after creation. **Archive food** asks for confirmation, then removes the food from your active list while retaining its record and stable ID. Archived foods cannot be edited through the active flow. Only your signed-in account can view, edit, or archive these foods. Signing out hides them; anonymous global-food search remains available. Global foods stay separate and cannot be changed through personal-food forms.

To start from a shared entry, choose **See global foods** and **Copy to My foods** on a global food. Review the prefilled personal-food form and select **Create copy** to save it; cancelling saves nothing. Unknown optional nutrients remain blank, and a global food without calories needs a calorie value before the copy can be saved. Each copy has a new private ID and can be edited or archived independently. Changes to a copy do not change the global food or other copies, and existing meal ingredients are never replaced automatically.

## Google sign-in

Create a Google OAuth web client, set its authorized redirect URI to `http://localhost:3000/api/auth/callback/google` for local development, and add your site's exact callback URL in production. Set `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and a long random stable `AUTH_SECRET` in untracked `.env.local` or deployment secrets. Set `AUTH_TRUST_HOST=true` when running locally on a host you control. Restart the app after changing them. Keep all credentials server-side; do not prefix them with `NEXT_PUBLIC_`.

Use the Google-branded sign-in button on the right side of the navigation from any page; the Food prompt points to it. Google sign-in returns to Food. Once signed in, the same navigation position shows Sign out on Food, Meals, and Meal Plan. Sign out clears the current browser session and returns to Food, where anonymous search remains available. Sessions expire after seven days. The database stores only an internal account ID and Google's exact subject ID; it does not store profile fields or provider tokens. Protected catalog reads check that the account still exists. A copied session cookie can remain usable until expiry after browser sign-out, so treat the session secret as sensitive.

## Database connection

Copy `.env.example` to `.env.local` to start with the local file setting. Uncomment and replace the remote examples only when connecting to a remote server.

Server-side database code uses a local libSQL file at `data/menuly.db` by default. The `data/` directory and database sidecars are ignored by Git. The server creates the file's parent directory when it opens the database.

Set `DATABASE_URL` to select another file or a remote libSQL HTTP endpoint:

```text
DATABASE_URL=file:./data/menuly.db
DATABASE_URL=http://db.internal:8080
```

Use one URL at a time. File paths are resolved from the project root. For a remote server that requires token authentication, set `DATABASE_AUTH_TOKEN` in the server environment as well. Leave it unset for a local file or an unauthenticated private server. Do not use `NEXT_PUBLIC_` for either setting, and keep credentials in untracked environment files or deployment secrets.

A blank or unsupported URL, a remote URL with embedded credentials, query, or fragment, or a token paired with a file URL causes a configuration error. An unavailable remote database does not fall back to the local file.

## Database migrations

Run migrations before starting an app version that needs new schema:

```sh
pnpm db:migrate
```

The command reads the same `.env*` files as Next.js and uses the `DATABASE_URL` and optional `DATABASE_AUTH_TOKEN` settings above. With no URL set, it creates `data/menuly.db` and the migration ledger. The shared migration creates the global-food table but does not insert sample data.

Future schema changes belong in numbered TypeScript files in `migrations/`, such as `0002_add-meals.ts`. Each file exports a nonempty `statements` array containing SQL strings in execution order. Keep each applied file unchanged: the runner records its SHA-256 hash after normalizing CRLF to LF, accepts older hashes made with either line ending, and rejects substantive edits or missing history. Add a new numbered file for the next change. A migration and its completion record commit together; a rerun skips completed files.

For a **local development database only**, set `MENULY_DEV_SEED=yes` in your untracked `.env.local` and run `pnpm db:seed:dev`. The command requires this exact opt-in, rejects remote database URLs and production mode, applies the shared schema first, then runs the separate development seed migration. It inserts 30 common foods with stable `dev-` IDs and illustrative nutrition values per 100 g or 100 ml. These samples are for development and tests, not authoritative nutrition data or the later production import. Rerunning the command does not duplicate or change the entries. Remove the opt-in from `.env.local` when it is no longer needed.

For a remote database, back it up, set its private HTTP(S) URL and token if required, run `pnpm db:migrate`, then start the updated app. The command never chooses a remote endpoint unless you configure one.

To verify the remote path, supply a **dedicated disposable libSQL database** through `REMOTE_TEST_DATABASE_URL`, set `REMOTE_TEST_DATABASE_DISPOSABLE=yes`, and run `pnpm db:smoke:remote`. Set `REMOTE_TEST_DATABASE_AUTH_TOKEN` if that test server requires it. The smoke command refuses a file URL or the same URL as `DATABASE_URL`; it creates a test table and migration record in the supplied database. Dispose of that test database afterward. It is separate from the application's migration command.

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

The browser suite starts a local OIDC fixture for sign-in and session checks, so it does not need production Google credentials. The test scripts are defined in `package.json`; the browser servers and test directory are defined in `playwright.config.ts`.
