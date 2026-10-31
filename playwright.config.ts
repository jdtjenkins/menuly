import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/prepare-database.ts",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
  },
  webServer: [{
    command: "node --import tsx tests/e2e/oidc-provider.ts",
    url: "http://127.0.0.1:3101/.well-known/openid-configuration",
    reuseExistingServer: false,
    timeout: 30_000,
  }, {
    command: "node node_modules/next/dist/bin/next start --port 3100",
    url: baseURL,
    env: {
      DATABASE_URL: "file:./data/menuly-google-auth-playwright.db",
      AUTH_SECRET: "playwright-only-session-secret-with-sufficient-length",
      AUTH_GOOGLE_ID: "playwright-client",
      AUTH_GOOGLE_SECRET: "playwright-secret",
      AUTH_TRUST_HOST: "true",
      MENULY_TEST_OIDC_ISSUER: "http://127.0.0.1:3101",
    },
    reuseExistingServer: false,
    timeout: 120_000,
  }],
});
