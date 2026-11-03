import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getCurrentAccount } from "../../../lib/auth/current-account";
import { searchCurrentMealFoodChoices } from "../../../lib/meals/server";
import { MealForm } from "../meal-form";

export default function NewMealPage() { return <Suspense fallback={<p>Loading meal form…</p>}><NewMealContent /></Suspense>; }

async function NewMealContent() {
  await connection();
  if (!await getCurrentAccount()) redirect("/meals");
  const choices = await searchCurrentMealFoodChoices("");
  return <div className="mx-auto max-w-3xl space-y-6"><h1 className="page-heading">Create meal</h1><MealForm initialChoices={choices} /></div>;
}
