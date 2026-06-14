export type Role = "investor" | "consultant" | "expert" | "partner" | "admin";

export type InvestorOrigin =
  | "france"
  | "spain"
  | "germany"
  | "other_europe"
  | "uae"
  | "saudi"
  | "other_gulf"
  | "usa"
  | "china"
  | "other_asia"
  | "africa"
  | "other";

export type InvestmentSector =
  | "automotive"
  | "aerospace"
  | "renewables"
  | "bpo_ites"
  | "pharma"
  | "agrifood"
  | "tourism"
  | "real_estate"
  | "finance"
  | "logistics"
  | "tech"
  | "textile"
  | "mining"
  | "other";

export type ActivityType =
  | "manufacturing"
  | "services"
  | "r_and_d"
  | "distribution"
  | "headquarters"
  | "mixed";

export type LegalForm = "sarl" | "sa" | "sas" | "succursale" | "bureau_de_liaison" | "sarlau";

export type InvestmentBracket =
  | "under_5m"
  | "5m_to_25m"
  | "25m_to_100m"
  | "100m_to_500m"
  | "over_500m";

export type MoroccanRegion =
  | "tanger_tetouan"
  | "oriental"
  | "fes_meknes"
  | "rabat_sale"
  | "beni_mellal"
  | "casablanca_settat"
  | "marrakech_safi"
  | "draa_tafilalet"
  | "souss_massa"
  | "guelmim_oued_noun"
  | "laayoune_sakia"
  | "dakhla_oued_dahab";

export type PartnerType =
  | "law_firm"
  | "tax_advisor"
  | "real_estate"
  | "industrial_zone"
  | "recruitment"
  | "logistics"
  | "distributor"
  | "supplier"
  | "it_provider"
  | "other";

export type IncentiveType =
  | "is_exemption"
  | "is_reduced_rate"
  | "tva_exemption"
  | "customs_exemption"
  | "land_subsidy"
  | "employment_premium"
  | "training_subsidy"
  | "energy_benefit"
  | "export_support"
  | "sez_benefit"
  | "r_and_d_credit";

export type WizardStepStatus = "pending" | "in_progress" | "completed" | "blocked" | "skipped";

export type WizardStep = {
  id: string;
  title: string;
  titleFr: string;
  titleAr: string;
  description: string;
  status: WizardStepStatus;
  requiredDocuments?: string[];
  officialLink?: string;
  estimatedDays?: number;
  completedAt?: Date;
  notes?: string;
};

export type AppliedIncentive = {
  type: IncentiveType;
  label: string;
  labelFr: string;
  labelAr: string;
  value: string;
  condition: string;
  sourceArticle?: string;
  confidence: "confirmed" | "indicative" | "requires_verification";
};

export type Locale = "en" | "fr" | "ar";
