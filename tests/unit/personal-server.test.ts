import { beforeEach, expect, test, vi } from "vitest";
import type { PersonalFoodInput } from "../../lib/food/personal-validation";

const mocks = vi.hoisted(() => ({
  requireAccount: vi.fn(), getDatabaseClient: vi.fn(), listPersonalFoods: vi.fn(), getPersonalFood: vi.fn(),
  createPersonalFood: vi.fn(), updatePersonalFood: vi.fn(), archivePersonalFood: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("../../lib/auth/current-account", () => ({ requireAccount: mocks.requireAccount }));
vi.mock("../../lib/db/server", () => ({ getDatabaseClient: mocks.getDatabaseClient }));
vi.mock("../../lib/food/personal-repository", () => ({
  listPersonalFoods: mocks.listPersonalFoods, getPersonalFood: mocks.getPersonalFood,
  createPersonalFood: mocks.createPersonalFood, updatePersonalFood: mocks.updatePersonalFood, archivePersonalFood: mocks.archivePersonalFood,
}));

import { archiveCurrentPersonalFood, createCurrentPersonalFood, getCurrentPersonalFood, listCurrentPersonalFoods, updateCurrentPersonalFood } from "../../lib/food/personal-server";

const valid: PersonalFoodInput = { name: "Rice", unit: "g", referenceAmount: "100", calories: "0", protein: "", carbohydrates: "0", fat: "" };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getDatabaseClient.mockReturnValue({});
});

test.each(["missing", "expired", "orphaned"])("%s session cannot read or change personal foods", async (state) => {
  mocks.requireAccount.mockRejectedValue(new Error(`Authentication required: ${state}`));
  await expect(listCurrentPersonalFoods()).rejects.toThrow("Authentication required");
  await expect(getCurrentPersonalFood("id")).rejects.toThrow("Authentication required");
  await expect(createCurrentPersonalFood(valid)).rejects.toThrow("Authentication required");
  await expect(updateCurrentPersonalFood("id", valid)).rejects.toThrow("Authentication required");
  await expect(archiveCurrentPersonalFood("id")).rejects.toThrow("Authentication required");
  expect(mocks.getDatabaseClient).not.toHaveBeenCalled();
  expect(mocks.createPersonalFood).not.toHaveBeenCalled();
  expect(mocks.updatePersonalFood).not.toHaveBeenCalled();
  expect(mocks.archivePersonalFood).not.toHaveBeenCalled();
});

test("authorized operations scope reads and writes to the account and reject invalid input", async () => {
  mocks.requireAccount.mockResolvedValue({ id: "owner" });
  mocks.listPersonalFoods.mockResolvedValue({ foods: [], page: 1, hasNext: false });
  await listCurrentPersonalFoods(2);
  expect(mocks.listPersonalFoods).toHaveBeenCalledWith({}, "owner", 2);
  const invalid = await createCurrentPersonalFood({ ...valid, calories: "" });
  expect(invalid).toMatchObject({ ok: false, errors: { calories: expect.any(String) } });
  expect(mocks.createPersonalFood).not.toHaveBeenCalled();
  mocks.getPersonalFood.mockResolvedValue(null);
  expect(await updateCurrentPersonalFood("not-owned", valid)).toEqual({ ok: false, notFound: true });
  expect(mocks.getPersonalFood).toHaveBeenCalledWith({}, "owner", "not-owned");
  expect(mocks.updatePersonalFood).not.toHaveBeenCalled();
  mocks.archivePersonalFood.mockResolvedValue(false);
  expect(await archiveCurrentPersonalFood("not-owned")).toBe(false);
  expect(mocks.archivePersonalFood).toHaveBeenCalledWith({}, "owner", "not-owned");
  mocks.getPersonalFood.mockResolvedValue({ id: "mine", unit: "g" });
  expect(await updateCurrentPersonalFood("mine", { ...valid, unit: "ml" })).toEqual({ ok: false, errors: { unit: "Unit cannot be changed." } });
  expect(mocks.updatePersonalFood).not.toHaveBeenCalled();
});
