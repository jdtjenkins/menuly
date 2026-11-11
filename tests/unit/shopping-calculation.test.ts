import { expect, test } from "vitest";
import { calculateShoppingList, formatShoppingAmount, type ShoppingContribution } from "../../lib/shopping/calculation";

const base: ShoppingContribution = { source: "global", foodId: "rice", name: "Rice", unit: "g", ingredientAmount: 300, plannedServings: 2, servingYield: 4 };

test("scales fractional cards and combines repeated foods and ingredient lines", () => {
  expect(calculateShoppingList([
    base,
    { ...base, ingredientAmount: 100, plannedServings: 0.5 },
    { ...base, ingredientAmount: 200, plannedServings: 1 },
  ])).toEqual([{ source: "global", foodId: "rice", name: "Rice", unit: "g", amount: 212.5 }]);
});

test("separates same-named food identities and keeps g and ml units", () => {
  expect(calculateShoppingList([
    base,
    { ...base, source: "personal", foodId: "rice", ingredientAmount: 100, unit: "ml" },
    { ...base, foodId: "other", ingredientAmount: 20 },
  ])).toEqual([
    { source: "global", foodId: "other", name: "Rice", unit: "g", amount: 10 },
    { source: "global", foodId: "rice", name: "Rice", unit: "g", amount: 150 },
    { source: "personal", foodId: "rice", name: "Rice", unit: "ml", amount: 50 },
  ]);
});

test("rejects invalid and overflowing quantities", () => {
  expect(() => calculateShoppingList([{ ...base, servingYield: 0 }])).toThrow();
  expect(() => calculateShoppingList([{ ...base, plannedServings: Infinity }])).toThrow();
  expect(() => calculateShoppingList([{ ...base, ingredientAmount: Number.MAX_VALUE, plannedServings: 2, servingYield: 1 }])).toThrow();
});

test("formats fractional quantities without binary floating-point noise", () => {
  const [item] = calculateShoppingList([
    { ...base, ingredientAmount: 0.1, plannedServings: 1, servingYield: 1 },
    { ...base, ingredientAmount: 0.2, plannedServings: 1, servingYield: 1 },
  ]);
  expect(formatShoppingAmount(item.amount)).toBe("0.3");
  expect(formatShoppingAmount(1500.25)).toBe("1,500.25");
});
