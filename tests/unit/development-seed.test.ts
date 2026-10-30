import { expect, test } from "vitest";
import { parseDatabaseConfig } from "../../lib/db/config";
import { assertDevelopmentSeedTarget } from "../../lib/db/development-seed";

const local = parseDatabaseConfig({ DATABASE_URL: "file:./data/dev.db" });
const remote = parseDatabaseConfig({ DATABASE_URL: "http://db.internal:8080" });

test("development seed needs explicit opt-in and a local nonproduction target", () => {
  expect(() => assertDevelopmentSeedTarget(local, undefined, undefined)).toThrow(/MENULY_DEV_SEED=yes/);
  expect(() => assertDevelopmentSeedTarget(local, "true", undefined)).toThrow(/MENULY_DEV_SEED=yes/);
  expect(() => assertDevelopmentSeedTarget(local, "yes", "production")).toThrow(/production mode/);
  expect(() => assertDevelopmentSeedTarget(remote, "yes", "development")).toThrow(/local file/);
  expect(() => assertDevelopmentSeedTarget(local, "yes", "development")).not.toThrow();
});
