import type { Client } from "@libsql/client";
import { accountExists } from "./accounts";

export async function resolveAccount(client: Client, userId: unknown): Promise<{ id: string } | null> {
  if (typeof userId !== "string" || !userId) return null;
  return await accountExists(client, userId) ? { id: userId } : null;
}
