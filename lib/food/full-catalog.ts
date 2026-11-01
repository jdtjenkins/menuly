import type { Client, Row } from "@libsql/client";
import { normalizePublicFoodTerm } from "./public-search";
import type { PersonalFoodInput } from "./personal-validation";

export type FullFood = {
  id: string;
  name: string;
  unit: string;
  referenceAmount: number;
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
};

export const FULL_FOOD_PAGE_SIZE = 20;
export const MAX_FOOD_PAGE = 10_000;

const fullFoodColumns = "id, name, unit, reference_amount, calories, protein, carbohydrates, fat";

function fullFoodFromRow(row: Row): FullFood {
  return {
    id: String(row.id), name: String(row.name), unit: String(row.unit),
    referenceAmount: Number(row.reference_amount),
    calories: row.calories === null ? null : Number(row.calories),
    protein: row.protein === null ? null : Number(row.protein),
    carbohydrates: row.carbohydrates === null ? null : Number(row.carbohydrates),
    fat: row.fat === null ? null : Number(row.fat),
  };
}

export async function readGlobalFoodById(client: Client, id: string): Promise<FullFood | null> {
  const result = await client.execute({ sql: `SELECT ${fullFoodColumns} FROM global_foods WHERE id = ?`, args: [id] });
  return result.rows.length ? fullFoodFromRow(result.rows[0]) : null;
}

export function globalFoodToPersonalInput(food: FullFood): PersonalFoodInput {
  const text = (value: number | null) => value === null ? "" : String(value);
  return {
    name: food.name, unit: food.unit, referenceAmount: String(food.referenceAmount),
    calories: text(food.calories), protein: text(food.protein),
    carbohydrates: text(food.carbohydrates), fat: text(food.fat),
  };
}

export function normalizeFoodPage(raw: string | undefined): number {
  if (!raw || !/^[1-9]\d*$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) ? Math.min(page, MAX_FOOD_PAGE) : 1;
}

function escapeLike(term: string): string {
  return term.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export async function readFullFoods(client: Client, rawTerm: string | undefined, page: number) {
  const term = normalizePublicFoodTerm(rawTerm);
  const safePage = Number.isSafeInteger(page) && page > 0 ? Math.min(page, MAX_FOOD_PAGE) : 1;
  const result = await client.execute({
    sql: `SELECT ${fullFoodColumns}
      FROM global_foods ${term ? "WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE" : ""}
      ORDER BY name COLLATE NOCASE ASC, id ASC LIMIT ? OFFSET ?`,
    args: [...(term ? [`%${escapeLike(term)}%`] : []), FULL_FOOD_PAGE_SIZE + 1, (safePage - 1) * FULL_FOOD_PAGE_SIZE],
  });
  const foods: FullFood[] = result.rows.slice(0, FULL_FOOD_PAGE_SIZE).map(fullFoodFromRow);
  return { foods, page: safePage, hasNext: result.rows.length > FULL_FOOD_PAGE_SIZE };
}

export async function readGuardedFullFoods(
  client: Client,
  requireCurrentAccount: () => Promise<unknown>,
  rawTerm: string | undefined,
  page: number,
) {
  await requireCurrentAccount();
  return readFullFoods(client, rawTerm, page);
}
