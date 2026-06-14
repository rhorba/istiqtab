import type {
  ActivityType,
  InvestmentBracket,
  InvestmentSector,
  InvestorOrigin,
  LegalForm,
  MoroccanRegion,
  WizardStep,
} from "@istiqtab/core";
import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

// ─── Investor profiles ───────────────────────────────────────────────────────
// One per investor/consultant user. Holds the profile that drives the wizard,
// incentives calculator, and AI advisor context injection.

export const investorProfiles = pgTable("investor_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name"),
  companyCountry: text("company_country").$type<InvestorOrigin>().notNull(),
  sector: text("sector").$type<InvestmentSector>().notNull(),
  activityType: text("activity_type").$type<ActivityType>().notNull(),
  investmentBracket: text("investment_bracket").$type<InvestmentBracket>().notNull(),
  targetRegions: text("target_regions").array().$type<MoroccanRegion[]>().notNull().default([]),
  jobsToCreate: integer("jobs_to_create"),
  preferredLegalForm: text("preferred_legal_form").$type<LegalForm>(),
  currentStep: text("current_step"),
  // Personalized checklist generated from the profile (Sprint 2 populates it).
  wizardSteps: jsonb("wizard_steps").$type<WizardStep[]>().notNull().default([]),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// ─── Investor documents (Category A PII — private R2, audit-logged) ───────────

export const investorDocuments = pgTable("investor_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  investorId: uuid("investor_id")
    .notNull()
    .references(() => investorProfiles.id, { onDelete: "cascade" }),
  // Denormalized owner for straightforward RLS on the documents table itself.
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type")
    .$type<"passport" | "company_reg" | "financial_statement" | "project_memo" | "other">()
    .notNull(),
  fileKey: text("file_key").notNull(),
  uploadedAt: timestamp("uploaded_at", { mode: "date" }).notNull().defaultNow(),
});

export type InvestorProfile = typeof investorProfiles.$inferSelect;
export type NewInvestorProfile = typeof investorProfiles.$inferInsert;
export type InvestorDocument = typeof investorDocuments.$inferSelect;
export type NewInvestorDocument = typeof investorDocuments.$inferInsert;
