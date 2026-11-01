"use client";

import { useState } from "react";
import { nutrientNames, servingNutrition, type NutritionTotals, type NutrientName } from "../../lib/meals/nutrition";

const labels: Record<NutrientName, string> = { calories: "Calories", protein: "Protein", carbohydrates: "Carbohydrates", fat: "Fat" };
const units: Record<NutrientName, string> = { calories: "kcal", protein: "g", carbohydrates: "g", fat: "g" };
function format(value: number) { return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value); }

function Totals({ totals }: { totals: NutritionTotals }) {
  return <dl className="grid gap-3 sm:grid-cols-2">{nutrientNames.map((name) => <div key={name} className="rounded-lg border border-base-300 p-3"><dt>{labels[name]}</dt><dd className="font-semibold">{totals[name].complete ? format(totals[name].value) : `At least ${format(totals[name].value)}`} {units[name]}{!totals[name].complete && <span className="ml-1 text-warning">(incomplete)</span>}</dd>{!totals[name].complete && <p className="text-sm">Missing {labels[name].toLowerCase()} for {totals[name].missingFoods.join(", ")}.</p>}</div>)}</dl>;
}

export function MealNutrition({ whole, servingYield }: { whole: NutritionTotals; servingYield: number }) {
  const defaultServings = String(servingYield);
  const [raw, setRaw] = useState(defaultServings);
  const selected = Number(raw);
  const valid = raw.trim() !== "" && Number.isFinite(selected) && selected > 0;
  let totals: NutritionTotals | null = null;
  if (valid) try { totals = servingNutrition(whole, servingYield, selected); } catch { totals = null; }
  return <section className="space-y-5 rounded-xl border border-base-300 bg-base-100 p-6" aria-labelledby="selected-servings-title">
    <h2 id="selected-servings-title" className="text-xl font-semibold">Selected servings</h2>
    <div><label htmlFor="selected-servings" className="sr-only">Selected servings</label><div className="flex items-center gap-2">
      <input id="selected-servings" type="number" min="0" step="any" value={raw} onChange={(event) => setRaw(event.target.value)} aria-invalid={!totals} className="input input-bordered w-40" />
      {raw !== defaultServings && <button type="button" aria-label="Reset servings" title="Reset servings" className="btn btn-ghost btn-sm" onClick={() => setRaw(defaultServings)}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><path d="M3 12a9 9 0 1 0 2.6-6.4" /><path d="M3 4v5h5" /></svg>
      </button>}
    </div>{!totals && <p role="alert" className="mt-2 text-sm text-error">Enter a positive serving quantity.</p>}</div>
    {totals && <Totals totals={totals} />}
  </section>;
}
