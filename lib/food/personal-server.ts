import "server-only";

import { requireAccount } from "../auth/current-account";
import { getDatabaseClient } from "../db/server";
import { createPersonalFood, getPersonalFood, listPersonalFoods, updatePersonalFood } from "./personal-repository";
import { archiveWithMealAcknowledgement, getArchiveImpact, type AffectedMeal } from "../meals/archive-impact";
import { validatePersonalFood, type PersonalFoodInput } from "./personal-validation";

export async function listCurrentPersonalFoods(page = 1) {
  const account = await requireAccount();
  return listPersonalFoods(getDatabaseClient(), account.id, page);
}

export async function getCurrentPersonalFood(id: string) {
  const account = await requireAccount();
  return getPersonalFood(getDatabaseClient(), account.id, id);
}

export async function createCurrentPersonalFood(input: PersonalFoodInput) {
  const account = await requireAccount();
  const result = validatePersonalFood(input);
  if (!result.ok) return result;
  return { ok: true as const, food: await createPersonalFood(getDatabaseClient(), account.id, result.values) };
}

export async function updateCurrentPersonalFood(id: string, input: PersonalFoodInput) {
  const account = await requireAccount();
  const client = getDatabaseClient();
  const existing = await getPersonalFood(client, account.id, id);
  if (!existing) return { ok: false as const, notFound: true as const };
  const result = validatePersonalFood(input);
  if (!result.ok) return result;
  if (result.values.unit !== existing.unit) return { ok: false as const, errors: { unit: "Unit cannot be changed." } };
  const food = await updatePersonalFood(client, account.id, id, result.values);
  if (!food) return { ok: false as const, notFound: true as const };
  return { ok: true as const, food };
}

export async function getCurrentArchiveImpact(id: string) {
  const account = await requireAccount();
  return getArchiveImpact(getDatabaseClient(), account.id, id);
}

export async function archiveCurrentPersonalFoodWithAcknowledgement(id: string, meals: AffectedMeal[]) {
  const account = await requireAccount();
  return archiveWithMealAcknowledgement(getDatabaseClient(), account.id, id, meals);
}
