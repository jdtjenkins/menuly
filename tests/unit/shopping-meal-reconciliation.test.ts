import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

test("meal saves reconcile checked amounts after all ingredient changes", () => {
  const root = mkdtempSync(join(tmpdir(), "menuly-check-meal-"));
  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", join(process.cwd(), "tests/fixtures/shopping-meal-reconciliation.ts"), root], { cwd: process.cwd(), encoding: "utf8", timeout: 20_000 });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
