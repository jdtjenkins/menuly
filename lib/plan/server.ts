import "server-only";
import { requireAccount } from "../auth/current-account";
import { getDatabaseClient } from "../db/server";
import { addPlannedMeal, listPlannedMeals, removePlannedMeal, searchPlanMeals, updatePlannedMeal } from "./repository";
import type { PlanInput } from "./validation";

export async function listCurrentPlannedMeals() {
  const account = await requireAccount();
  return listPlannedMeals(getDatabaseClient(), account.id);
}

export async function searchCurrentPlanMeals(term: string) {
  const account = await requireAccount();
  return searchPlanMeals(getDatabaseClient(), account.id, term);
}

export async function addCurrentPlannedMeal(mealId: string, input: PlanInput) {
  const account = await requireAccount();
  return addPlannedMeal(getDatabaseClient(), account.id, mealId, input);
}

export async function updateCurrentPlannedMeal(id: string, input: PlanInput) {
  const account = await requireAccount();
  return updatePlannedMeal(getDatabaseClient(), account.id, id, input);
}

export async function removeCurrentPlannedMeal(id: string) {
  const account = await requireAccount();
  return removePlannedMeal(getDatabaseClient(), account.id, id);
}
