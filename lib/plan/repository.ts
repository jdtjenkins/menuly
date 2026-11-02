import { randomUUID } from "node:crypto";
import type { Client } from "@libsql/client";
import { validatePlanInput, type PlanInput, type PlanErrors, type Weekday } from "./validation";

export type PlannedMeal = { id: string; mealId: string; mealName: string; weekday: Weekday; servings: number };
export type MealChoice = { id: string; name: string; servingYield: number };
export type PlanResult = { ok: true; id: string } | { ok: false; errors: PlanErrors } | { ok: false; notFound: true };

export async function listPlannedMeals(client: Client, ownerId: string): Promise<PlannedMeal[]> {
  const result = await client.execute({ sql: `SELECT p.id, p.meal_id, m.name, p.weekday, p.servings FROM planned_meals p
    JOIN meals m ON m.id = p.meal_id AND m.user_id = p.user_id
    WHERE p.user_id = ? ORDER BY p.weekday, p.rowid`, args: [ownerId] });
  return result.rows.map((row) => ({ id: String(row.id), mealId: String(row.meal_id), mealName: String(row.name), weekday: Number(row.weekday) as Weekday, servings: Number(row.servings) }));
}

export async function searchPlanMeals(client: Client, ownerId: string, term: string): Promise<MealChoice[]> {
  const escaped = term.trim().slice(0, 100).replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
  const result = await client.execute({ sql: "SELECT id, name, serving_yield FROM meals WHERE user_id = ? AND name LIKE ? ESCAPE '\\' COLLATE NOCASE ORDER BY name COLLATE NOCASE, id LIMIT 30", args: [ownerId, `%${escaped}%`] });
  return result.rows.map((row) => ({ id: String(row.id), name: String(row.name), servingYield: Number(row.serving_yield) }));
}

export async function addPlannedMeal(client: Client, ownerId: string, mealId: string, input: PlanInput): Promise<PlanResult> {
  const parsed = validatePlanInput(input);
  if (!parsed.ok) return parsed;
  const transaction = await client.transaction("write");
  try {
    const meal = await transaction.execute({ sql: "SELECT id FROM meals WHERE id = ? AND user_id = ?", args: [mealId, ownerId] });
    if (!meal.rows.length) { await transaction.rollback(); return { ok: false, notFound: true }; }
    const id = `planned-${randomUUID()}`;
    await transaction.execute({ sql: "INSERT INTO planned_meals (id, user_id, meal_id, weekday, servings) VALUES (?, ?, ?, ?, ?)", args: [id, ownerId, mealId, parsed.values.weekday, parsed.values.servings] });
    await transaction.commit();
    return { ok: true, id };
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function updatePlannedMeal(client: Client, ownerId: string, id: string, input: PlanInput): Promise<PlanResult> {
  const parsed = validatePlanInput(input);
  if (!parsed.ok) return parsed;
  const result = await client.execute({ sql: "UPDATE planned_meals SET weekday = ?, servings = ? WHERE id = ? AND user_id = ?", args: [parsed.values.weekday, parsed.values.servings, id, ownerId] });
  return result.rowsAffected === 1 ? { ok: true, id } : { ok: false, notFound: true };
}

export async function removePlannedMeal(client: Client, ownerId: string, id: string): Promise<boolean> {
  const result = await client.execute({ sql: "DELETE FROM planned_meals WHERE id = ? AND user_id = ?", args: [id, ownerId] });
  return result.rowsAffected === 1;
}
