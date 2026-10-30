import { expect, test } from "vitest";
import { parseRemoteSmokeConfig } from "../../lib/db/remote-smoke-config";

const testUrl = "http://remote-test.internal:8080";

test("remote smoke requires an explicit disposable target", () => {
  expect(() => parseRemoteSmokeConfig({ REMOTE_TEST_DATABASE_URL: testUrl })).toThrow(/DISPOSABLE/);
  expect(() => parseRemoteSmokeConfig({ REMOTE_TEST_DATABASE_DISPOSABLE: "yes" })).toThrow(/REMOTE_TEST_DATABASE_URL/);
});

test("remote smoke rejects local and application database targets", () => {
  expect(() => parseRemoteSmokeConfig({
    REMOTE_TEST_DATABASE_DISPOSABLE: "yes",
    REMOTE_TEST_DATABASE_URL: "file:./data/test.db",
  })).toThrow(/HTTP\(S\)/);
  expect(() => parseRemoteSmokeConfig({
    REMOTE_TEST_DATABASE_DISPOSABLE: "yes",
    REMOTE_TEST_DATABASE_URL: testUrl,
    DATABASE_URL: testUrl,
  })).toThrow(/must not target/);
  expect(() => parseRemoteSmokeConfig({
    REMOTE_TEST_DATABASE_DISPOSABLE: "yes",
    REMOTE_TEST_DATABASE_URL: testUrl + "/",
    DATABASE_URL: testUrl,
  })).toThrow(/must not target/);
});

test("remote smoke accepts a separate HTTP test endpoint", () => {
  expect(parseRemoteSmokeConfig({
    REMOTE_TEST_DATABASE_DISPOSABLE: "yes",
    REMOTE_TEST_DATABASE_URL: testUrl,
    REMOTE_TEST_DATABASE_AUTH_TOKEN: "secret",
    DATABASE_URL: "http://application.internal:8080",
  })).toMatchObject({ kind: "remote", url: testUrl, authToken: "secret" });
});
