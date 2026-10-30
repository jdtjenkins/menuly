import type { Client } from "@libsql/client";

export type PublicFood = {
  name: string;
  calories: number | null;
};

export const PUBLIC_FOOD_LIMIT = 20;
export const PUBLIC_SEARCH_MAX_LENGTH = 100;

export function normalizePublicFoodTerm(raw: string | undefined): string {
  return (raw ?? "").trim().slice(0, PUBLIC_SEARCH_MAX_LENGTH);
}

function escapeLike(term: string): string {
  return term.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export async function searchPublicFoods(client: Client, rawTerm: string | undefined): Promise<PublicFood[]> {
  const term = normalizePublicFoodTerm(rawTerm);
  if (!term) return [];

  const result = await client.execute({
    sql: `SELECT name, calories FROM global_foods
      WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE
      ORDER BY name COLLATE NOCASE ASC, id ASC
      LIMIT ${PUBLIC_FOOD_LIMIT}`,
    args: [`%${escapeLike(term)}%`],
  });

  return result.rows.map((row) => ({
    name: String(row.name),
    calories: row.calories === null ? null : Number(row.calories),
  }));
}
