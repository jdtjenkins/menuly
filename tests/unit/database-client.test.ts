import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

test("local data survives closing and reopening the client", () => {
  const projectRoot = mkdtempSync(join(tmpdir(), "menuly-db-"));
  try {
    const result = spawnSync(
      process.execPath,
      ["--import", "tsx", join(process.cwd(), "tests/fixtures/local-persistence.ts"), projectRoot],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
});
