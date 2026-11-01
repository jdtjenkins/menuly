import { randomUUID } from "node:crypto";
import type { Client, Row } from "@libsql/client";
import type { PersonalFoodValues } from "./personal-validation";

export type PersonalFood = PersonalFoodValues & { id: string };
export const PERSONAL_FOOD_PAGE_SIZE = 20;

function foodFromRow(row: Row): PersonalFood {
  return {
    id: String(row.id), name: String(row.name), unit: String(row.unit) as "g" | "ml",
    referenceAmount: Number(row.reference_amount), calories: Number(row.calories),
    protein: row.protein === null ? null : Number(row.protein),
    carbohydrates: row.carbohydrates === null ? null : Number(row.carbohydrates),
    fat: row.fat === null ? null : Number(row.fat),
  };
}

const columns = "id, name, unit, reference_amount, calories, protein, carbohydrates, fat";

export async function listPersonalFoods(client: Client, ownerId: string, page = 1) {
  const safePage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10_000) : 1;
  const result = await client.execute({
    sql: `SELECT ${columns} FROM personal_foods WHERE user_id = ? AND archived_at IS NULL ORDER BY name COLLATE NOCASE, id LIMIT ? OFFSET ?`,
    args: [ownerId, PERSONAL_FOOD_PAGE_SIZE + 1, (safePage - 1) * PERSONAL_FOOD_PAGE_SIZE],
  });
  return { foods: result.rows.slice(0, PERSONAL_FOOD_PAGE_SIZE).map(foodFromRow), page: safePage, hasNext: result.rows.length > PERSONAL_FOOD_PAGE_SIZE };
}

export async function getPersonalFood(client: Client, ownerId: string, id: string): Promise<PersonalFood | null> {
  const result = await client.execute({ sql: `SELECT ${columns} FROM personal_foods WHERE id = ? AND user_id = ? AND archived_at IS NULL`, args: [id, ownerId] });
  return result.rows.length ? foodFromRow(result.rows[0]) : null;
}

export async function createPersonalFood(client: Client, ownerId: string, values: PersonalFoodValues): Promise<PersonalFood> {
  const id = `personal-${randomUUID()}`;
  await client.execute({
    sql: "INSERT INTO personal_foods (id, user_id, name, unit, reference_amount, calories, protein, carbohydrates, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    args: [id, ownerId, values.name, values.unit, values.referenceAmount, values.calories, values.protein, values.carbohydrates, values.fat],
  });
  return { id, ...values };
}

export async function updatePersonalFood(client: Client, ownerId: string, id: string, values: PersonalFoodValues): Promise<PersonalFood | null> {
  const existing = await getPersonalFood(client, ownerId, id);
  if (!existing) return null;
  if (existing.unit !== values.unit) throw new Error("Unit cannot be changed");
  await client.execute({
    sql: "UPDATE personal_foods SET name = ?, reference_amount = ?, calories = ?, protein = ?, carbohydrates = ?, fat = ? WHERE id = ? AND user_id = ? AND archived_at IS NULL",
    args: [values.name, values.referenceAmount, values.calories, values.protein, values.carbohydrates, values.fat, id, ownerId],
  });
  return getPersonalFood(client, ownerId, id);
}

export async function archivePersonalFood(client: Client, ownerId: string, id: string): Promise<boolean> {
  const result = await client.execute({
    sql: "UPDATE personal_foods SET archived_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND archived_at IS NULL",
    args: [id, ownerId],
  });
  return result.rowsAffected === 1;
}
