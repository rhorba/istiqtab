import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { partnerProfiles } from "./partners";
import { investorProfiles } from "./profiles";
import { users } from "./users";

// ─── Introduction requests (investor → admin mediates → partner notified) ────

export const introductionRequests = pgTable("introduction_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  investorId: uuid("investor_id")
    .notNull()
    .references(() => investorProfiles.id, { onDelete: "cascade" }),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partnerProfiles.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  status: text("status")
    .$type<"pending" | "accepted" | "declined" | "completed">()
    .notNull()
    .default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// ─── AI chat messages (per session; tokens logged for cost monitoring) ───────
// PII boundary: visible to the owning investor + admin only (RLS). Never logged
// in identifiable form in analytics.

export const aiChatMessages = pgTable("ai_chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  investorId: uuid("investor_id").references(() => investorProfiles.id, { onDelete: "cascade" }),
  // Denormalized owner for RLS (investorId is null for anonymous sessions).
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").notNull(),
  role: text("role").$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ─── In-app notifications ────────────────────────────────────────────────────

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type")
    .$type<
      | "wizard_reminder"
      | "booking_confirmation"
      | "intro_request_update"
      | "ai_rate_limit"
      | "welcome"
      | "system"
    >()
    .notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  linkUrl: text("link_url"),
  readAt: timestamp("read_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type IntroductionRequest = typeof introductionRequests.$inferSelect;
export type NewIntroductionRequest = typeof introductionRequests.$inferInsert;
export type AIChatMessage = typeof aiChatMessages.$inferSelect;
export type NewAIChatMessage = typeof aiChatMessages.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
