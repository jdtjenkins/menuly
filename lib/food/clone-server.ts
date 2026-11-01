import "server-only";

import { requireAccount } from "../auth/current-account";
import { getDatabaseClient } from "../db/server";
import { globalFoodToPersonalInput, readGlobalFoodById } from "./full-catalog";
import { createPersonalFood } from "./personal-repository";
import { validatePersonalFood, type PersonalFoodInput } from "./personal-validation";

export async function getCurrentGlobalCloneDraft(sourceId: string) {
  await requireAccount();
  const source = await readGlobalFoodById(getDatabaseClient(), sourceId);
  return source ? globalFoodToPersonalInput(source) : null;
}

export async function createCurrentGlobalClone(sourceId: string, input: PersonalFoodInput) {
  const account = await requireAccount();
  const client = getDatabaseClient();
  if (!await readGlobalFoodById(client, sourceId)) return { ok: false as const, notFound: true as const };
  const result = validatePersonalFood(input);
  if (!result.ok) return result;
  return { ok: true as const, food: await createPersonalFood(client, account.id, result.values) };
}
