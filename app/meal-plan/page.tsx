import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getCurrentAccount } from "../../lib/auth/current-account";
import { listCurrentPlannedMeals } from "../../lib/plan/server";
import { weekdays, type Weekday } from "../../lib/plan/validation";
import { AddPlannedMeal } from "./add-planned-meal";
import { PlannedMealControls } from "./planned-meal-controls";

export default function MealPlanPage() {
  return <Suspense fallback={<p>Loading meal plan…</p>}><MealPlanContent /></Suspense>;
}

async function MealPlanContent() {
  await connection();
  const account = await getCurrentAccount();
  if (!account) return <section className="space-y-4"><h1 className="text-4xl font-bold">Meal Plan</h1><p>Sign in with Google in the navigation to plan your private meals.</p></section>;
  const cards = await listCurrentPlannedMeals();
  return <div className="space-y-6">
    <div><h1 className="text-4xl font-bold">Meal Plan</h1><p className="mt-2 text-base-content/75">Your reusable Monday-to-Sunday plan.</p></div>
    {cards.length === 0 && <p className="rounded-xl border border-base-300 bg-base-100 p-4">Your plan is empty. <Link href="/meals/new" className="link link-primary">Create a meal</Link> or add one below.</p>}
    <div role="region" aria-label="Weekly plan table" tabIndex={0} className="overflow-x-auto rounded-xl border border-base-300 bg-base-100">
      <table aria-label="Weekly meal plan" className="table min-w-[112rem] table-fixed">
        <thead><tr>{weekdays.map((day, weekday) => <th key={day} id={`plan-day-${weekday}`} scope="col" className="w-64 text-base font-semibold">{day}</th>)}</tr></thead>
        <tbody><tr>{weekdays.map((day, weekday) => <td key={day} headers={`plan-day-${weekday}`} className="w-64 align-top">
          <ul className="space-y-3" aria-label={`${day} meals`}>
            {cards.filter((card) => card.weekday === weekday).map((card) => <li key={card.id} className="rounded-lg border border-base-300 bg-base-200/40 p-3">
              <Link href={`/meals/${encodeURIComponent(card.mealId)}`} className="font-semibold link link-hover">{card.mealName}</Link>
              <p className="text-sm text-base-content/70">{card.servings} {card.servings === 1 ? "serving" : "servings"}</p>
              <PlannedMealControls card={card} />
            </li>)}
          </ul>
          <AddPlannedMeal weekday={weekday as Weekday} day={day} />
        </td>)}</tr></tbody>
      </table>
    </div>
  </div>;
}
