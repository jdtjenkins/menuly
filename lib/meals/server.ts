import "server-only";
import { requireAccount } from "../auth/current-account";
import { getDatabaseClient } from "../db/server";
import { recipeNutrition } from "./nutrition";
import { getMeal, listMeals, saveMeal, searchMealFoodChoices } from "./repository";
import type { MealInput } from "./validation";

export async function listCurrentMeals() {
  const account = await requireAccount();
  return listMeals(getDatabaseClient(), account.id);
}

export async function getCurrentMeal(id: string) {
  const account = await requireAccount();
  const meal = await getMeal(getDatabaseClient(), account.id, id);
  return meal ? { ...meal, wholeNutrition: recipeNutrition(meal.lines) } : null;
}

export async function saveCurrentMeal(input: MealInput, id?: string) {
  const account = await requireAccount();
  return saveMeal(getDatabaseClient(), account.id, input, id);
}

export async function searchCurrentMealFoodChoices(term: string) {
  const account = await requireAccount();
  return searchMealFoodChoices(getDatabaseClient(), account.id, term);
}
