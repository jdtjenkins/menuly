import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ save: vi.fn(), clear: vi.fn(), revalidate: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("../../lib/plan/server", () => ({
  addCurrentPlannedMeal: vi.fn(), clearCurrentWeek: mocks.clear, removeCurrentPlannedMeal: vi.fn(), searchCurrentPlanMeals: vi.fn(), updateCurrentPlannedMeal: vi.fn(),
}));
vi.mock("../../lib/shopping/server", () => ({ setCurrentShoppingChecked: mocks.save }));

import { clearWeekAction, setShoppingCheckedAction } from "../../app/meal-plan/actions";

beforeEach(() => vi.resetAllMocks());

test("successful checklist change refreshes Meal Plan", async () => {
  mocks.save.mockResolvedValue(true);
  expect(await setShoppingCheckedAction("global", "food", true)).toBe(true);
  expect(mocks.save).toHaveBeenCalledWith("global", "food", true);
  expect(mocks.revalidate).toHaveBeenCalledWith("/meal-plan");
});

test("stale checklist item is rejected without refreshing Meal Plan", async () => {
  mocks.save.mockResolvedValue(false);
  expect(await setShoppingCheckedAction("global", "gone", true)).toBe(false);
  expect(mocks.revalidate).not.toHaveBeenCalled();
});

test("successful Clear Week refreshes Meal Plan and failure does not", async () => {
  mocks.clear.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("database unavailable"));
  expect(await clearWeekAction()).toBe(true);
  expect(mocks.revalidate).toHaveBeenCalledWith("/meal-plan");
  mocks.revalidate.mockClear();
  expect(await clearWeekAction()).toBe(false);
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
