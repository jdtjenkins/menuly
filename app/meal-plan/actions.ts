"use server";

import { revalidatePath } from "next/cache";
import { addCurrentPlannedMeal, removeCurrentPlannedMeal, searchCurrentPlanMeals, updateCurrentPlannedMeal } from "../../lib/plan/server";
import type { PlanErrors } from "../../lib/plan/validation";

export type PlanActionState = { errors: PlanErrors; message?: string; success?: boolean };

function readInput(formData: FormData) {
  return { weekday: String(formData.get("weekday") ?? ""), servings: String(formData.get("servings") ?? "") };
}

export async function searchPlanMealsAction(term: string) {
  return searchCurrentPlanMeals(term);
}

export async function addPlannedMealAction(_state: PlanActionState, formData: FormData): Promise<PlanActionState> {
  const result = await addCurrentPlannedMeal(String(formData.get("mealId") ?? ""), readInput(formData));
  if (!result.ok) return "notFound" in result ? { errors: {}, message: "Choose an available meal." } : { errors: result.errors };
  revalidatePath("/meal-plan");
  return { errors: {}, success: true };
}

export async function updatePlannedMealAction(id: string, _state: PlanActionState, formData: FormData): Promise<PlanActionState> {
  const result = await updateCurrentPlannedMeal(id, { servings: String(formData.get("servings") ?? "") });
  if (!result.ok) return "notFound" in result ? { errors: {}, message: "Planned meal is no longer available." } : { errors: result.errors };
  return { errors: {}, success: true };
}

export async function removePlannedMealAction(id: string): Promise<{ ok: boolean }> {
  const removed = await removeCurrentPlannedMeal(id);
  if (removed) revalidatePath("/meal-plan");
  return { ok: removed };
}
