import "server-only";

import { getDatabaseClient } from "../db/server";
import { requireAccount } from "../auth/current-account";
import { readGuardedFullFoods } from "./full-catalog";
import { searchPublicFoods } from "./public-search";

export async function searchPublicFoodCatalog(rawTerm: string | undefined) {
  return searchPublicFoods(getDatabaseClient(), rawTerm);
}

export async function readAuthenticatedFoodCatalog(rawTerm: string | undefined, page: number) {
  return readGuardedFullFoods(getDatabaseClient(), requireAccount, rawTerm, page);
}
