import "server-only";

import type { Client } from "@libsql/client";
import { createDatabaseClient } from "./client";

let client: Client | undefined;

export function getDatabaseClient(): Client {
  client ??= createDatabaseClient();
  return client;
}
