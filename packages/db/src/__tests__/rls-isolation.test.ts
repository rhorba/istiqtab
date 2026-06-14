import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { withUserContext } from "../rls/index.js";
import * as schema from "../schema/index.js";
import { investorDocuments, investorProfiles, users } from "../schema/index.js";

// ── DB-layer RLS isolation (S0-16 carry-over) ─────────────────────────────────
// Proves the FORCE ROW LEVEL SECURITY policy on investor_documents (Category A
// PII, §11) actually blocks cross-investor reads — the DB-enforced "403".
//
// Two connections are required because superusers BYPASS RLS:
//   RLS_TEST_SUPERUSER_URL — fixture setup/teardown (bypasses RLS)
//   RLS_TEST_APP_URL       — the istiqtab_app role (RLS enforced)
// The suite skips when either is absent so the default DB-less `pnpm test`
// gate stays green (CI / local-with-DB set both).

const superUrl = process.env.RLS_TEST_SUPERUSER_URL ?? process.env.DATABASE_URL;
const appUrl = process.env.RLS_TEST_APP_URL;

const runId = randomUUID().slice(0, 8);
const ownerId = `rls-owner-${runId}`;
const otherId = `rls-other-${runId}`;
const adminId = `rls-admin-${runId}`;

describe.skipIf(!superUrl || !appUrl)("investor_documents RLS isolation", () => {
  const superClient = postgres(superUrl as string, { max: 1 });
  const appClient = postgres(appUrl as string, { max: 1 });
  const superDb = drizzle(superClient, { schema });
  const appDb = drizzle(appClient, { schema });

  let documentId: string;

  beforeAll(async () => {
    // Fixtures created as superuser (RLS bypassed).
    await superDb.insert(users).values([
      { id: ownerId, email: `${ownerId}@rls.test`, role: "investor" },
      { id: otherId, email: `${otherId}@rls.test`, role: "investor" },
      { id: adminId, email: `${adminId}@rls.test`, role: "admin" },
    ]);
    const [ownerProfile] = await superDb
      .insert(investorProfiles)
      .values({
        userId: ownerId,
        companyCountry: "germany",
        sector: "automotive",
        activityType: "manufacturing",
        investmentBracket: "100m_to_500m",
      })
      .returning();
    const [doc] = await superDb
      .insert(investorDocuments)
      .values({
        investorId: ownerProfile!.id,
        userId: ownerId,
        type: "passport",
        fileKey: `private/${ownerId}/passport.pdf`,
      })
      .returning();
    documentId = doc!.id;
  });

  afterAll(async () => {
    // Cascades to profile + document via FK onDelete.
    await superDb.delete(users).where(eq(users.id, ownerId));
    await superDb.delete(users).where(eq(users.id, otherId));
    await superDb.delete(users).where(eq(users.id, adminId));
    await superClient.end({ timeout: 5 });
    await appClient.end({ timeout: 5 });
  });

  it("blocks a different investor from reading the document (the DB 403)", async () => {
    const rows = await withUserContext(appDb, otherId, "investor", (tx) =>
      tx.select().from(investorDocuments).where(eq(investorDocuments.id, documentId)),
    );
    expect(rows).toHaveLength(0);
  });

  it("lets the owning investor read their own document", async () => {
    const rows = await withUserContext(appDb, ownerId, "investor", (tx) =>
      tx.select().from(investorDocuments).where(eq(investorDocuments.id, documentId)),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]!.userId).toBe(ownerId);
  });

  it("lets an admin read any investor document", async () => {
    const rows = await withUserContext(appDb, adminId, "admin", (tx) =>
      tx.select().from(investorDocuments).where(eq(investorDocuments.id, documentId)),
    );
    expect(rows).toHaveLength(1);
  });

  it("blocks a different investor from deleting the document", async () => {
    await withUserContext(appDb, otherId, "investor", (tx) =>
      tx.delete(investorDocuments).where(eq(investorDocuments.id, documentId)),
    );
    // Confirm via superuser that the row survived the unauthorized delete.
    const survived = await superDb
      .select()
      .from(investorDocuments)
      .where(eq(investorDocuments.id, documentId));
    expect(survived).toHaveLength(1);
  });
});
