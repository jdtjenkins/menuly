import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ update: vi.fn(), revalidate: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("../../lib/plan/server", () => ({
  addCurrentPlannedMeal: vi.fn(),
  removeCurrentPlannedMeal: vi.fn(),
  searchCurrentPlanMeals: vi.fn(),
  updateCurrentPlannedMeal: mocks.update,
}));

import { updatePlannedMealAction } from "../../app/meal-plan/actions";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.update.mockResolvedValue({ ok: true, id: "card" });
});

test("planned-card update accepts servings without moving the day", async () => {
  const form = new FormData();
  form.set("weekday", "4");
  form.set("servings", "0.5");
  expect(await updatePlannedMealAction("card", { errors: {} }, form)).toEqual({ errors: {}, success: true });
  expect(mocks.update).toHaveBeenCalledWith("card", { servings: "0.5" });
  expect(mocks.revalidate).toHaveBeenCalledWith("/meal-plan");
});

test("planned-card update preserves serving errors", async () => {
  mocks.update.mockResolvedValue({ ok: false, errors: { servings: "Enter a positive serving quantity." } });
  const form = new FormData();
  form.set("servings", "0");
  expect(await updatePlannedMealAction("card", { errors: {} }, form)).toEqual({
    errors: { servings: "Enter a positive serving quantity." },
  });
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
