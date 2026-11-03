import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { PlannedMeal } from "../../lib/plan/repository";

const mocks = vi.hoisted(() => ({ update: vi.fn(), remove: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("../../app/meal-plan/actions", () => ({ updatePlannedMealAction: mocks.update, removePlannedMealAction: mocks.remove }));

import { PlannedMealControls } from "../../app/meal-plan/planned-meal-controls";

const card: PlannedMeal = { id: "card", mealId: "meal", mealName: "Dinner", weekday: 0, servings: 1 };
const saved = { errors: {}, success: true };
const lastInput = () => mocks.update.mock.lastCall?.[2] as FormData;

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  mocks.update.mockResolvedValue(saved);
});
afterEach(() => { cleanup(); vi.useRealTimers(); });

async function tick(milliseconds = 350) {
  await act(async () => { vi.advanceTimersByTime(milliseconds); await Promise.resolve(); });
}

test("servings save after a pause without a Save card button", async () => {
  render(<PlannedMealControls card={card} />);
  expect(screen.queryByRole("button", { name: "Save card" })).toBeNull();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Servings" }), { target: { value: "0.5" } });
  expect(mocks.update).not.toHaveBeenCalled();
  await tick();
  expect(lastInput().get("servings")).toBe("0.5");
  expect(lastInput().get("weekday")).toBeNull();
  expect(screen.getByText("Saved")).toBeTruthy();
  expect(mocks.refresh).toHaveBeenCalledOnce();
});

test("card controls do not offer a day move", () => {
  render(<PlannedMealControls card={card} />);
  expect(screen.queryByRole("combobox", { name: "Day" })).toBeNull();
  expect(screen.getByRole("spinbutton", { name: "Servings" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Remove Dinner from Monday" })).toBeTruthy();
});

test("invalid servings show an error without a write", async () => {
  render(<PlannedMealControls card={card} />);
  const input = screen.getByRole("spinbutton", { name: "Servings" });
  fireEvent.change(input, { target: { value: "0" } });
  await tick();
  expect(screen.getByRole("alert").textContent).toContain("positive serving quantity");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(mocks.update).not.toHaveBeenCalled();
});

test("rapid serving edits keep the latest value", async () => {
  let resolveFirst: (value: typeof saved) => void = () => {};
  mocks.update.mockImplementationOnce(() => new Promise<typeof saved>((resolve) => { resolveFirst = resolve; })).mockResolvedValueOnce(saved);
  render(<PlannedMealControls card={card} />);
  const servings = screen.getByRole("spinbutton", { name: "Servings" });
  fireEvent.change(servings, { target: { value: "2" } });
  await tick();
  expect(mocks.update).toHaveBeenCalledTimes(1);
  fireEvent.change(servings, { target: { value: "3" } });
  await tick();
  expect(mocks.update).toHaveBeenCalledTimes(1);
  await act(async () => { resolveFirst(saved); await Promise.resolve(); });
  expect(mocks.update).toHaveBeenCalledTimes(2);
  expect(lastInput().get("servings")).toBe("3");
  expect(lastInput().get("weekday")).toBeNull();
  expect(mocks.refresh).toHaveBeenCalledOnce();
});

test("failed save retains the draft and blur retries it", async () => {
  mocks.update.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(saved);
  render(<PlannedMealControls card={card} />);
  const input = screen.getByRole("spinbutton", { name: "Servings" }) as HTMLInputElement;
  fireEvent.change(input, { target: { value: "1.5" } });
  await tick();
  expect(screen.getByRole("alert").textContent).toContain("Could not save this card");
  expect(input.value).toBe("1.5");
  await act(async () => { fireEvent.blur(input); await Promise.resolve(); });
  expect(mocks.update).toHaveBeenCalledTimes(2);
  expect(lastInput().get("servings")).toBe("1.5");
  expect(screen.getByText("Saved")).toBeTruthy();
});
