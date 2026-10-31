import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test, vi } from "vitest";
import { createAuthCallbacks } from "../../lib/auth/callbacks";

test("account mapping and full catalog work against a migrated disposable database", () => {
  const root = mkdtempSync(join(tmpdir(), "menuly-auth-catalog-"));
  try {
    const result = spawnSync(process.execPath, ["--import", "tsx", join(process.cwd(), "tests/fixtures/auth-catalog.ts"), root], {
      cwd: process.cwd(), encoding: "utf8", timeout: 30_000,
    });
    expect(result.error).toBeUndefined();
    expect(result.status, result.stderr).toBe(0);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}, 20_000);

test("auth callbacks retain only account id and reject external return URLs", async () => {
  const map = vi.fn(async () => "internal-id");
  const callbacks = createAuthCallbacks(map);
  const jwt = callbacks.jwt! as (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  const token = await jwt({ token: { name: "Private", email: "private@example.com", picture: "photo" }, account: { provider: "google", providerAccountId: "exact-subject", access_token: "secret" } });
  expect(token).toEqual({ userId: "internal-id" });
  expect(map).toHaveBeenCalledWith("exact-subject");
  expect(await jwt({ token: { name: "Changed Name", email: "new@example.com" }, account: { provider: "google", providerAccountId: "exact-subject" } })).toEqual(token);
  expect(await jwt({ token: { ...token, email: "private@example.com" } })).toEqual({ userId: "internal-id" });
  expect(await jwt({ token: {}, account: { provider: "google" } })).toEqual({});
  expect(map).toHaveBeenCalledTimes(2);
  const session = callbacks.session! as unknown as (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  expect(await session({ session: { expires: "soon", user: { email: "private@example.com" } }, token })).toEqual({ expires: "soon", user: { id: "internal-id" } });
  const redirect = callbacks.redirect! as (args: { url: string; baseUrl: string }) => Promise<string>;
  expect(await redirect({ url: "/food", baseUrl: "http://localhost:3000" })).toBe("http://localhost:3000/food");
  expect(await redirect({ url: "https://evil.example/", baseUrl: "http://localhost:3000" })).toBe("http://localhost:3000/food");
});
