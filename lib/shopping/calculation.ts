export type ShoppingContribution = {
  source: "global" | "personal";
  foodId: string;
  name: string;
  unit: "g" | "ml";
  ingredientAmount: number;
  plannedServings: number;
  servingYield: number;
};

export type ShoppingItem = Pick<ShoppingContribution, "source" | "foodId" | "name" | "unit"> & { amount: number };

function positive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function calculateShoppingList(contributions: readonly ShoppingContribution[]): ShoppingItem[] {
  const totals = new Map<string, ShoppingItem>();
  for (const contribution of contributions) {
    const { source, foodId, name, unit, ingredientAmount, plannedServings, servingYield } = contribution;
    if (!foodId || !name || (source !== "global" && source !== "personal") || (unit !== "g" && unit !== "ml") ||
      !positive(ingredientAmount) || !positive(plannedServings) || !positive(servingYield)) {
      throw new Error("Invalid shopping-list source data");
    }
    const amount = ingredientAmount * (plannedServings / servingYield);
    if (!positive(amount)) throw new Error("Invalid shopping-list quantity");
    const key = `${source}:${foodId}`;
    const current = totals.get(key);
    if (current && current.unit !== unit) throw new Error("Food unit changed within shopping list");
    const total = (current?.amount ?? 0) + amount;
    if (!positive(total)) throw new Error("Invalid shopping-list total");
    totals.set(key, { source, foodId, name, unit, amount: total });
  }
  return [...totals.values()].sort((a, b) =>
    a.name.localeCompare(b.name) || a.source.localeCompare(b.source) || a.foodId.localeCompare(b.foodId));
}

export function formatShoppingAmount(amount: number): string {
  if (!positive(amount)) throw new Error("Invalid shopping-list quantity");
  return Number(amount.toPrecision(15)).toLocaleString("en-GB", { maximumSignificantDigits: 15 });
}
