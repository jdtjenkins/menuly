export type FoodSource = "global" | "personal";
export type MealLineInput = { lineId?: string; source: string; foodId: string; amount: string };
export type MealInput = { name: string; servingYield: string; lines: MealLineInput[] };
export type MealValues = { name: string; servingYield: number; lines: { lineId?: string; source: FoodSource; foodId: string; amount: number }[] };
export type MealErrors = { name?: string; servingYield?: string; lines?: string; lineErrors?: Record<number, string> };

function positiveNumber(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 && number <= 1_000_000_000_000 ? number : null;
}

export function validateMealInput(input: MealInput): { ok: true; values: MealValues } | { ok: false; errors: MealErrors } {
  const errors: MealErrors = {};
  const name = input.name.trim();
  if (!name || name.length > 100) errors.name = "Enter a name up to 100 characters.";
  const servingYield = positiveNumber(input.servingYield);
  if (servingYield === null) errors.servingYield = "Enter a positive serving yield.";
  if (!Array.isArray(input.lines) || input.lines.length < 1 || input.lines.length > 100) errors.lines = "Add between 1 and 100 ingredients.";
  const lines: MealValues["lines"] = [];
  if (Array.isArray(input.lines)) input.lines.slice(0, 100).forEach((line, index) => {
    const amount = positiveNumber(line.amount);
    if ((line.source !== "global" && line.source !== "personal") || !line.foodId || amount === null || (line.lineId !== undefined && !line.lineId)) {
      (errors.lineErrors ??= {})[index] = "Choose an available food and enter a positive amount.";
    } else {
      lines.push({ lineId: line.lineId, source: line.source, foodId: line.foodId, amount });
    }
  });
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, values: { name, servingYield: servingYield!, lines } };
}
