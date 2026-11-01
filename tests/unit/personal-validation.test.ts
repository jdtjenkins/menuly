import { expect, test } from "vitest";
import { personalFoodInput, validatePersonalFood, type PersonalFoodInput } from "../../lib/food/personal-validation";

const valid: PersonalFoodInput = { name: "  Rice  ", unit: "g", referenceAmount: "100", calories: "0", protein: "", carbohydrates: "0", fat: "1.25" };

test("personal food validation preserves zero and unknown values", () => {
  expect(validatePersonalFood(valid)).toEqual({ ok: true, values: { name: "Rice", unit: "g", referenceAmount: 100, calories: 0, protein: null, carbohydrates: 0, fat: 1.25 } });
  const data = new FormData();
  data.set("name", " Apple ");
  expect(personalFoodInput(data).name).toBe("Apple");
  expect(personalFoodInput(data).protein).toBe("");
});

test.each([
  ["name", "  "], ["name", "x".repeat(101)], ["unit", "oz"], ["unit", ""],
  ["referenceAmount", ""], ["referenceAmount", "0"], ["referenceAmount", "-1"],
  ["calories", ""], ["calories", "-1"], ["protein", "NaN"], ["fat", "Infinity"],
  ["carbohydrates", "1e3"], ["fat", "1.1234567"], ["calories", "1000000000001"],
] as const)("rejects invalid %s value %s", (field, value) => {
  const result = validatePersonalFood({ ...valid, [field]: value });
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.errors[field]).toBeTruthy();
});

test("accepts finite numeric boundaries", () => {
  const result = validatePersonalFood({ ...valid, referenceAmount: "0.000001", calories: "1000000000000" });
  expect(result.ok).toBe(true);
});
