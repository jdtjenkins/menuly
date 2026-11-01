"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { PersonalFoodInput } from "../../../lib/food/personal-validation";
import type { PersonalFoodFormState } from "./actions";

const blank: PersonalFoodInput = { name: "", unit: "", referenceAmount: "", calories: "", protein: "", carbohydrates: "", fat: "" };

export function PersonalFoodForm({ action, initial, edit = false, cancelHref = "/food#personal-foods", submitLabel }: {
  action: (state: PersonalFoodFormState, formData: FormData) => Promise<PersonalFoodFormState>;
  initial?: PersonalFoodInput;
  edit?: boolean;
  cancelHref?: string;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { input: initial ?? blank, errors: {} });
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const field = (name: Exclude<keyof PersonalFoodInput, "unit">, label: string, required: boolean) => (
    <div className="space-y-1">
      <label htmlFor={name} className="block font-medium">{label}{required ? " *" : ""}</label>
      <input id={name} name={name} type="text" inputMode={name === "name" ? "text" : "decimal"}
        maxLength={name === "name" ? 100 : 24} defaultValue={state.input[name]}
        aria-invalid={Boolean(state.errors[name])} aria-describedby={state.errors[name] ? `${name}-error` : undefined}
        className="input input-bordered w-full" />
      {state.errors[name] && <p id={`${name}-error`} className="text-sm text-error">{state.errors[name]}</p>}
    </div>
  );

  return <form action={formAction} noValidate className="space-y-5" aria-label={edit ? "Edit personal food" : "Create personal food"}>
    {state.message && <p role="alert" className="text-error">{state.message}</p>}
    {field("name", "Name", true)}
    <div className="space-y-1">
      {edit ? <p className="font-medium">Unit</p> : <label htmlFor="unit" className="block font-medium">Unit *</label>}
      {edit ? <><p className="py-2">{unit === "ml" ? "ml" : "g"} (fixed)</p><input type="hidden" name="unit" value={unit} /></>
        : <select id="unit" name="unit" value={unit} onChange={(event) => setUnit(event.target.value)} aria-invalid={Boolean(state.errors.unit)}
          aria-describedby={state.errors.unit ? "unit-error" : undefined} className="select select-bordered w-full">
          <option value="">Choose a unit</option><option value="g">g</option><option value="ml">ml</option>
        </select>}
      {state.errors.unit && <p id="unit-error" className="text-sm text-error">{state.errors.unit}</p>}
    </div>
    <div className="grid gap-5 sm:grid-cols-2">
      {field("referenceAmount", "Reference amount", true)}
      {field("calories", "Calories (kcal)", true)}
      {field("protein", "Protein (g)", false)}
      {field("carbohydrates", "Carbohydrates (g)", false)}
      {field("fat", "Fat (g)", false)}
    </div>
    <p className="text-sm text-base-content/70">Nutrition values describe the reference amount. Leave optional values blank when unknown.</p>
    <div className="flex flex-wrap gap-3">
      <button type="submit" disabled={pending} className="btn btn-primary">{pending ? "Saving…" : submitLabel ?? (edit ? "Save changes" : "Create food")}</button>
      <Link href={cancelHref} className="btn btn-outline">Cancel</Link>
    </div>
  </form>;
}
