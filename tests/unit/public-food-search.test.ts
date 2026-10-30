import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";
import { normalizePublicFoodTerm, PUBLIC_SEARCH_MAX_LENGTH } from "../../lib/food/public-search";

test("public terms are trimmed and bounded", () => {
  expect(normalizePublicFoodTerm(undefined)).toBe("");
  expect(normalizePublicFoodTerm("  apple  ")).toBe("apple");
  expect(normalizePublicFoodTerm("a".repeat(200))).toHaveLength(PUBLIC_SEARCH_MAX_LENGTH);
});

test("public query is literal, case insensitive, bounded, and field limited", () => {
  const root = mkdtempSync(join(tmpdir(), "menuly-food-search-"));
  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", join(process.cwd(), "tests/fixtures/public-food-search.ts"), root], {
      cwd: process.cwd(), encoding: "utf8", timeout: 30_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
