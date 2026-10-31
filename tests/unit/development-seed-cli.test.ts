import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

test("development seed command inserts exactly 30 stable foods and reruns safely", () => {
  const root = mkdtempSync(join(tmpdir(), "menuly-seed-cli-"));
  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", join(process.cwd(), "tests/fixtures/development-seed-cli.ts"), root], {
      cwd: process.cwd(), encoding: "utf8", timeout: 80_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 20_000);
