import type { InvestmentSector, Locale } from "@istiqtab/core";
import { boolean, integer, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { investorProfiles } from "./profiles";
import { users } from "./users";

// ─── Expert profiles (vetted lawyers, tax advisors, sector specialists) ──────
// Rates are plain integers (MAD/EUR) — NO Money type; no v0.1 payment processing.

export const expertProfiles = pgTable("expert_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  title: text("title").notNull(),
  photoKey: text("photo_key"),
  specializations: text("specializations")
    .array()
    .$type<InvestmentSector[]>()
    .notNull()
    .default([]),
  languages: text("languages").array().$type<Locale[]>().notNull().default([]),
  hourlyRateMAD: integer("hourly_rate_mad").notNull(),
  hourlyRateEUR: integer("hourly_rate_eur"),
  bio: text("bio").notNull(),
  bioFr: text("bio_fr"),
  bioAr: text("bio_ar"),
  linkedinUrl: text("linkedin_url"),
  avgRating: real("avg_rating").notNull().default(0),
  sessionCount: integer("session_count").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ─── Expert availability slots ───────────────────────────────────────────────

export const expertSlots = pgTable("expert_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  expertId: uuid("expert_id")
    .notNull()
    .references(() => expertProfiles.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true, mode: "date" }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true, mode: "date" }).notNull(),
  durationMinutes: integer("duration_minutes").$type<30 | 60>().notNull(),
  booked: boolean("booked").notNull().default(false),
  bookedByUserId: text("booked_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ─── Expert bookings ─────────────────────────────────────────────────────────

export const expertBookings = pgTable("expert_bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  slotId: uuid("slot_id")
    .notNull()
    .references(() => expertSlots.id, { onDelete: "cascade" }),
  investorId: uuid("investor_id")
    .notNull()
    .references(() => investorProfiles.id, { onDelete: "cascade" }),
  expertId: uuid("expert_id")
    .notNull()
    .references(() => expertProfiles.id, { onDelete: "cascade" }),
  status: text("status")
    .$type<"confirmed" | "completed" | "cancelled" | "no_show">()
    .notNull()
    .default("confirmed"),
  meetingUrl: text("meeting_url"),
  invoiceKey: text("invoice_key"),
  confirmedAt: timestamp("confirmed_at", { mode: "date" }).notNull().defaultNow(),
});

export type ExpertProfile = typeof expertProfiles.$inferSelect;
export type NewExpertProfile = typeof expertProfiles.$inferInsert;
export type ExpertSlot = typeof expertSlots.$inferSelect;
export type NewExpertSlot = typeof expertSlots.$inferInsert;
export type ExpertBooking = typeof expertBookings.$inferSelect;
export type NewExpertBooking = typeof expertBookings.$inferInsert;
