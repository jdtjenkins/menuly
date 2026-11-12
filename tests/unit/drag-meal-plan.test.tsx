import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ add: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("../../app/meal-plan/actions", () => ({ addPlannedMealAction: mocks.add }));
vi.mock("../../app/meal-plan/add-planned-meal", () => ({ AddPlannedMeal: ({ day }: { day: string }) => <input aria-label={`Add meal to ${day}`} /> }));
vi.mock("../../app/meal-plan/planned-meal-controls", () => ({ PlannedMealControls: () => <button>Remove card</button> }));

import { DragMealPlan } from "../../app/meal-plan/drag-meal-plan";

const meals = [{ id: "meal-one", name: "Dinner", servingYield: 4 }];
const cards = [{ id: "card-one", mealId: "meal-one", mealName: "Dinner", weekday: 0 as const, servings: 2 }];

function dragData(id = "meal-one") {
  const values = new Map<string, string>();
  return {
    types: ["application/x-menuly-meal"], effectAllowed: "", dropEffect: "",
    setData: (type: string, value: string) => values.set(type, value),
    getData: (type: string) => values.get(type) ?? id,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.add.mockResolvedValue({ errors: {}, success: true });
});
afterEach(cleanup);

test("a meal can be dropped twice on a day without moving an existing card", async () => {
  render(<DragMealPlan meals={meals} cards={cards} />);
  const source = screen.getByRole("list", { name: "Saved meals" }).getElementsByTagName("li")[0];
  const thursday = screen.getAllByRole("cell")[3];
  const monday = screen.getAllByRole("cell")[0];
  expect(source.draggable).toBe(true);
  expect(monday.getElementsByTagName("li")[0].draggable).toBe(false);
  for (let attempt = 0; attempt < 2; attempt++) {
    const data = dragData();
    fireEvent.dragStart(source, { dataTransfer: data });
    expect(thursday.className).toContain("outline");
    fireEvent.dragOver(thursday, { dataTransfer: data });
    expect(thursday.className).toContain("bg-primary/15");
    await act(async () => { fireEvent.drop(thursday, { dataTransfer: data }); await Promise.resolve(); });
  }
  expect(mocks.add).toHaveBeenCalledTimes(2);
  expect(mocks.refresh).toHaveBeenCalledTimes(2);
  for (const call of mocks.add.mock.calls) {
    const form = call[1] as FormData;
    expect([form.get("mealId"), form.get("weekday"), form.get("servings")]).toEqual(["meal-one", "3", "1"]);
  }
  expect(monday.textContent).toContain("Dinner");
});

test("invalid drops and cancellation create no card and clear feedback", async () => {
  render(<DragMealPlan meals={meals} cards={cards} />);
  const source = screen.getByRole("list", { name: "Saved meals" }).getElementsByTagName("li")[0];
  const friday = screen.getAllByRole("cell")[4];
  const data = dragData();
  fireEvent.dragStart(source, { dataTransfer: data });
  fireEvent.dragEnd(source, { dataTransfer: data });
  expect(friday.className).not.toContain("outline");
  const unrelated = { ...data, types: ["text/plain"] };
  fireEvent.drop(friday, { dataTransfer: unrelated });
  expect(mocks.add).not.toHaveBeenCalled();
  fireEvent.drop(friday, { dataTransfer: dragData("other-account-meal") });
  expect(screen.getByRole("alert").textContent).toContain("available meal");
  expect(mocks.add).not.toHaveBeenCalled();
});

test("a pending drop cannot submit twice and failure keeps existing cards", async () => {
  let reject: (error: Error) => void = () => {};
  mocks.add.mockImplementationOnce(() => new Promise((_, fail) => { reject = fail; }));
  render(<DragMealPlan meals={meals} cards={cards} />);
  const tuesday = screen.getAllByRole("cell")[1];
  const data = dragData();
  await act(async () => { fireEvent.drop(tuesday, { dataTransfer: data }); await Promise.resolve(); });
  expect(screen.getByRole("status").textContent).toContain("Adding meal to Tuesday");
  fireEvent.drop(tuesday, { dataTransfer: data });
  expect(mocks.add).toHaveBeenCalledTimes(1);
  await act(async () => { reject(new Error("offline")); await Promise.resolve(); });
  expect(screen.getByRole("alert").textContent).toContain("Could not add the meal");
  expect(screen.getAllByRole("cell")[0].textContent).toContain("Dinner");
  await act(async () => { fireEvent.drop(tuesday, { dataTransfer: data }); await Promise.resolve(); });
  expect(mocks.add).toHaveBeenCalledTimes(2);
});
