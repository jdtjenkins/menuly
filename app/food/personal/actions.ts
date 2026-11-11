"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { createCurrentGlobalClone } from "../../../lib/food/clone-server";
import { archiveCurrentPersonalFoodWithAcknowledgement, createCurrentPersonalFood, getCurrentArchiveImpact, updateCurrentPersonalFood } from "../../../lib/food/personal-server";
import type { AffectedMeal } from "../../../lib/meals/archive-impact";
import { personalFoodInput, type PersonalFoodErrors, type PersonalFoodInput } from "../../../lib/food/personal-validation";

export type PersonalFoodFormState = { input: PersonalFoodInput; errors: PersonalFoodErrors; message?: string };

export async function createPersonalFoodAction(_previous: PersonalFoodFormState, formData: FormData): Promise<PersonalFoodFormState> {
  const input = personalFoodInput(formData);
  const result = await createCurrentPersonalFood(input);
  if (!result.ok) return { input, errors: result.errors };
  revalidatePath("/food");
  redirect("/food#personal-foods");
}

export async function createGlobalCloneAction(sourceId: string, _previous: PersonalFoodFormState, formData: FormData): Promise<PersonalFoodFormState> {
  const input = personalFoodInput(formData);
  const result = await createCurrentGlobalClone(sourceId, input);
  if (!result.ok) {
    if ("notFound" in result) return { input, errors: {}, message: "Source global food is no longer available." };
    return { input, errors: result.errors };
  }
  revalidatePath("/food");
  redirect("/food#personal-foods");
}

export async function updatePersonalFoodAction(id: string, _previous: PersonalFoodFormState, formData: FormData): Promise<PersonalFoodFormState> {
  const input = personalFoodInput(formData);
  const result = await updateCurrentPersonalFood(id, input);
  if (!result.ok) {
    if ("notFound" in result) return { input, errors: {}, message: "Food not found." };
    return { input, errors: result.errors };
  }
  revalidatePath("/food");
  revalidatePath("/meal-plan");
  redirect("/food#personal-foods");
}

export async function getArchiveImpactAction(id: string) { return getCurrentArchiveImpact(id); }

export async function archivePersonalFoodAction(id: string, meals: AffectedMeal[]) {
  if (!Array.isArray(meals) || meals.length > 100 || !meals.every((meal) => typeof meal?.id === "string" && typeof meal?.name === "string")) notFound();
  const result = await archiveCurrentPersonalFoodWithAcknowledgement(id, meals);
  if (result.status === "not-found") notFound();
  if (result.status === "stale") return result;
  revalidatePath("/food");
  revalidatePath("/meals");
  revalidatePath("/meal-plan");
  redirect("/food#personal-foods");
}
