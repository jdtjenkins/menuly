import type { Client, Transaction } from "@libsql/client";
import { listShoppingItems } from "./repository";
import type { ShoppingItem } from "./calculation";

export type CheckedShoppingItem = ShoppingItem & { checked: boolean };
export type FoodSource = ShoppingItem["source"];

function identity(source: FoodSource, foodId: string): string {
  return `${source}:${foodId}`;
}

export async function listShoppingChecklist(client: Client, ownerId: string): Promise<CheckedShoppingItem[]> {
  const [items, stored] = await Promise.all([
    listShoppingItems(client, ownerId),
    client.execute({ sql: "SELECT food_source, food_id, observed_amount FROM shopping_checks WHERE user_id = ?", args: [ownerId] }),
  ]);
  const checked = new Map(stored.rows.map((row) => [identity(String(row.food_source) as FoodSource, String(row.food_id)), Number(row.observed_amount)]));
  return items.map((item) => ({ ...item, checked: (checked.get(identity(item.source, item.foodId)) ?? 0) >= item.amount }));
}

export async function setShoppingChecked(client: Client, ownerId: string, source: FoodSource, foodId: string, checked: boolean): Promise<boolean> {
  if ((source !== "global" && source !== "personal") || !foodId || typeof checked !== "boolean") return false;
  const transaction = await client.transaction("write");
  try {
    const item = (await listShoppingItems(transaction, ownerId)).find((current) => current.source === source && current.foodId === foodId);
    if (!item) { await transaction.rollback(); return false; }
    if (checked) await transaction.execute({
      sql: `INSERT INTO shopping_checks (user_id, food_source, food_id, observed_amount) VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id, food_source, food_id) DO UPDATE SET observed_amount = excluded.observed_amount`,
      args: [ownerId, source, foodId, item.amount],
    });
    else await transaction.execute({ sql: "DELETE FROM shopping_checks WHERE user_id = ? AND food_source = ? AND food_id = ?", args: [ownerId, source, foodId] });
    await transaction.commit();
    return true;
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function reconcileShoppingChecks(transaction: Transaction, ownerId: string): Promise<void> {
  const items = await listShoppingItems(transaction, ownerId);
  const amounts = new Map(items.map((item) => [identity(item.source, item.foodId), item.amount]));
  const stored = await transaction.execute({ sql: "SELECT food_source, food_id, observed_amount FROM shopping_checks WHERE user_id = ?", args: [ownerId] });
  for (const row of stored.rows) {
    const source = String(row.food_source) as FoodSource;
    const foodId = String(row.food_id);
    const amount = amounts.get(identity(source, foodId));
    if (amount === undefined || amount > Number(row.observed_amount)) {
      await transaction.execute({ sql: "DELETE FROM shopping_checks WHERE user_id = ? AND food_source = ? AND food_id = ?", args: [ownerId, source, foodId] });
    } else {
      await transaction.execute({ sql: "UPDATE shopping_checks SET observed_amount = ? WHERE user_id = ? AND food_source = ? AND food_id = ?", args: [amount, ownerId, source, foodId] });
    }
  }
}
