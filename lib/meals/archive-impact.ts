import type { Client } from "@libsql/client";

export type AffectedMeal = { id: string; name: string };
type Executor = Pick<Client, "execute">;

async function affectedMeals(client: Executor, ownerId: string, foodId: string): Promise<AffectedMeal[] | null> {
  const food = await client.execute({ sql: "SELECT id FROM personal_foods WHERE id = ? AND user_id = ? AND archived_at IS NULL", args: [foodId, ownerId] });
  if (!food.rows.length) return null;
  const result = await client.execute({
    sql: `SELECT DISTINCT m.id, m.name FROM meals m JOIN meal_ingredients i ON i.meal_id = m.id
      WHERE m.user_id = ? AND i.personal_food_id = ? ORDER BY m.name COLLATE NOCASE, m.id`, args: [ownerId, foodId],
  });
  return result.rows.map((row) => ({ id: String(row.id), name: String(row.name) }));
}

export async function getArchiveImpact(client: Client, ownerId: string, foodId: string) {
  return affectedMeals(client, ownerId, foodId);
}

export async function archiveWithMealAcknowledgement(client: Client, ownerId: string, foodId: string, acknowledged: AffectedMeal[]): Promise<
  { status: "archived" } | { status: "not-found" } | { status: "stale"; meals: AffectedMeal[] }
> {
  const transaction = await client.transaction("write");
  try {
    const meals = await affectedMeals(transaction, ownerId, foodId);
    if (!meals) { await transaction.rollback(); return { status: "not-found" }; }
    if (JSON.stringify(meals) !== JSON.stringify(acknowledged)) { await transaction.rollback(); return { status: "stale", meals }; }
    const result = await transaction.execute({ sql: "UPDATE personal_foods SET archived_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND archived_at IS NULL", args: [foodId, ownerId] });
    if (result.rowsAffected !== 1) { await transaction.rollback(); return { status: "not-found" }; }
    await transaction.commit();
    return { status: "archived" };
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}
