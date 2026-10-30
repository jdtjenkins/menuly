import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "node node_modules/next/dist/bin/next start --port 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
