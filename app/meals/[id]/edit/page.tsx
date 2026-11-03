import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getCurrentAccount } from "../../../../lib/auth/current-account";
import { getCurrentMeal, searchCurrentMealFoodChoices } from "../../../../lib/meals/server";
import { MealForm } from "../../meal-form";

export default function EditMealPage({ params }: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p>Loading meal editor…</p>}><EditMealContent params={params} /></Suspense>; }

async function EditMealContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!await getCurrentAccount()) redirect("/meals");
  const meal = await getCurrentMeal((await params).id);
  if (!meal) notFound();
  const choices = await searchCurrentMealFoodChoices("");
  return <div className="mx-auto max-w-3xl space-y-6"><h1 className="page-heading">Edit meal</h1><MealForm id={meal.id} initial={{ name: meal.name, servingYield: String(meal.servingYield), lines: meal.lines }} initialChoices={choices} /></div>;
}
