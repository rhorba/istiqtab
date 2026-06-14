import type { ActivityType, InvestmentSector, LegalForm, MoroccanRegion } from "@istiqtab/core";
import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// ─── CRI region profiles (12 Regional Investment Centres) ────────────────────
// Powers the wizard region comparison and the public Intelligence Hub pages.

export const criRegions = pgTable("cri_regions", {
  id: uuid("id").primaryKey().defaultRandom(),
  region: text("region").$type<MoroccanRegion>().notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr").notNull(),
  nameAr: text("name_ar").notNull(),
  capital: text("capital").notNull(),
  keySectors: text("key_sectors").array().$type<InvestmentSector[]>().notNull().default([]),
  industrialZones: jsonb("industrial_zones").$type<string[]>().notNull().default([]),
  landPriceRange: text("land_price_range"),
  portAccess: text("port_access"),
  talentPool: text("talent_pool"),
  criContactName: text("cri_contact_name"),
  criContactEmail: text("cri_contact_email"),
  criContactPhone: text("cri_contact_phone"),
  criWebsite: text("cri_website"),
  summaryEn: text("summary_en"),
  summaryFr: text("summary_fr"),
  summaryAr: text("summary_ar"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

// ─── Wizard step templates (Sprint 2 generator reads these to build a list) ──

export const wizardStepTemplates = pgTable("wizard_step_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleFr: text("title_fr").notNull(),
  titleAr: text("title_ar").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionFr: text("description_fr").notNull(),
  descriptionAr: text("description_ar").notNull(),
  // Applicability filters (empty = applies to all).
  appliesToLegalForms: text("applies_to_legal_forms")
    .array()
    .$type<LegalForm[]>()
    .notNull()
    .default([]),
  appliesToActivities: text("applies_to_activities")
    .array()
    .$type<ActivityType[]>()
    .notNull()
    .default([]),
  appliesToSectors: text("applies_to_sectors")
    .array()
    .$type<InvestmentSector[]>()
    .notNull()
    .default([]),
  officialLink: text("official_link"),
  estimatedDays: integer("estimated_days"),
  requiredDocuments: text("required_documents").array().$type<string[]>().notNull().default([]),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export type CriRegion = typeof criRegions.$inferSelect;
export type NewCriRegion = typeof criRegions.$inferInsert;
export type WizardStepTemplate = typeof wizardStepTemplates.$inferSelect;
export type NewWizardStepTemplate = typeof wizardStepTemplates.$inferInsert;
