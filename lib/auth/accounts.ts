import { randomUUID } from "node:crypto";
import type { Client } from "@libsql/client";

export async function findOrCreateGoogleAccount(client: Client, subject: string): Promise<string> {
  if (!subject || subject.trim() !== subject) throw new Error("Invalid Google subject");
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      return await findOrCreateInTransaction(client, subject);
    } catch (error) {
      if (!(error instanceof Error) || !String(error).includes("SQLITE_BUSY") || attempt === 11) throw error;
      await new Promise((resolve) => setTimeout(resolve, 10 * (attempt + 1)));
    }
  }
  throw new Error("Unable to provision account");
}

async function findOrCreateInTransaction(client: Client, subject: string): Promise<string> {
  const transaction = await client.transaction("write");
  try {
    const existing = await transaction.execute({
      sql: "SELECT user_id FROM provider_identities WHERE provider = ? AND subject = ?",
      args: ["google", subject],
    });
    if (existing.rows.length) {
      await transaction.commit();
      return String(existing.rows[0].user_id);
    }
    const userId = randomUUID();
    await transaction.execute({ sql: "INSERT INTO app_users (id) VALUES (?)", args: [userId] });
    await transaction.execute({
      sql: "INSERT INTO provider_identities (provider, subject, user_id) VALUES (?, ?, ?)",
      args: ["google", subject, userId],
    });
    await transaction.commit();
    return userId;
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function accountExists(client: Client, userId: string): Promise<boolean> {
  const result = await client.execute({ sql: "SELECT 1 FROM app_users WHERE id = ?", args: [userId] });
  return result.rows.length > 0;
}
