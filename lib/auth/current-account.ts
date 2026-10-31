import "server-only";

import { cache } from "react";
import { resolveAccount } from "./resolve-account";
import { auth } from "./server";
import { getDatabaseClient } from "../db/server";

export const getCurrentAccount = cache(async (): Promise<{ id: string } | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return resolveAccount(getDatabaseClient(), session?.user?.id);
});

export async function requireAccount(): Promise<{ id: string }> {
  const account = await getCurrentAccount();
  if (!account) throw new Error("Authentication required");
  return account;
}
