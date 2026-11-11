import type { Client } from "@libsql/client";
import { calculateShoppingList, type ShoppingContribution, type ShoppingItem } from "./calculation";

export async function listShoppingItems(client: Client, ownerId: string): Promise<ShoppingItem[]> {
  const result = await client.execute({
    sql: `SELECT i.global_food_id, i.personal_food_id, i.amount AS ingredient_amount,
      p.servings AS planned_servings, m.serving_yield,
      COALESCE(g.name, f.name) AS food_name, COALESCE(g.unit, f.unit) AS food_unit
      FROM planned_meals p
      JOIN meals m ON m.id = p.meal_id AND m.user_id = p.user_id
      JOIN meal_ingredients i ON i.meal_id = m.id
      LEFT JOIN global_foods g ON g.id = i.global_food_id
      LEFT JOIN personal_foods f ON f.id = i.personal_food_id AND f.user_id = p.user_id
      WHERE p.user_id = ?`,
    args: [ownerId],
  });
  const contributions: ShoppingContribution[] = result.rows.map((row) => ({
    source: row.global_food_id === null ? "personal" : "global",
    foodId: String(row.global_food_id ?? row.personal_food_id ?? ""),
    name: String(row.food_name ?? ""),
    unit: String(row.food_unit ?? "") as ShoppingContribution["unit"],
    ingredientAmount: Number(row.ingredient_amount),
    plannedServings: Number(row.planned_servings),
    servingYield: Number(row.serving_yield),
  }));
  return calculateShoppingList(contributions);
}
