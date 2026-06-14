import type {
  ActivityType,
  AppliedIncentive,
  IncentiveType,
  InvestmentBracket,
  InvestmentSector,
  MoroccanRegion,
} from "@istiqtab/core";
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { investorProfiles } from "./profiles";

// ─── Incentive rules (DATA, not code — admin-editable, no deploy needed) ──────
// The Sprint 3 rule engine reads these rows and evaluates the match criteria
// against an investor profile. Empty match arrays mean "applies to all".

export const incentiveRules = pgTable("incentive_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  incentiveType: text("incentive_type").$type<IncentiveType>().notNull(),
  label: text("label").notNull(),
  labelFr: text("label_fr").notNull(),
  labelAr: text("label_ar").notNull(),
  // Indicative value, e.g. "5 ans d'exonération IS" or "15% du prix du terrain".
  value: text("value").notNull(),
  condition: text("condition").notNull(),
  sourceArticle: text("source_article"),
  confidence: text("confidence")
    .$type<"confirmed" | "indicative" | "requires_verification">()
    .notNull()
    .default("indicative"),
  // Match criteria (empty array = no constraint on that dimension).
  sectors: text("sectors").array().$type<InvestmentSector[]>().notNull().default([]),
  regions: text("regions").array().$type<MoroccanRegion[]>().notNull().default([]),
  activityTypes: text("activity_types").array().$type<ActivityType[]>().notNull().default([]),
  brackets: text("brackets").array().$type<InvestmentBracket[]>().notNull().default([]),
  minJobs: integer("min_jobs").notNull().default(0),
  priority: integer("priority").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// ─── Incentive results (computed snapshots; investorId null = anonymous run) ──

export const incentiveResults = pgTable("incentive_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  investorId: uuid("investor_id").references(() => investorProfiles.id, { onDelete: "set null" }),
  sector: text("sector").$type<InvestmentSector>().notNull(),
  region: text("region").$type<MoroccanRegion>().notNull(),
  investmentBracket: text("investment_bracket").$type<InvestmentBracket>().notNull(),
  activityType: text("activity_type").$type<ActivityType>().notNull(),
  jobsToCreate: integer("jobs_to_create").notNull().default(0),
  applicableIncentives: jsonb("applicable_incentives")
    .$type<AppliedIncentive[]>()
    .notNull()
    .default([]),
  totalEstimatedBenefit: text("total_estimated_benefit"),
  reportKey: text("report_key"),
  computedAt: timestamp("computed_at", { mode: "date" }).notNull().defaultNow(),
});

export type IncentiveRule = typeof incentiveRules.$inferSelect;
export type NewIncentiveRule = typeof incentiveRules.$inferInsert;
export type IncentiveResult = typeof incentiveResults.$inferSelect;
export type NewIncentiveResult = typeof incentiveResults.$inferInsert;
