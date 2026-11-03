import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireAccount: vi.fn(), getDatabaseClient: vi.fn(), list: vi.fn(), search: vi.fn(), add: vi.fn(), update: vi.fn(), remove: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("../../lib/auth/current-account", () => ({ requireAccount: mocks.requireAccount }));
vi.mock("../../lib/db/server", () => ({ getDatabaseClient: mocks.getDatabaseClient }));
vi.mock("../../lib/plan/repository", () => ({ listPlannedMeals: mocks.list, searchPlanMeals: mocks.search, addPlannedMeal: mocks.add, updatePlannedMeal: mocks.update, removePlannedMeal: mocks.remove }));

import { addCurrentPlannedMeal, listCurrentPlannedMeals, removeCurrentPlannedMeal, searchCurrentPlanMeals, updateCurrentPlannedMeal } from "../../lib/plan/server";

const input = { weekday: "2", servings: "1.5" };
beforeEach(() => { vi.resetAllMocks(); mocks.getDatabaseClient.mockReturnValue({}); });

test("anonymous plan operations do not reach the database", async () => {
  mocks.requireAccount.mockRejectedValue(new Error("Authentication required"));
  await expect(listCurrentPlannedMeals()).rejects.toThrow("Authentication required");
  await expect(searchCurrentPlanMeals("Dinner")).rejects.toThrow("Authentication required");
  await expect(addCurrentPlannedMeal("meal", input)).rejects.toThrow("Authentication required");
  await expect(updateCurrentPlannedMeal("card", { servings: input.servings })).rejects.toThrow("Authentication required");
  await expect(removeCurrentPlannedMeal("card")).rejects.toThrow("Authentication required");
  expect(mocks.getDatabaseClient).not.toHaveBeenCalled();
});

test("plan operations scope reads and writes to the current owner", async () => {
  mocks.requireAccount.mockResolvedValue({ id: "owner" });
  mocks.add.mockResolvedValue({ ok: false, notFound: true });
  mocks.update.mockResolvedValue({ ok: false, notFound: true });
  mocks.remove.mockResolvedValue(false);
  await listCurrentPlannedMeals();
  await searchCurrentPlanMeals("Dinner");
  expect(await addCurrentPlannedMeal("foreign", input)).toEqual({ ok: false, notFound: true });
  expect(await updateCurrentPlannedMeal("foreign-card", { servings: input.servings })).toEqual({ ok: false, notFound: true });
  expect(await removeCurrentPlannedMeal("foreign-card")).toBe(false);
  expect(mocks.list).toHaveBeenCalledWith({}, "owner");
  expect(mocks.search).toHaveBeenCalledWith({}, "owner", "Dinner");
  expect(mocks.add).toHaveBeenCalledWith({}, "owner", "foreign", input);
  expect(mocks.update).toHaveBeenCalledWith({}, "owner", "foreign-card", { servings: input.servings });
  expect(mocks.remove).toHaveBeenCalledWith({}, "owner", "foreign-card");
});
