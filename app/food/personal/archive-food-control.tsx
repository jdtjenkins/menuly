"use client";

import { useState, useTransition } from "react";
import type { AffectedMeal } from "../../../lib/meals/archive-impact";
import { archivePersonalFoodAction, getArchiveImpactAction } from "./actions";

export function ArchiveFoodControl({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [meals, setMeals] = useState<AffectedMeal[]>([]);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState("");
  if (!confirming) return <div><button type="button" className="btn btn-outline btn-sm" disabled={loading} onClick={() => startTransition(async () => {
    const impact = await getArchiveImpactAction(id);
    if (impact === null) { setError("Food is no longer available."); return; }
    setMeals(impact); setConfirming(true); setError("");
  })} aria-label={`Archive ${name}`}>{loading ? "Loading…" : "Archive food"}</button>{error && <p role="alert" className="text-sm text-error">{error}</p>}</div>;
  return <div role="group" aria-label={`Archive ${name}`} className="flex flex-wrap items-center gap-2">
    <p className="w-full text-sm">Archive {name}? It will be removed from My foods.</p>
    {meals.length > 0 && <div className="w-full text-sm"><p>These meals use this food and will keep it after archiving:</p><ul className="list-disc pl-5">{meals.map((meal) => <li key={meal.id}>{meal.name}</li>)}</ul></div>}
    {error && <p role="alert" className="w-full text-sm text-error">{error}</p>}
    <button type="button" disabled={loading} className="btn btn-error btn-sm" onClick={() => startTransition(async () => {
      const result = await archivePersonalFoodAction(id, meals);
      if (result?.status === "stale") { setMeals(result.meals); setError("Meal usage changed. Review the updated list and confirm again."); }
    })}>Confirm archive</button>
    <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
  </div>;
}
