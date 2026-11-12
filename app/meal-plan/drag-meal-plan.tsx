"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type DragEvent } from "react";
import type { PlannedMeal, MealChoice } from "../../lib/plan/repository";
import { weekdays, type Weekday } from "../../lib/plan/validation";
import { addPlannedMealAction } from "./actions";
import { AddPlannedMeal } from "./add-planned-meal";
import { PlannedMealControls } from "./planned-meal-controls";

const mealDragType = "application/x-menuly-meal";

export function DragMealPlan({ meals, cards }: { meals: MealChoice[]; cards: PlannedMeal[] }) {
  const [dragging, setDragging] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<Weekday | null>(null);
  const [pendingDay, setPendingDay] = useState<Weekday | null>(null);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const [, startAdd] = useTransition();
  const router = useRouter();

  function startDrag(event: DragEvent<HTMLLIElement>, mealId: string) {
    if (pending.current) { event.preventDefault(); return; }
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(mealDragType, mealId);
    setError("");
    setDragging(true);
  }

  function clearDrag() {
    setDragging(false);
    setHoveredDay(null);
  }

  function acceptsMeal(event: DragEvent<HTMLTableCellElement>) {
    return !pending.current && event.dataTransfer.types.includes(mealDragType);
  }

  function dragOverDay(event: DragEvent<HTMLTableCellElement>, weekday: Weekday) {
    if (!acceptsMeal(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setHoveredDay(weekday);
  }

  function dropOnDay(event: DragEvent<HTMLTableCellElement>, weekday: Weekday) {
    if (!acceptsMeal(event)) return;
    event.preventDefault();
    const mealId = event.dataTransfer.getData(mealDragType);
    clearDrag();
    if (!meals.some((meal) => meal.id === mealId)) {
      setError("Choose an available meal and try again.");
      return;
    }
    pending.current = true;
    setPendingDay(weekday);
    setError("");
    startAdd(async () => {
      try {
        const data = new FormData();
        data.set("mealId", mealId);
        data.set("weekday", String(weekday));
        data.set("servings", "1");
        const result = await addPlannedMealAction({ errors: {} }, data);
        if (!result.success) setError(result.message ?? result.errors.weekday ?? result.errors.servings ?? "Could not add the meal. Try again.");
        else router.refresh();
      } catch {
        setError("Could not add the meal. Try again.");
      } finally {
        pending.current = false;
        setPendingDay(null);
      }
    });
  }

  return <div className="weekly-plan-planner min-w-0">
    <aside aria-label="Saved meals for planning" className="surface-panel min-w-0 self-start p-4">
      <h2 className="text-base font-semibold">Saved meals</h2>
      <p className="mt-1 text-sm text-base-content/70">Drag a meal onto a day, or use a day&apos;s search.</p>
      {meals.length === 0 ? <p className="mt-4 text-sm">No saved meals yet. <Link href="/meals/new" className="link link-primary">Create a meal</Link> to start planning.</p> :
        <ul aria-label="Saved meals" className="mt-4 space-y-2">
          {meals.map((meal) => <li key={meal.id} draggable={pendingDay === null} onDragStart={(event) => startDrag(event, meal.id)} onDragEnd={clearDrag}
            className="surface-row cursor-grab p-3 active:cursor-grabbing">
            <span className="block font-medium">{meal.name}</span>
            <span className="text-sm text-base-content/70">Makes {meal.servingYield} servings</span>
          </li>)}
        </ul>}
    </aside>
    <section aria-label="Weekly plan board" className="weekly-plan-board min-w-0">
      {error && <p role="alert" className="mb-3 text-sm text-error">{error}</p>}
      {pendingDay !== null && <p role="status" className="mb-3 text-sm">Adding meal to {weekdays[pendingDay]}…</p>}
      <p id="weekly-plan-scroll-hint" className="mb-3 flex justify-end text-sm font-medium sm:hidden">
        <span className="rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-base-content/80">Scroll to see more days <span aria-hidden="true" className="text-primary">→</span></span>
      </p>
      <div role="region" aria-label="Weekly plan table" aria-describedby="weekly-plan-scroll-hint" tabIndex={0} className="weekly-plan-region w-full max-w-full overflow-x-auto focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <table aria-label="Weekly meal plan" className="weekly-plan-table table w-full min-w-[67rem] table-fixed border-separate border-spacing-x-1 border-spacing-y-0">
          <thead><tr className="border-b-0">{weekdays.map((day, weekday) => <th key={day} id={`plan-day-${weekday}`} scope="col" className="w-[9.5rem] rounded-t-lg border-x border-t border-b-0 border-base-300 bg-base-100 px-2 py-3 text-sm font-semibold text-base-content">{day}</th>)}</tr></thead>
          <tbody><tr>{weekdays.map((day, weekday) => <td key={day} headers={`plan-day-${weekday}`} onDragOverCapture={(event) => dragOverDay(event, weekday as Weekday)}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHoveredDay(null); }}
            onDropCapture={(event) => dropOnDay(event, weekday as Weekday)}
            className={`w-[9.5rem] rounded-b-lg border-x border-b border-base-300 bg-base-100 px-2 pb-4 align-top ${dragging ? "outline outline-2 outline-primary/50" : ""} ${hoveredDay === weekday ? "bg-primary/15 outline-primary" : ""}`}>
            <AddPlannedMeal weekday={weekday as Weekday} day={day} />
            <ul className="mt-3 space-y-3" aria-label={`${day} meals`}>
              {cards.filter((card) => card.weekday === weekday).map((card) => <li key={card.id} className="surface-row p-3">
                <Link href={`/meals/${encodeURIComponent(card.mealId)}`} draggable={false} className="font-semibold link link-hover">{card.mealName}</Link>
                <p className="text-sm text-base-content/70">{card.servings} {card.servings === 1 ? "serving" : "servings"}</p>
                <PlannedMealControls card={card} />
              </li>)}
            </ul>
          </td>)}</tr></tbody>
        </table>
      </div>
    </section>
  </div>;
}
