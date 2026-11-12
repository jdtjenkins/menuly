import "server-only";

import { requireAccount } from "../auth/current-account";
import { getDatabaseClient } from "../db/server";
import { listShoppingChecklist, setShoppingChecked, type FoodSource } from "./checklist-repository";

export async function listCurrentShoppingItems() {
  const account = await requireAccount();
  return listShoppingChecklist(getDatabaseClient(), account.id);
}

export async function setCurrentShoppingChecked(source: FoodSource, foodId: string, checked: boolean) {
  const account = await requireAccount();
  return setShoppingChecked(getDatabaseClient(), account.id, source, foodId, checked);
}
