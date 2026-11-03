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
  if (!account) return <section><h1 className="page-heading">Meal Plan</h1><p className="page-lead">Sign in with Google in the navigation to plan your private meals.</p></section>;
  const cards = await listCurrentPlannedMeals();
  return <div className="weekly-plan-page min-w-0 space-y-6">
    <div><h1 className="page-heading">Meal Plan</h1><p className="page-lead">Your reusable Monday-to-Sunday plan.</p></div>
    {cards.length === 0 && <p className="text-sm text-base-content/75">Your plan is empty. <Link href="/meals/new" className="link link-primary">Create a meal</Link> or add one below.</p>}
    <section aria-label="Weekly plan board" className="weekly-plan-board min-w-0">
      <p id="weekly-plan-scroll-hint" className="mb-3 flex justify-end text-sm font-medium sm:hidden">
        <span className="rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-base-content/80">Scroll to see more days <span aria-hidden="true" className="text-primary">→</span></span>
      </p>
      <div role="region" aria-label="Weekly plan table" aria-describedby="weekly-plan-scroll-hint" tabIndex={0} className="weekly-plan-region w-full max-w-full overflow-x-auto focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <table aria-label="Weekly meal plan" className="weekly-plan-table table w-full min-w-[67rem] table-fixed border-separate border-spacing-x-1 border-spacing-y-0">
        <thead><tr className="border-b-0">{weekdays.map((day, weekday) => <th key={day} id={`plan-day-${weekday}`} scope="col" className="w-[9.5rem] rounded-t-lg border-x border-t border-b-0 border-base-300 bg-base-100 px-2 py-3 text-sm font-semibold text-base-content">{day}</th>)}</tr></thead>
        <tbody><tr>{weekdays.map((day, weekday) => <td key={day} headers={`plan-day-${weekday}`} className="w-[9.5rem] rounded-b-lg border-x border-b border-base-300 bg-base-100 px-2 pb-4 align-top">
          <AddPlannedMeal weekday={weekday as Weekday} day={day} />
          <ul className="mt-3 space-y-3" aria-label={`${day} meals`}>
            {cards.filter((card) => card.weekday === weekday).map((card) => <li key={card.id} className="surface-row p-3">
              <Link href={`/meals/${encodeURIComponent(card.mealId)}`} className="font-semibold link link-hover">{card.mealName}</Link>
              <p className="text-sm text-base-content/70">{card.servings} {card.servings === 1 ? "serving" : "servings"}</p>
              <PlannedMealControls card={card} />
            </li>)}
          </ul>
        </td>)}</tr></tbody>
      </table>
      </div>
    </section>
  </div>;
}
