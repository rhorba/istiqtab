import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── General audit log (admin actions, verifications, rule edits, …) ─────────

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ─── Document access audit (Category A PII — every view/download/upload) ──────

export const accessAuditLogs = pgTable("access_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  documentId: uuid("document_id"),
  action: text("action").$type<"view" | "download" | "upload" | "delete">().notNull(),
  ip: text("ip"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type AccessAuditLog = typeof accessAuditLogs.$inferSelect;
export type NewAccessAuditLog = typeof accessAuditLogs.$inferInsert;
