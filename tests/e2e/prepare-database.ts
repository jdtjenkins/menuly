import { spawnSync } from "node:child_process";
import { join } from "node:path";

export default function prepareDatabase() {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", join(process.cwd(), "tests/e2e/prepare-database-worker.ts")],
    { cwd: process.cwd(), encoding: "utf8", timeout: 30_000 },
  );
  if (result.error || result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || "Failed to prepare the browser test database");
  }
}
