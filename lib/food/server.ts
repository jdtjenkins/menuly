import "server-only";

import { getDatabaseClient } from "../db/server";
import { searchPublicFoods } from "./public-search";

export async function searchPublicFoodCatalog(rawTerm: string | undefined) {
  return searchPublicFoods(getDatabaseClient(), rawTerm);
}
