import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentAccount } from "../../../lib/auth/current-account";
import { getCurrentMeal } from "../../../lib/meals/server";
import { MealNutrition } from "../meal-nutrition";

export default function MealPage({ params }: { params: Promise<{ id: string }> }) { return <Suspense fallback={<p>Loading meal…</p>}><MealContent params={params} /></Suspense>; }

async function MealContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!await getCurrentAccount()) redirect("/meals");
  const meal = await getCurrentMeal((await params).id);
  if (!meal) notFound();
  return <div className="mx-auto max-w-3xl space-y-6">
    <div><Link href="/meals" className="link link-primary">All meals</Link><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">{meal.name}</h1><Link href={`/meals/${encodeURIComponent(meal.id)}/edit`} className="btn btn-outline">Edit meal</Link></div><p className="mt-2">Whole recipe makes {meal.servingYield} servings.</p></div>
    <section className="rounded-xl border border-base-300 bg-base-100 p-6"><h2 className="text-xl font-semibold">Ingredients</h2><ul className="mt-3 space-y-2">{meal.lines.map((line) => <li key={line.id}>{line.amount} {line.unit} {line.name}{line.archived ? " (archived)" : ""}</li>)}</ul></section>
    <MealNutrition key={`${meal.id}:${meal.servingYield}`} whole={meal.wholeNutrition} servingYield={meal.servingYield} />
  </div>;
}
