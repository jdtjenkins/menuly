import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { getCurrentAccount } from "../../lib/auth/current-account";
import { listCurrentMeals } from "../../lib/meals/server";
import { MealList } from "./meal-list";

export default function MealsPage() { return <Suspense fallback={<p>Loading meals…</p>}><MealsContent /></Suspense>; }

async function MealsContent() {
  await connection();
  const account = await getCurrentAccount();
  if (!account) return <section><h1 className="page-heading">Meals</h1><p className="page-lead">Sign in with Google in the navigation to make private meals.</p></section>;
  const meals = await listCurrentMeals();
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="page-heading">Meals</h1><p className="page-lead">Ingredient-only recipes, private to you.</p></div><Link href="/meals/new" className="btn btn-primary">Create meal</Link></div>
    {meals.length ? <MealList meals={meals} /> : <p className="surface-panel p-6">No meals yet. Create one to get started.</p>}
  </div>;
}
