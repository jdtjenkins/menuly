import { expect, test } from "vitest";
import { recipeNutrition, servingNutrition } from "../../lib/meals/nutrition";

const lines = [
  { name: "Rice", amount: 50, referenceAmount: 100, calories: 100, protein: 0, carbohydrates: 20, fat: 1 },
  { name: "Milk", amount: 100, referenceAmount: 200, calories: 80, protein: null, carbohydrates: 10, fat: 0 },
];

test("whole and fractional servings scale known values while retaining missing foods", () => {
  const whole = recipeNutrition(lines);
  expect(whole.calories).toEqual({ value: 90, complete: true, missingFoods: [] });
  expect(whole.protein).toEqual({ value: 0, complete: false, missingFoods: ["Milk"] });
  expect(whole.fat).toEqual({ value: 0.5, complete: true, missingFoods: [] });
  const selected = servingNutrition(whole, 4, 1.5);
  expect(selected.calories.value).toBe(33.75);
  expect(selected.protein).toEqual({ value: 0, complete: false, missingFoods: ["Milk"] });
  expect(recipeNutrition([{ ...lines[0], protein: 0 }]).protein.complete).toBe(true);
});

test("rejects nonfinite amounts, nutrients, and servings", () => {
  expect(() => recipeNutrition([{ ...lines[0], amount: Infinity }])).toThrow();
  expect(() => recipeNutrition([{ ...lines[0], calories: NaN }])).toThrow();
  const whole = recipeNutrition(lines);
  expect(() => servingNutrition(whole, 4, 0)).toThrow();
  expect(() => servingNutrition(whole, 4, Infinity)).toThrow();
});
