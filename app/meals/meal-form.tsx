"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import type { FoodChoice, MealLine } from "../../lib/meals/repository";
import { saveMealAction } from "./actions";
import { FoodPicker } from "./food-picker";

type EditableLine = { key: string; lineId?: string; source: "global" | "personal"; foodId: string; amount: string; name: string; unit: "g" | "ml"; archived?: boolean };

export function MealForm({ id, initial, initialChoices }: { id?: string; initial?: { name: string; servingYield: string; lines: MealLine[] }; initialChoices: FoodChoice[] }) {
  const [state, action, pending] = useActionState(saveMealAction.bind(null, id ?? null), { errors: {} });
  const [name, setName] = useState(initial?.name ?? "");
  const [servingYield, setServingYield] = useState(initial?.servingYield ?? "");
  const [lines, setLines] = useState<EditableLine[]>(initial?.lines.map((line) => ({ key: line.id, lineId: line.id, source: line.source, foodId: line.foodId, amount: String(line.amount), name: line.name, unit: line.unit, archived: line.archived })) ?? []);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const replace = (index: number, update: Partial<EditableLine>) => setLines((current) => current.map((line, position) => position === index ? { ...line, ...update } : line));

  function choose(food: FoodChoice) {
    if (replacingIndex === null) {
      setLines((current) => [...current, { key: crypto.randomUUID(), source: food.source, foodId: food.id, amount: "", name: food.name, unit: food.unit }]);
    } else {
      replace(replacingIndex, { source: food.source, foodId: food.id, name: food.name, unit: food.unit, archived: false });
      setReplacingIndex(null);
    }
  }

  return <form action={action} noValidate aria-label={id ? "Edit meal" : "Create meal"} className="space-y-6 rounded-xl border border-base-300 bg-base-100 p-6">
    {state.message && <p role="alert" className="text-error">{state.message}</p>}
    <div><label htmlFor="meal-name" className="block font-medium">Meal name *</label><input id="meal-name" name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className="input input-bordered mt-1 w-full" aria-invalid={Boolean(state.errors.name)} />{state.errors.name && <p className="text-sm text-error">{state.errors.name}</p>}</div>
    <div><label htmlFor="serving-yield" className="block font-medium">Recipe yield (servings) *</label><input id="serving-yield" name="servingYield" type="number" min="0" step="any" value={servingYield} onChange={(event) => setServingYield(event.target.value)} className="input input-bordered mt-1 w-full" aria-invalid={Boolean(state.errors.servingYield)} />{state.errors.servingYield && <p className="text-sm text-error">{state.errors.servingYield}</p>}</div>
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Ingredients</h2>
      <p className="text-sm text-base-content/70">Choose a suggestion to add a food. Amounts use each food’s fixed unit.</p>
      <FoodPicker initialChoices={initialChoices} onChoose={choose} inputRef={pickerRef} replacingName={replacingIndex === null ? undefined : lines[replacingIndex]?.name} />
      {replacingIndex !== null && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReplacingIndex(null)}>Cancel replacement</button>}
      {state.errors.lines && <p className="text-sm text-error">{state.errors.lines}</p>}
      {lines.length ? <div role="region" aria-label="Ingredient table" tabIndex={0} className="overflow-x-auto rounded-lg border border-base-300">
        <table aria-label="Meal ingredients" className="table min-w-[36rem]">
          <thead><tr><th scope="col">Food</th><th scope="col">Amount</th><th scope="col">Unit</th><th scope="col">Actions</th></tr></thead>
          <tbody>{lines.map((line, index) => <tr key={line.key}>
            <td className="min-w-40"><span className="font-medium">{line.name}</span><span className="block text-xs text-base-content/70">{line.source}{line.archived ? " · archived" : ""}</span></td>
            <td><input id={`ingredient-amount-${index}`} type="number" min="0" step="any" value={line.amount} onChange={(event) => replace(index, { amount: event.target.value })}
              aria-label={`Amount for ${line.name}`} aria-invalid={Boolean(state.errors.lineErrors?.[index])} aria-describedby={state.errors.lineErrors?.[index] ? `ingredient-error-${index}` : undefined}
              className="input input-bordered w-28" />{state.errors.lineErrors?.[index] && <p id={`ingredient-error-${index}`} className="text-sm text-error">{state.errors.lineErrors[index]}</p>}</td>
            <td>{line.unit}</td>
            <td><div className="flex gap-2"><button type="button" className="btn btn-outline btn-sm" aria-label={`Replace ${line.name}`} onClick={() => { setReplacingIndex(index); pickerRef.current?.focus(); }}>Replace</button>
              <button type="button" className="btn btn-outline btn-sm" aria-label={`Remove ${line.name}`} onClick={() => { setLines((current) => current.filter((_, position) => position !== index)); setReplacingIndex(null); }}>Remove</button></div></td>
          </tr>)}</tbody>
        </table>
      </div> : <p className="text-sm text-base-content/70">No ingredients selected yet.</p>}
    </div>
    <input type="hidden" name="lines" value={JSON.stringify(lines.map(({ lineId, source, foodId, amount }) => ({ lineId, source, foodId, amount })))} />
    <div className="flex gap-3"><button type="submit" disabled={pending} className="btn btn-primary">{pending ? "Saving…" : id ? "Save meal" : "Create meal"}</button><Link href={id ? `/meals/${encodeURIComponent(id)}` : "/meals"} className="btn btn-outline">Cancel</Link></div>
  </form>;
}
