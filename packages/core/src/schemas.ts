import { z } from "zod";

export const RoleSchema = z.enum(["investor", "consultant", "expert", "partner", "admin"]);

export const LocaleSchema = z.enum(["en", "fr", "ar"]);

export const InvestorOriginSchema = z.enum([
  "france",
  "spain",
  "germany",
  "other_europe",
  "uae",
  "saudi",
  "other_gulf",
  "usa",
  "china",
  "other_asia",
  "africa",
  "other",
]);

export const InvestmentSectorSchema = z.enum([
  "automotive",
  "aerospace",
  "renewables",
  "bpo_ites",
  "pharma",
  "agrifood",
  "tourism",
  "real_estate",
  "finance",
  "logistics",
  "tech",
  "textile",
  "mining",
  "other",
]);

export const ActivityTypeSchema = z.enum([
  "manufacturing",
  "services",
  "r_and_d",
  "distribution",
  "headquarters",
  "mixed",
]);

export const LegalFormSchema = z.enum([
  "sarl",
  "sa",
  "sas",
  "succursale",
  "bureau_de_liaison",
  "sarlau",
]);

export const InvestmentBracketSchema = z.enum([
  "under_5m",
  "5m_to_25m",
  "25m_to_100m",
  "100m_to_500m",
  "over_500m",
]);

export const MoroccanRegionSchema = z.enum([
  "tanger_tetouan",
  "oriental",
  "fes_meknes",
  "rabat_sale",
  "beni_mellal",
  "casablanca_settat",
  "marrakech_safi",
  "draa_tafilalet",
  "souss_massa",
  "guelmim_oued_noun",
  "laayoune_sakia",
  "dakhla_oued_dahab",
]);

export const PartnerTypeSchema = z.enum([
  "law_firm",
  "tax_advisor",
  "real_estate",
  "industrial_zone",
  "recruitment",
  "logistics",
  "distributor",
  "supplier",
  "it_provider",
  "other",
]);

export const IncentiveTypeSchema = z.enum([
  "is_exemption",
  "is_reduced_rate",
  "tva_exemption",
  "customs_exemption",
  "land_subsidy",
  "employment_premium",
  "training_subsidy",
  "energy_benefit",
  "export_support",
  "sez_benefit",
  "r_and_d_credit",
]);

export const WizardStepStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "blocked",
  "skipped",
]);

// Auth schemas
export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
  role: z.enum(["investor", "consultant", "expert", "partner"]),
  company: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  preferredLanguage: LocaleSchema.default("en"),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Investor profile schemas
export const InvestorProfileCreateSchema = z.object({
  companyName: z.string().max(200).optional(),
  companyCountry: InvestorOriginSchema,
  sector: InvestmentSectorSchema,
  activityType: ActivityTypeSchema,
  investmentBracket: InvestmentBracketSchema,
  targetRegions: z.array(MoroccanRegionSchema).min(1).max(4),
  jobsToCreate: z.number().int().min(0).max(100000).optional(),
  preferredLegalForm: LegalFormSchema.optional(),
});

export const InvestorProfileUpdateSchema = InvestorProfileCreateSchema.partial();

// Partner profile schema
export const PartnerProfileCreateSchema = z.object({
  companyName: z.string().min(2).max(200),
  ice: z.string().max(20).optional(),
  partnerType: PartnerTypeSchema,
  sectors: z.array(InvestmentSectorSchema).max(14).default([]),
  regions: z.array(MoroccanRegionSchema).max(12).default([]),
  languages: z.array(LocaleSchema).min(1).max(3),
  description: z.string().min(20).max(2000),
  internationalClients: z.array(z.string().max(120)).max(20).optional(),
  websiteUrl: z.string().url().max(300).optional(),
});

export const PartnerProfileUpdateSchema = PartnerProfileCreateSchema.partial();

// Expert profile schema
export const ExpertProfileCreateSchema = z.object({
  name: z.string().min(2).max(120),
  title: z.string().min(2).max(160),
  specializations: z.array(InvestmentSectorSchema).max(14).default([]),
  languages: z.array(LocaleSchema).min(1).max(3),
  hourlyRateMAD: z.number().int().min(0).max(1000000),
  hourlyRateEUR: z.number().int().min(0).max(100000).optional(),
  bio: z.string().min(20).max(3000),
  bioFr: z.string().max(3000).optional(),
  bioAr: z.string().max(3000).optional(),
  linkedinUrl: z.string().url().max(300).optional(),
});

export const ExpertProfileUpdateSchema = ExpertProfileCreateSchema.partial();

// Incentives calculator input
export const IncentivesInputSchema = z.object({
  sector: InvestmentSectorSchema,
  activityType: ActivityTypeSchema,
  investmentBracket: InvestmentBracketSchema,
  region: MoroccanRegionSchema,
  jobsToCreate: z.number().int().min(0).max(100000).default(0),
  compareRegions: z.array(MoroccanRegionSchema).max(3).optional(),
});

// Partner search
export const PartnerSearchSchema = z.object({
  partnerType: PartnerTypeSchema.optional(),
  sector: InvestmentSectorSchema.optional(),
  region: MoroccanRegionSchema.optional(),
  language: z.enum(["en", "fr", "ar"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// Introduction request
export const IntroductionRequestSchema = z.object({
  partnerId: z.string().uuid(),
  message: z.string().min(20).max(1000),
});

// Expert search
export const ExpertSearchSchema = z.object({
  sector: InvestmentSectorSchema.optional(),
  language: z.enum(["en", "fr", "ar"]).optional(),
  maxRateMAD: z.number().int().min(0).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// AI chat
export const AIChatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid(),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type InvestorProfileCreateInput = z.infer<typeof InvestorProfileCreateSchema>;
export type InvestorProfileUpdateInput = z.infer<typeof InvestorProfileUpdateSchema>;
export type PartnerProfileCreateInput = z.infer<typeof PartnerProfileCreateSchema>;
export type ExpertProfileCreateInput = z.infer<typeof ExpertProfileCreateSchema>;
export type IncentivesInput = z.infer<typeof IncentivesInputSchema>;
export type PartnerSearchInput = z.infer<typeof PartnerSearchSchema>;
export type IntroductionRequestInput = z.infer<typeof IntroductionRequestSchema>;
export type ExpertSearchInput = z.infer<typeof ExpertSearchSchema>;
export type AIChatMessageInput = z.infer<typeof AIChatMessageSchema>;
