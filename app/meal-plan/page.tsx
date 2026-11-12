import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getCurrentAccount } from "../../lib/auth/current-account";
import { listCurrentMeals } from "../../lib/meals/server";
import { listCurrentPlannedMeals } from "../../lib/plan/server";
import { listCurrentShoppingItems } from "../../lib/shopping/server";
import { ShoppingList } from "./shopping-list";
import { ClearWeekControl } from "./clear-week-control";
import { DragMealPlan } from "./drag-meal-plan";

export default function MealPlanPage() {
  return <Suspense fallback={<p>Loading meal plan…</p>}><MealPlanContent /></Suspense>;
}

async function MealPlanContent() {
  await connection();
  const account = await getCurrentAccount();
  if (!account) return <section><h1 className="page-heading">Meal Plan</h1><p className="page-lead">Sign in with Google in the navigation to plan your private meals.</p></section>;
  const [cards, shoppingItems, meals] = await Promise.all([listCurrentPlannedMeals(), listCurrentShoppingItems(), listCurrentMeals()]);
  return <div className="weekly-plan-page min-w-0 space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="page-heading">Meal Plan</h1><p className="page-lead">Your reusable Monday-to-Sunday plan.</p></div><ClearWeekControl /></div>
    {cards.length === 0 && <p className="text-sm text-base-content/75">Your plan is empty. <Link href="/meals/new" className="link link-primary">Create a meal</Link> or add one below.</p>}
    <ShoppingList items={shoppingItems} />
    <DragMealPlan meals={meals} cards={cards} />
  </div>;
}
