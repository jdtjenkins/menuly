import { beforeEach, expect, test, vi } from "vitest";
import type { PersonalFoodInput } from "../../lib/food/personal-validation";

const mocks = vi.hoisted(() => ({
  requireAccount: vi.fn(), getDatabaseClient: vi.fn(), readGlobalFoodById: vi.fn(),
  globalFoodToPersonalInput: vi.fn(), createPersonalFood: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("../../lib/auth/current-account", () => ({ requireAccount: mocks.requireAccount }));
vi.mock("../../lib/db/server", () => ({ getDatabaseClient: mocks.getDatabaseClient }));
vi.mock("../../lib/food/full-catalog", () => ({
  readGlobalFoodById: mocks.readGlobalFoodById, globalFoodToPersonalInput: mocks.globalFoodToPersonalInput,
}));
vi.mock("../../lib/food/personal-repository", () => ({ createPersonalFood: mocks.createPersonalFood }));

import { createCurrentGlobalClone, getCurrentGlobalCloneDraft } from "../../lib/food/clone-server";

const input: PersonalFoodInput = {
  name: "Rice", unit: "g", referenceAmount: "100", calories: "0",
  protein: "", carbohydrates: "10", fat: "0",
};
const source = { id: "global-rice", name: "Rice" };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getDatabaseClient.mockReturnValue({});
});

test.each(["anonymous", "expired", "orphaned"])("%s session cannot load or save a clone", async (state) => {
  mocks.requireAccount.mockRejectedValue(new Error(`Authentication required: ${state}`));
  await expect(getCurrentGlobalCloneDraft(source.id)).rejects.toThrow("Authentication required");
  await expect(createCurrentGlobalClone(source.id, input)).rejects.toThrow("Authentication required");
  expect(mocks.getDatabaseClient).not.toHaveBeenCalled();
  expect(mocks.readGlobalFoodById).not.toHaveBeenCalled();
  expect(mocks.createPersonalFood).not.toHaveBeenCalled();
});

test("draft loads only a global source after account verification", async () => {
  mocks.requireAccount.mockResolvedValue({ id: "owner" });
  mocks.readGlobalFoodById.mockResolvedValueOnce(source).mockResolvedValueOnce(null);
  mocks.globalFoodToPersonalInput.mockReturnValue(input);
  expect(await getCurrentGlobalCloneDraft(source.id)).toEqual(input);
  expect(mocks.readGlobalFoodById).toHaveBeenCalledWith({}, source.id);
  expect(await getCurrentGlobalCloneDraft("personal-only")).toBeNull();
  expect(mocks.globalFoodToPersonalInput).toHaveBeenCalledTimes(1);
});

test("save rechecks the source before validating or inserting", async () => {
  mocks.requireAccount.mockResolvedValue({ id: "owner" });
  mocks.readGlobalFoodById.mockResolvedValue(null);
  expect(await createCurrentGlobalClone("missing", input)).toEqual({ ok: false, notFound: true });
  expect(mocks.createPersonalFood).not.toHaveBeenCalled();
  mocks.readGlobalFoodById.mockResolvedValue(source);
  expect(await createCurrentGlobalClone(source.id, { ...input, calories: "" })).toMatchObject({ ok: false, errors: { calories: expect.any(String) } });
  expect(mocks.createPersonalFood).not.toHaveBeenCalled();
  mocks.createPersonalFood.mockResolvedValue({ id: "personal-new" });
  expect(await createCurrentGlobalClone(source.id, input)).toEqual({ ok: true, food: { id: "personal-new" } });
  expect(mocks.createPersonalFood).toHaveBeenCalledWith({}, "owner", {
    name: "Rice", unit: "g", referenceAmount: 100, calories: 0,
    protein: null, carbohydrates: 10, fat: 0,
  });
});
