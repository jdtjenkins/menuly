import { parseDatabaseConfig, type DatabaseConfig } from "./config";

export type RemoteSmokeEnvironment = {
  REMOTE_TEST_DATABASE_URL?: string;
  REMOTE_TEST_DATABASE_AUTH_TOKEN?: string;
  REMOTE_TEST_DATABASE_DISPOSABLE?: string;
  DATABASE_URL?: string;
};

export function parseRemoteSmokeConfig(env: RemoteSmokeEnvironment): DatabaseConfig {
  if (env.REMOTE_TEST_DATABASE_DISPOSABLE !== "yes") {
    throw new Error("Remote smoke requires REMOTE_TEST_DATABASE_DISPOSABLE=yes");
  }
  if (!env.REMOTE_TEST_DATABASE_URL?.trim()) {
    throw new Error("Remote smoke requires REMOTE_TEST_DATABASE_URL");
  }
  const config = parseDatabaseConfig({
    DATABASE_URL: env.REMOTE_TEST_DATABASE_URL,
    DATABASE_AUTH_TOKEN: env.REMOTE_TEST_DATABASE_AUTH_TOKEN,
  });
  if (config.kind !== "remote") {
    throw new Error("Remote smoke requires an HTTP(S) database URL");
  }
  if (env.DATABASE_URL) {
    const appConfig = parseDatabaseConfig({ DATABASE_URL: env.DATABASE_URL });
    if (appConfig.kind === "remote" && new URL(appConfig.url).href === new URL(config.url).href) {
      throw new Error("Remote smoke must not target DATABASE_URL");
    }
  }
  return config;
}
