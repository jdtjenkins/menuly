export const nutrientNames = ["calories", "protein", "carbohydrates", "fat"] as const;
export type NutrientName = typeof nutrientNames[number];
export type NutritionLine = { name: string; amount: number; referenceAmount: number } & Record<NutrientName, number | null>;
export type NutrientTotal = { value: number; complete: boolean; missingFoods: string[] };
export type NutritionTotals = Record<NutrientName, NutrientTotal>;

function positive(value: number): boolean { return Number.isFinite(value) && value > 0; }

export function recipeNutrition(lines: readonly NutritionLine[]): NutritionTotals {
  const totals = Object.fromEntries(nutrientNames.map((name) => [name, { value: 0, complete: true, missingFoods: [] as string[] }])) as NutritionTotals;
  for (const line of lines) {
    if (!positive(line.amount) || !positive(line.referenceAmount)) throw new Error("Invalid ingredient amount or reference amount");
    for (const name of nutrientNames) {
      const value = line[name];
      if (value === null) {
        totals[name].complete = false;
        if (!totals[name].missingFoods.includes(line.name)) totals[name].missingFoods.push(line.name);
      } else {
        if (!Number.isFinite(value) || value < 0) throw new Error("Invalid nutrient value");
        const contribution = line.amount / line.referenceAmount * value;
        totals[name].value += contribution;
        if (!Number.isFinite(totals[name].value)) throw new Error("Nutrition total is not finite");
      }
    }
  }
  return totals;
}

export function servingNutrition(whole: NutritionTotals, servingYield: number, selectedServings: number): NutritionTotals {
  if (!positive(servingYield) || !positive(selectedServings)) throw new Error("Enter a positive serving quantity");
  const factor = selectedServings / servingYield;
  if (!Number.isFinite(factor)) throw new Error("Invalid serving quantity");
  return Object.fromEntries(nutrientNames.map((name) => {
    const value = whole[name].value * factor;
    if (!Number.isFinite(value)) throw new Error("Nutrition total is not finite");
    return [name, { value, complete: whole[name].complete, missingFoods: [...whole[name].missingFoods] }];
  })) as NutritionTotals;
}
