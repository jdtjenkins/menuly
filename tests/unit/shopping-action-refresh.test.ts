import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidate: vi.fn(), redirect: vi.fn(), notFound: vi.fn(), saveMeal: vi.fn(),
  updateFood: vi.fn(), archiveFood: vi.fn(), readFoodInput: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect, notFound: mocks.notFound }));
vi.mock("../../lib/meals/server", () => ({ saveCurrentMeal: mocks.saveMeal, searchCurrentMealFoodChoices: vi.fn() }));
vi.mock("../../lib/food/clone-server", () => ({ createCurrentGlobalClone: vi.fn() }));
vi.mock("../../lib/food/personal-server", () => ({
  createCurrentPersonalFood: vi.fn(), updateCurrentPersonalFood: mocks.updateFood,
  archiveCurrentPersonalFoodWithAcknowledgement: mocks.archiveFood, getCurrentArchiveImpact: vi.fn(),
}));
vi.mock("../../lib/food/personal-validation", () => ({ personalFoodInput: mocks.readFoodInput }));

import { saveMealAction } from "../../app/meals/actions";
import { archivePersonalFoodAction, updatePersonalFoodAction } from "../../app/food/personal/actions";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.readFoodInput.mockReturnValue({ name: "Oats" });
});

test("successful meal save refreshes Meal Plan before redirect", async () => {
  mocks.saveMeal.mockResolvedValue({ ok: true, id: "meal" });
  await saveMealAction("meal", { errors: {} }, new FormData());
  expect(mocks.revalidate).toHaveBeenCalledWith("/meal-plan");
  expect(mocks.redirect).toHaveBeenCalledWith("/meals/meal");
});

test("successful personal-food edit and archive refresh Meal Plan", async () => {
  mocks.updateFood.mockResolvedValue({ ok: true, id: "food" });
  await updatePersonalFoodAction("food", { input: { name: "Oats" }, errors: {} } as never, new FormData());
  expect(mocks.revalidate).toHaveBeenCalledWith("/meal-plan");
  mocks.revalidate.mockClear();
  mocks.archiveFood.mockResolvedValue({ status: "archived" });
  await archivePersonalFoodAction("food", []);
  expect(mocks.revalidate).toHaveBeenCalledWith("/meal-plan");
});

test("failed writes do not invalidate Meal Plan", async () => {
  mocks.saveMeal.mockResolvedValue({ ok: false, errors: { name: "Required" } });
  await saveMealAction("meal", { errors: {} }, new FormData());
  mocks.updateFood.mockResolvedValue({ ok: false, errors: { name: "Required" } });
  await updatePersonalFoodAction("food", { input: { name: "Oats" }, errors: {} } as never, new FormData());
  mocks.archiveFood.mockResolvedValue({ status: "stale" });
  await archivePersonalFoodAction("food", []);
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
