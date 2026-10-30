import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

test("global-food migration enforces references and preserves unknown nutrients", () => {
  const root = mkdtempSync(join(tmpdir(), "menuly-food-schema-"));
  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", join(process.cwd(), "tests/fixtures/global-food-schema.ts"), root], {
      cwd: process.cwd(), encoding: "utf8", timeout: 20_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
