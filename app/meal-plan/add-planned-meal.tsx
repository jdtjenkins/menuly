"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { MealChoice } from "../../lib/plan/repository";
import type { Weekday } from "../../lib/plan/validation";
import { addPlannedMealAction, searchPlanMealsAction } from "./actions";

export function AddPlannedMeal({ weekday, day }: { weekday: Weekday; day: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MealChoice[]>([]);
  const [resolvedQuery, setResolvedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const inputId = useId();
  const [, startSearch] = useTransition();
  const [adding, startAdd] = useTransition();

  useEffect(() => {
    if (!query.trim()) return;
    const current = requestId.current;
    const timer = setTimeout(() => startSearch(async () => {
      try {
        const found = await searchPlanMealsAction(query);
        if (requestId.current === current) { setResults(found); setResolvedQuery(query); setActive(-1); }
      } catch {
        if (requestId.current === current) { setResults([]); setResolvedQuery(query); setError("Could not search meals. Try again."); }
      }
    }), 180);
    return () => clearTimeout(timer);
  }, [query]);

  function choose(meal: MealChoice) {
    if (adding) return;
    setOpen(false);
    setError("");
    startAdd(async () => {
      try {
        const formData = new FormData();
        formData.set("mealId", meal.id);
        formData.set("weekday", String(weekday));
        formData.set("servings", "1");
        const result = await addPlannedMealAction({ errors: {} }, formData);
        if (!result.success) {
          setError(result.message ?? result.errors.weekday ?? result.errors.servings ?? "Could not add the meal.");
          return;
        }
        requestId.current++;
        setQuery("");
        setResults([]);
        setResolvedQuery("");
        setActive(-1);
        inputRef.current?.focus();
      } catch {
        setError("Could not add the meal. Try again.");
      }
    });
  }

  return <div role="group" aria-label={`Add meal to ${day}`}>
    <label htmlFor={inputId} className="sr-only">Add meal to {day}</label>
    <div onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <input id={inputId} ref={inputRef} role="combobox" aria-autocomplete="list" aria-expanded={open && Boolean(query.trim())}
        aria-controls={listId} aria-activedescendant={open && active >= 0 && results[active] ? `${listId}-${active}` : undefined}
        autoComplete="off" value={query} onFocus={() => setOpen(true)}
        onChange={(event) => { requestId.current++; setQuery(event.target.value); setResults([]); setResolvedQuery(""); setActive(-1); setError(""); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === "Escape") { setOpen(false); return; }
          if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive((index) => Math.min(index + 1, results.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((index) => Math.max(index - 1, 0)); }
          if (event.key === "Enter") {
            event.preventDefault();
            if (open && active >= 0 && results[active]) choose(results[active]);
          }
        }}
        placeholder="Find a saved meal" className="input input-bordered w-full" />
      {open && query.trim() && <div id={listId} role="listbox" aria-label={`${day} meal suggestions`} className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-base-300 bg-base-100">
        {resolvedQuery !== query ? <p role="status" className="p-2 text-sm">Searching meals…</p> :
          results.length === 0 ? <p role="status" className="p-2 text-sm">No matching meals.</p> :
            results.map((meal, index) => <button key={meal.id} id={`${listId}-${index}`} type="button" role="option" aria-selected={index === active} tabIndex={-1} disabled={adding}
              onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(meal)}
              className={`block w-full px-2 py-2 text-left text-sm hover:bg-base-200 ${index === active ? "bg-base-200" : ""}`}>
              {meal.name} <span className="text-base-content/70">(makes {meal.servingYield} servings)</span>
            </button>)}
      </div>}
    </div>
    {adding && <p role="status" className="mt-2 text-sm">Adding meal…</p>}
    {error && <p role="alert" className="mt-2 text-sm text-error">{error}</p>}
  </div>;
}
