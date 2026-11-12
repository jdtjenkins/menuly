import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

test.each(["fresh", "partial", "rerun", "failure", "concurrent", "edited", "missing", "separate-ledger", "line-endings", "historical-weekday"])("migrations handle %s", (scenario) => {
  const projectRoot = mkdtempSync(join(tmpdir(), "menuly-migrations-"));
  try {
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", join(process.cwd(), "tests/fixtures/migration-scenarios.ts"), scenario, projectRoot],
      { cwd: process.cwd(), encoding: "utf8", timeout: 20_000 },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
});
