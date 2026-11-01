"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { createCurrentGlobalClone } from "../../../lib/food/clone-server";
import { archiveCurrentPersonalFood, createCurrentPersonalFood, updateCurrentPersonalFood } from "../../../lib/food/personal-server";
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
  redirect("/food#personal-foods");
}

export async function archivePersonalFoodAction(id: string): Promise<void> {
  if (!await archiveCurrentPersonalFood(id)) notFound();
  revalidatePath("/food");
  redirect("/food#personal-foods");
}
