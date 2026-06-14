// Sprint 1 will add full demo seed.
// For Sprint 0 we just verify the connection.
import { db } from "../client.js";
import { users } from "../schema/index.js";

async function seed() {
  const count = await db.select().from(users);
  console.log(`DB connection OK — ${count.length} users in db`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
