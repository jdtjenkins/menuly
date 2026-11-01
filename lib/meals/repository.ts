import { randomUUID } from "node:crypto";
import type { Client, Row } from "@libsql/client";
import { validateMealInput, type FoodSource, type MealInput, type MealErrors } from "./validation";

export type MealLine = {
  id: string; source: FoodSource; foodId: string; amount: number; name: string; unit: "g" | "ml";
  referenceAmount: number; calories: number | null; protein: number | null; carbohydrates: number | null; fat: number | null; archived: boolean;
};
export type Meal = { id: string; name: string; servingYield: number; lines: MealLine[] };
export type FoodChoice = { source: FoodSource; id: string; name: string; unit: "g" | "ml" };

const numeric = (value: unknown) => Number(value);
const nullable = (value: unknown) => value === null ? null : Number(value);

export async function listMeals(client: Client, ownerId: string): Promise<{ id: string; name: string; servingYield: number }[]> {
  const result = await client.execute({ sql: "SELECT id, name, serving_yield FROM meals WHERE user_id = ? ORDER BY name COLLATE NOCASE, id", args: [ownerId] });
  return result.rows.map((row) => ({ id: String(row.id), name: String(row.name), servingYield: numeric(row.serving_yield) }));
}

export async function getMeal(client: Client, ownerId: string, id: string): Promise<Meal | null> {
  const result = await client.execute({ sql: "SELECT id, name, serving_yield FROM meals WHERE id = ? AND user_id = ?", args: [id, ownerId] });
  if (!result.rows.length) return null;
  const lines = await client.execute({
    sql: `SELECT i.id, i.amount, i.global_food_id, i.personal_food_id,
      COALESCE(g.name, p.name) AS food_name, COALESCE(g.unit, p.unit) AS unit,
      COALESCE(g.reference_amount, p.reference_amount) AS reference_amount,
      CASE WHEN i.global_food_id IS NOT NULL THEN g.calories ELSE p.calories END AS calories,
      CASE WHEN i.global_food_id IS NOT NULL THEN g.protein ELSE p.protein END AS protein,
      CASE WHEN i.global_food_id IS NOT NULL THEN g.carbohydrates ELSE p.carbohydrates END AS carbohydrates,
      CASE WHEN i.global_food_id IS NOT NULL THEN g.fat ELSE p.fat END AS fat,
      p.archived_at
      FROM meal_ingredients i JOIN meals m ON m.id = i.meal_id
      LEFT JOIN global_foods g ON g.id = i.global_food_id
      LEFT JOIN personal_foods p ON p.id = i.personal_food_id AND p.user_id = m.user_id
      WHERE i.meal_id = ? AND m.user_id = ? ORDER BY i.position`, args: [id, ownerId],
  });
  return { id, name: String(result.rows[0].name), servingYield: numeric(result.rows[0].serving_yield), lines: lines.rows.map((row: Row) => ({
    id: String(row.id), source: row.global_food_id === null ? "personal" : "global",
    foodId: String(row.global_food_id ?? row.personal_food_id), amount: numeric(row.amount),
    name: String(row.food_name), unit: String(row.unit) as "g" | "ml", referenceAmount: numeric(row.reference_amount),
    calories: nullable(row.calories), protein: nullable(row.protein), carbohydrates: nullable(row.carbohydrates), fat: nullable(row.fat),
    archived: row.archived_at !== null,
  })) };
}

export async function saveMeal(client: Client, ownerId: string, input: MealInput, id?: string): Promise<
  { ok: true; id: string } | { ok: false; errors: MealErrors } | { ok: false; notFound: true }
> {
  const parsed = validateMealInput(input);
  if (!parsed.ok) return parsed;
  const transaction = await client.transaction("write");
  try {
    const current = id ? await transaction.execute({ sql: "SELECT id FROM meals WHERE id = ? AND user_id = ?", args: [id, ownerId] }) : null;
    if (id && !current?.rows.length) { await transaction.rollback(); return { ok: false, notFound: true }; }
    const oldLines = id ? await transaction.execute({ sql: "SELECT id, global_food_id, personal_food_id FROM meal_ingredients WHERE meal_id = ?", args: [id] }) : null;
    const old = new Map((oldLines?.rows ?? []).map((row) => [String(row.id), { source: row.global_food_id === null ? "personal" : "global", foodId: String(row.global_food_id ?? row.personal_food_id) }]));
    const usedIds = new Set<string>();
    const errors: MealErrors = {};
    for (const [index, line] of parsed.values.lines.entries()) {
      const previous = line.lineId ? old.get(line.lineId) : undefined;
      if (line.lineId && (!previous || usedIds.has(line.lineId))) {
        (errors.lineErrors ??= {})[index] = "Ingredient line is no longer available.";
        continue;
      }
      if (line.lineId) usedIds.add(line.lineId);
      const unchangedArchived = previous?.source === "personal" && previous.foodId === line.foodId && line.source === "personal";
      const food = await transaction.execute({
        sql: line.source === "global" ? "SELECT id FROM global_foods WHERE id = ?" :
          `SELECT id FROM personal_foods WHERE id = ? AND user_id = ? ${unchangedArchived ? "" : "AND archived_at IS NULL"}`,
        args: line.source === "global" ? [line.foodId] : [line.foodId, ownerId],
      });
      if (!food.rows.length) (errors.lineErrors ??= {})[index] = "Choose an available food.";
    }
    if (Object.keys(errors).length) { await transaction.rollback(); return { ok: false, errors }; }
    const mealId = id ?? `meal-${randomUUID()}`;
    if (id) {
      await transaction.execute({ sql: "UPDATE meals SET name = ?, serving_yield = ? WHERE id = ? AND user_id = ?", args: [parsed.values.name, parsed.values.servingYield, id, ownerId] });
      await transaction.execute({ sql: "DELETE FROM meal_ingredients WHERE meal_id = ?", args: [id] });
    } else {
      await transaction.execute({ sql: "INSERT INTO meals (id, user_id, name, serving_yield) VALUES (?, ?, ?, ?)", args: [mealId, ownerId, parsed.values.name, parsed.values.servingYield] });
    }
    for (const [position, line] of parsed.values.lines.entries()) await transaction.execute({
      sql: "INSERT INTO meal_ingredients (id, meal_id, position, amount, global_food_id, personal_food_id) VALUES (?, ?, ?, ?, ?, ?)",
      args: [line.lineId ?? `ingredient-${randomUUID()}`, mealId, position, line.amount, line.source === "global" ? line.foodId : null, line.source === "personal" ? line.foodId : null],
    });
    await transaction.commit();
    return { ok: true, id: mealId };
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function searchMealFoodChoices(client: Client, ownerId: string, term: string): Promise<FoodChoice[]> {
  const escaped = term.trim().slice(0, 100).replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
  const pattern = `%${escaped}%`;
  const [personal, global] = await Promise.all([
    client.execute({ sql: "SELECT id, name, unit FROM personal_foods WHERE user_id = ? AND archived_at IS NULL AND name LIKE ? ESCAPE '\\' COLLATE NOCASE ORDER BY name COLLATE NOCASE, id LIMIT 30", args: [ownerId, pattern] }),
    client.execute({ sql: "SELECT id, name, unit FROM global_foods WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE ORDER BY name COLLATE NOCASE, id LIMIT 30", args: [pattern] }),
  ]);
  return [...personal.rows.map((row) => ({ source: "personal" as const, id: String(row.id), name: String(row.name), unit: String(row.unit) as "g" | "ml" })),
    ...global.rows.map((row) => ({ source: "global" as const, id: String(row.id), name: String(row.name), unit: String(row.unit) as "g" | "ml" }))];
}
