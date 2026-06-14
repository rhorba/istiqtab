import { sql } from "drizzle-orm";
import type { DB, Transaction } from "../client.js";

/**
 * Wraps fn in a transaction that sets RLS session variables so Postgres
 * policies can check app.current_user_id and app.current_user_role.
 * Use for any write (or sensitive read) that must enforce row-level security.
 */
export async function withUserContext<T>(
  db: DB,
  userId: string,
  role: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`);
    await tx.execute(sql`SELECT set_config('app.current_user_role', ${role}, true)`);
    return fn(tx);
  });
}
