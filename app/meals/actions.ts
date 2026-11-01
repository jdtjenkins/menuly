"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveCurrentMeal, searchCurrentMealFoodChoices } from "../../lib/meals/server";
import type { MealErrors, MealInput } from "../../lib/meals/validation";

export type MealFormState = { errors: MealErrors; message?: string };

function readInput(formData: FormData): MealInput {
  let lines: MealInput["lines"] = [];
  try {
    const value: unknown = JSON.parse(String(formData.get("lines") ?? "[]"));
    if (Array.isArray(value)) lines = value.map((line) => {
      const item = line && typeof line === "object" ? line as Record<string, unknown> : {};
      return { lineId: typeof item.lineId === "string" ? item.lineId : undefined, source: String(item.source ?? ""), foodId: String(item.foodId ?? ""), amount: String(item.amount ?? "") };
    });
  } catch { /* validation will reject an empty list */ }
  return { name: String(formData.get("name") ?? ""), servingYield: String(formData.get("servingYield") ?? ""), lines };
}

export async function saveMealAction(id: string | null, _state: MealFormState, formData: FormData): Promise<MealFormState> {
  const result = await saveCurrentMeal(readInput(formData), id ?? undefined);
  if (!result.ok) return "notFound" in result ? { errors: {}, message: "Meal not found." } : { errors: result.errors };
  revalidatePath("/meals");
  redirect(`/meals/${encodeURIComponent(result.id)}`);
}

export async function searchMealFoodsAction(term: string) {
  return searchCurrentMealFoodChoices(term);
}
