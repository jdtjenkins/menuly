import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient } from "@libsql/client/node";
import type { Client } from "@libsql/client";
import { parseDatabaseConfig, type DatabaseConfig } from "./config";

export function createDatabaseClient(
  config: DatabaseConfig = parseDatabaseConfig({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
  }),
): Client {
  if (config.kind === "file") {
    mkdirSync(dirname(config.filePath), { recursive: true });
  }

  return createClient({
    url: config.url,
    ...(config.kind === "remote" && config.authToken
      ? { authToken: config.authToken }
      : {}),
  });
}
