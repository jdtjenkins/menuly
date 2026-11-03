"use client";

import Link from "next/link";
import { useState } from "react";

type MealSummary = { id: string; name: string; servingYield: number };

export function MealList({ meals }: { meals: MealSummary[] }) {
  const [layout, setLayout] = useState<"list" | "grid">("list");

  return <div className="space-y-4">
    <div role="group" aria-label="Meal layout" className="page-actions">
      <button type="button" aria-pressed={layout === "list"} onClick={() => setLayout("list")}
        className={`btn btn-sm ${layout === "list" ? "btn-primary" : "btn-outline"}`}>List</button>
      <button type="button" aria-pressed={layout === "grid"} onClick={() => setLayout("grid")}
        className={`btn btn-sm ${layout === "grid" ? "btn-primary" : "btn-outline"}`}>Grid</button>
    </div>
    <ul aria-label="My meals" className={layout === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
      {meals.map((meal) => <li key={meal.id}>
        <Link href={`/meals/${encodeURIComponent(meal.id)}`}
          className="surface-row block h-full p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <span className="block text-base font-semibold text-base-content">{meal.name}</span>
          <span className="mt-1 block text-sm text-base-content/70">Makes {meal.servingYield} servings</span>
        </Link>
      </li>)}
    </ul>
  </div>;
}
