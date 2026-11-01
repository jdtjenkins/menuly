"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { RefObject } from "react";
import type { FoodChoice } from "../../lib/meals/repository";
import { searchMealFoodsAction } from "./actions";

export function FoodPicker({ initialChoices, onChoose, inputRef, replacingName }: {
  initialChoices: FoodChoice[];
  onChoose: (food: FoodChoice) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  replacingName?: string;
}) {
  const listId = useId();
  const requestId = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodChoice[]>([]);
  const [resolvedQuery, setResolvedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [, startSearch] = useTransition();
  const choices = query.trim() ? results : initialChoices;

  useEffect(() => {
    if (!query.trim()) return;
    const currentRequest = requestId.current;
    const timer = setTimeout(() => startSearch(async () => {
      try {
        const found = await searchMealFoodsAction(query);
        if (currentRequest === requestId.current) { setResults(found); setResolvedQuery(query); setActive(-1); }
      } catch {
        if (currentRequest === requestId.current) { setResults([]); setResolvedQuery(query); }
      }
    }), 180);
    return () => clearTimeout(timer);
  }, [query]);

  function choose(food: FoodChoice) {
    onChoose(food);
    requestId.current++;
    setQuery("");
    setResults([]);
    setResolvedQuery("");
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  return <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label htmlFor="meal-food-picker" className="block font-medium">{replacingName ? `Replace ${replacingName}` : "Find ingredient"}</label>
    <input id="meal-food-picker" ref={inputRef} type="text" role="combobox" aria-autocomplete="list"
      aria-expanded={open} aria-controls={listId} aria-activedescendant={open && active >= 0 && choices[active] ? `${listId}-${active}` : undefined}
      autoComplete="off" value={query} onFocus={() => setOpen(true)}
      onChange={(event) => { requestId.current++; setQuery(event.target.value); setResults([]); setResolvedQuery(""); setActive(-1); setOpen(true); }}
      onKeyDown={(event) => {
        if (event.key === "Escape") { setOpen(false); return; }
        if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActive((index) => Math.min(index + 1, choices.length - 1)); }
        if (event.key === "ArrowUp") { event.preventDefault(); setOpen(true); setActive((index) => Math.max(index - 1, 0)); }
        if (event.key === "Enter" && open && active >= 0 && choices[active]) { event.preventDefault(); choose(choices[active]); }
      }}
      placeholder="Start typing a food name" className="input input-bordered mt-1 w-full" />
    {open && <div id={listId} role="listbox" aria-label="Food suggestions" className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-lg">
      {query.trim() && resolvedQuery !== query && !choices.length ? <p role="status" className="p-3 text-sm">Searching foods…</p> : null}
      {(!query.trim() || resolvedQuery === query) && !choices.length ? <p role="status" className="p-3 text-sm">No matching foods.</p> : null}
      {choices.map((food, index) => <button key={`${food.source}:${food.id}`} id={`${listId}-${index}`} type="button" role="option" aria-selected={index === active} tabIndex={-1}
        onMouseDown={(event) => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(food)}
        className={`block w-full px-3 py-2 text-left text-sm hover:bg-base-200 ${index === active ? "bg-base-200" : ""}`}>
        {food.name} <span className="text-base-content/70">({food.source}, {food.unit})</span>
      </button>)}
    </div>}
  </div>;
}
