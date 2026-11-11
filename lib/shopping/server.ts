import "server-only";

import { requireAccount } from "../auth/current-account";
import { getDatabaseClient } from "../db/server";
import { listShoppingItems } from "./repository";

export async function listCurrentShoppingItems() {
  const account = await requireAccount();
  return listShoppingItems(getDatabaseClient(), account.id);
}
