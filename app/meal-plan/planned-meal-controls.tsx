"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PlannedMeal } from "../../lib/plan/repository";
import { validatePlanServingInput, weekdays } from "../../lib/plan/validation";
import { removePlannedMealAction, updatePlannedMealAction } from "./actions";

export function PlannedMealControls({ card }: { card: PlannedMeal }) {
  const router = useRouter();
  const initial = String(card.servings);
  const [draft, setDraft] = useState(initial);
  const draftRef = useRef(initial);
  const savedRef = useRef(initial);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [fieldError, setFieldError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [removing, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState("");
  const servingsId = `servings-${card.id}`;

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function cancelTimer() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function candidate(): string | null {
    const current = draftRef.current;
    return validatePlanServingInput({ servings: current }).ok ? current : null;
  }

  async function saveLatest() {
    if (savingRef.current) return;
    const input = candidate();
    if (!input || input === savedRef.current) return;
    savingRef.current = true;
    setStatus("saving");
    setSaveError("");
    let succeeded = false;
    try {
      const formData = new FormData();
      formData.set("servings", input);
      const result = await updatePlannedMealAction(card.id, { errors: {} }, formData);
      if (!result.success) {
        setStatus("idle");
        setSaveError(result.message ?? result.errors.servings ?? "Could not save this card. Try again.");
        return;
      }
      savedRef.current = input;
      succeeded = true;
    } catch {
      setStatus("idle");
      setSaveError("Could not save this card. Try again.");
    } finally {
      savingRef.current = false;
      if (succeeded) {
        const latest = candidate();
        if (latest && latest !== savedRef.current) void saveLatest();
        else { setStatus("saved"); router.refresh(); }
      }
    }
  }

  function changeServings(servings: string) {
    cancelTimer();
    draftRef.current = servings;
    setDraft(servings);
    setSaveError("");
    const parsed = validatePlanServingInput({ servings });
    if (!parsed.ok) {
      setFieldError(parsed.errors.servings ?? "");
      setStatus("idle");
      return;
    }
    setFieldError("");
    setStatus("idle");
    timerRef.current = setTimeout(() => { timerRef.current = null; void saveLatest(); }, 300);
  }

  return <div className="mt-3 space-y-2" role="group" aria-label={`Edit planned ${card.mealName}`}>
    <div className="flex flex-wrap items-end gap-2">
      <div><label htmlFor={servingsId} className="block text-sm">Servings</label><input id={servingsId} type="number" min="0" step="any" value={draft} onChange={(event) => changeServings(event.target.value)}
        onBlur={() => { cancelTimer(); void saveLatest(); }} aria-invalid={Boolean(fieldError)} className="input input-bordered input-sm mt-1 w-24" /></div>
    </div>
    {fieldError && <p role="alert" className="text-sm text-error">{fieldError}</p>}
    {saveError && <p role="alert" className="text-sm text-error">{saveError}</p>}
    {status === "saving" && <p role="status" className="text-sm text-base-content/70">Saving…</p>}
    {status === "saved" && <p role="status" className="text-sm text-base-content/70">Saved</p>}
    {removeError && <p role="alert" className="text-sm text-error">{removeError}</p>}
    <button type="button" disabled={removing || status === "saving"} className="btn btn-outline btn-error btn-sm" aria-label={`Remove ${card.mealName} from ${weekdays[card.weekday]}`} onClick={() => startRemove(async () => {
      const result = await removePlannedMealAction(card.id);
      if (!result.ok) setRemoveError("Planned meal is no longer available.");
    })}>{removing ? "Removing…" : "Remove"}</button>
  </div>;
}
