import type { InvestmentSector, Locale, MoroccanRegion, PartnerType } from "@istiqtab/core";
import { boolean, integer, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── Partner profiles (local distributors, law firms, recruiters, …) ─────────
// Public profile is browseable; contact happens via admin-mediated intro request.

export const partnerProfiles = pgTable("partner_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  ice: text("ice"),
  partnerType: text("partner_type").$type<PartnerType>().notNull(),
  sectors: text("sectors").array().$type<InvestmentSector[]>().notNull().default([]),
  regions: text("regions").array().$type<MoroccanRegion[]>().notNull().default([]),
  languages: text("languages").array().$type<Locale[]>().notNull().default([]),
  description: text("description").notNull(),
  internationalClients: text("international_clients").array().$type<string[]>(),
  websiteUrl: text("website_url"),
  photoKey: text("photo_key"),
  verified: boolean("verified").notNull().default(false),
  avgRating: real("avg_rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type PartnerProfile = typeof partnerProfiles.$inferSelect;
export type NewPartnerProfile = typeof partnerProfiles.$inferInsert;
