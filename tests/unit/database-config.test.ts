import { describe, expect, test } from "vitest";
import { join } from "node:path";
import { parseDatabaseConfig } from "../../lib/db/config";

describe("database configuration", () => {
  const root = join(process.cwd(), "test-project");

  test("uses a project-local file by default", () => {
    const config = parseDatabaseConfig({}, root);
    expect(config.kind).toBe("file");
    if (config.kind === "file") {
      expect(config.filePath).toBe(join(root, "data", "menuly.db"));
    }
  });

  test("accepts a configured local file", () => {
    const config = parseDatabaseConfig({ DATABASE_URL: "file:./other/store.db" }, root);
    expect(config.kind).toBe("file");
    if (config.kind === "file") {
      expect(config.filePath).toBe(join(root, "other", "store.db"));
    }
  });

  test("accepts a remote HTTP endpoint and optional token", () => {
    expect(parseDatabaseConfig({ DATABASE_URL: "http://db.internal:8080" }, root)).toMatchObject({
      kind: "remote",
      url: "http://db.internal:8080",
    });
    expect(parseDatabaseConfig({ DATABASE_URL: "https://db.example", DATABASE_AUTH_TOKEN: "secret" }, root)).toMatchObject({
      kind: "remote",
      authToken: "secret",
    });
  });

  test.each([
    { DATABASE_URL: "" },
    { DATABASE_URL: "postgres://db.internal" },
    { DATABASE_URL: "https://db.internal?authToken=secret" },
    { DATABASE_URL: "file:" },
    { DATABASE_URL: "file:./store.db", DATABASE_AUTH_TOKEN: "secret" },
    { DATABASE_AUTH_TOKEN: "secret" },
    { DATABASE_URL: "https://db.example", DATABASE_AUTH_TOKEN: "" },
  ])("rejects invalid or incomplete settings: %o", (env) => {
    expect(() => parseDatabaseConfig(env, root)).toThrow();
  });
});
