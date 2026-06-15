import type {
  ActivityType,
  InvestmentBracket,
  InvestmentSector,
  InvestorOrigin,
  LegalForm,
  MoroccanRegion,
  WizardStep,
} from "@istiqtab/core";

// ─────────────────────────────────────────────────────────────────────────────
// Setup wizard — personalized checklist generator.
//
// Pure, deterministic function: a foreign investor's profile in, an ordered
// list of WizardStep[] out. Branches on legal form, sector, activity, region,
// and investment size. No DB, no I/O — fully unit-testable (golden files).
//
// Official links are the public Moroccan government portals for each step.
// They are indicative entry points; the CRI single window remains the
// authoritative coordinator for the investor's actual file.
// ─────────────────────────────────────────────────────────────────────────────

/** The subset of an investor profile that drives checklist generation. */
export type WizardProfileInput = {
  sector: InvestmentSector;
  activityType: ActivityType;
  investmentBracket: InvestmentBracket;
  targetRegions: MoroccanRegion[];
  companyCountry: InvestorOrigin;
  jobsToCreate?: number | null;
  preferredLegalForm?: LegalForm | null;
};

type StepSeed = Omit<WizardStep, "status">;

/** Legal forms that incorporate a Moroccan company (vs. a foreign-entity presence). */
const INCORPORATED_FORMS: ReadonlySet<LegalForm> = new Set<LegalForm>([
  "sarl",
  "sa",
  "sas",
  "sarlau",
]);

/** Brackets that trigger a State investment agreement (Charter 2022 main support). */
const AGREEMENT_BRACKETS: ReadonlySet<InvestmentBracket> = new Set<InvestmentBracket>([
  "100m_to_500m",
  "over_500m",
]);

const MANUFACTURING_ACTIVITIES: ReadonlySet<ActivityType> = new Set<ActivityType>([
  "manufacturing",
  "mixed",
]);

// ── Core steps every investor goes through ───────────────────────────────────

const CRI_REGISTRATION: StepSeed = {
  id: "cri_registration",
  title: "Open your file with the Regional Investment Centre (CRI)",
  titleFr: "Ouvrez votre dossier auprès du Centre Régional d'Investissement (CRI)",
  titleAr: "افتح ملفك لدى المركز الجهوي للاستثمار",
  description:
    "Contact the CRI for your target region. The CRI single window coordinates company creation and your access to Investment Charter incentives.",
  officialLink: "https://www.cri-invest.ma",
  estimatedDays: 3,
};

const CERTIFICAT_NEGATIF: StepSeed = {
  id: "certificat_negatif",
  title: "Reserve your company name (Certificat Négatif)",
  titleFr: "Réservez la dénomination sociale (Certificat Négatif)",
  titleAr: "احجز التسمية التجارية (الشهادة السلبية)",
  description:
    "Request a Certificat Négatif from OMPIC to reserve a unique company name. Required before registering the company.",
  officialLink: "https://www.ompic.ma",
  estimatedDays: 2,
  requiredDocuments: ["passport"],
};

const capitalDeposit = (form: LegalForm): StepSeed => ({
  id: "capital_deposit",
  title: "Deposit share capital & obtain the blocking certificate",
  titleFr: "Déposez le capital social et obtenez l'attestation de blocage",
  titleAr: "إيداع رأس المال والحصول على شهادة التجميد",
  description:
    form === "sa" || form === "sas"
      ? "Deposit the share capital (minimum 300,000 MAD for an SA) at a Moroccan bank and obtain the attestation de blocage."
      : "Deposit the share capital at a Moroccan bank and obtain the attestation de blocage (no statutory minimum for an SARL).",
  officialLink: "https://www.bkam.ma",
  estimatedDays: 5,
  requiredDocuments: ["passport", "project_memo"],
});

const RC_REGISTRATION: StepSeed = {
  id: "rc_registration",
  title: "Register with the Commercial Register (RC)",
  titleFr: "Immatriculez au Registre de Commerce (RC)",
  titleAr: "التسجيل في السجل التجاري",
  description:
    "File the company statutes with the Tribunal de Commerce (via the CRI) to obtain your Registre de Commerce number.",
  officialLink: "https://www.justice.gov.ma",
  estimatedDays: 7,
  requiredDocuments: ["company_reg", "passport"],
};

const ICE_REGISTRATION: StepSeed = {
  id: "ice_registration",
  title: "Obtain your Common Enterprise Identifier (ICE)",
  titleFr: "Obtenez l'Identifiant Commun de l'Entreprise (ICE)",
  titleAr: "احصل على المعرف الموحد للمقاولة",
  description:
    "The ICE is the single identifier used across all administrations. It is issued alongside registration via the DGI.",
  officialLink: "https://www.tax.gov.ma",
  estimatedDays: 2,
};

const TAX_REGISTRATION: StepSeed = {
  id: "tax_registration",
  title: "Register for tax (IS, TVA & Taxe Professionnelle)",
  titleFr: "Immatriculation fiscale (IS, TVA & Taxe Professionnelle)",
  titleAr: "التسجيل الضريبي (الضريبة على الشركات والقيمة المضافة)",
  description:
    "Register with the Direction Générale des Impôts for corporate income tax (IS), VAT (TVA), and the professional tax.",
  officialLink: "https://www.tax.gov.ma",
  estimatedDays: 3,
};

const CNSS_REGISTRATION: StepSeed = {
  id: "cnss_registration",
  title: "Register with social security (CNSS)",
  titleFr: "Affiliation à la sécurité sociale (CNSS)",
  titleAr: "التسجيل في الصندوق الوطني للضمان الاجتماعي",
  description:
    "Affiliate the company and declare employees with the Caisse Nationale de Sécurité Sociale. Mandatory before hiring.",
  officialLink: "https://www.cnss.ma",
  estimatedDays: 3,
};

const BANK_ACCOUNT: StepSeed = {
  id: "bank_account",
  title: "Open an operating bank account",
  titleFr: "Ouvrez un compte bancaire opérationnel",
  titleAr: "افتح حسابًا بنكيًا تشغيليًا",
  description:
    "Open a corporate account with a bank experienced in foreign investment and convertible-account regimes for repatriating profits.",
  officialLink: "https://www.bkam.ma",
  estimatedDays: 5,
};

const investmentAgreement = (bracket: InvestmentBracket): StepSeed => ({
  id: "investment_agreement",
  title: "Negotiate your State investment agreement (Convention)",
  titleFr: "Négociez votre convention d'investissement avec l'État",
  titleAr: "التفاوض على اتفاقية الاستثمار مع الدولة",
  description:
    bracket === "over_500m"
      ? "Projects above 500M MAD are reviewed by the Commission Nationale des Investissements. Negotiate the investment agreement unlocking Charter main support."
      : "Sign an investment agreement with the State (via AMDIE/CRI) to secure the Investment Charter main support premiums for your project.",
  officialLink: "https://www.amdie.gov.ma",
  estimatedDays: 60,
  requiredDocuments: ["project_memo", "financial_statement"],
});

const WORK_PERMITS: StepSeed = {
  id: "work_permits",
  title: "Arrange work permits for foreign staff (ANAPEC / TAECTRA)",
  titleFr: "Permis de travail pour le personnel étranger (ANAPEC / TAECTRA)",
  titleAr: "تصاريح العمل للموظفين الأجانب",
  description:
    "Foreign employment contracts must be validated via the TAECTRA platform after an ANAPEC labour-market check. Required for each foreign hire.",
  officialLink: "https://taectra.emploi.gov.ma",
  estimatedDays: 30,
  requiredDocuments: ["passport"],
};

// ── Conditional: manufacturing footprint ─────────────────────────────────────

const ENVIRONMENTAL_ASSESSMENT: StepSeed = {
  id: "environmental_assessment",
  title: "Obtain environmental acceptability (EIE)",
  titleFr: "Obtenez l'acceptabilité environnementale (EIE)",
  titleAr: "الحصول على القبول البيئي (دراسة التأثير)",
  description:
    "Industrial projects require an Étude d'Impact sur l'Environnement and an environmental acceptability decision before operating.",
  officialLink: "https://www.environnement.gov.ma",
  estimatedDays: 45,
  requiredDocuments: ["project_memo"],
};

const INDUSTRIAL_LAND: StepSeed = {
  id: "industrial_land",
  title: "Secure industrial land or premises",
  titleFr: "Sécurisez un terrain ou local industriel",
  titleAr: "تأمين أرض أو مقر صناعي",
  description:
    "Acquire or lease a plot in an industrial zone (e.g. an integrated industrial platform) in your target region. The CRI can map available zones and prime foncière eligibility.",
  officialLink: "https://www.cri-invest.ma",
  estimatedDays: 30,
};

// ── Conditional: sector-specific licence ─────────────────────────────────────

/** Sector → regulator licence step. Returns null where no sector licence applies. */
function sectorLicenceStep(sector: InvestmentSector): StepSeed | null {
  switch (sector) {
    case "agrifood":
      return {
        id: "sector_license_onssa",
        title: "Obtain ONSSA sanitary authorization",
        titleFr: "Obtenez l'agrément sanitaire ONSSA",
        titleAr: "الحصول على الترخيص الصحي من المكتب الوطني للسلامة الغذائية",
        description:
          "Food-production and processing units require a sanitary authorization from ONSSA before placing products on the market.",
        officialLink: "https://www.onssa.gov.ma",
        estimatedDays: 30,
      };
    case "pharma":
      return {
        id: "sector_license_pharma",
        title: "Obtain pharmaceutical establishment authorization",
        titleFr: "Obtenez l'autorisation d'établissement pharmaceutique",
        titleAr: "الحصول على ترخيص المؤسسة الصيدلانية",
        description:
          "Pharmaceutical manufacturing requires authorization from the Direction du Médicament et de la Pharmacie (Ministry of Health).",
        officialLink: "https://www.sante.gov.ma",
        estimatedDays: 60,
      };
    case "renewables":
      return {
        id: "sector_license_energy",
        title: "Obtain energy-production authorization (ANRE / Ministry of Energy)",
        titleFr: "Obtenez l'autorisation de production d'énergie (ANRE)",
        titleAr: "الحصول على ترخيص إنتاج الطاقة",
        description:
          "Renewable-energy generation requires authorization under Law 13-09 from the energy regulator (ANRE) and the Ministry of Energy Transition.",
        officialLink: "https://www.anre.ma",
        estimatedDays: 60,
      };
    case "bpo_ites":
    case "tech":
      return {
        id: "sector_license_cndp",
        title: "Declare personal-data processing to the CNDP",
        titleFr: "Déclarez le traitement de données personnelles à la CNDP",
        titleAr: "التصريح بمعالجة المعطيات الشخصية لدى الهيئة الوطنية",
        description:
          "Processing personal data (offshoring, BPO, digital services) requires a declaration or authorization from the CNDP under Law 09-08.",
        officialLink: "https://www.cndp.ma",
        estimatedDays: 30,
      };
    case "finance":
      return {
        id: "sector_license_finance",
        title: "Obtain financial-sector approval (Bank Al-Maghrib / AMMC / ACAPS)",
        titleFr: "Obtenez l'agrément du secteur financier (BAM / AMMC / ACAPS)",
        titleAr: "الحصول على اعتماد القطاع المالي",
        description:
          "Banking, capital-markets and insurance activities are regulated and require prior approval from the relevant authority.",
        officialLink: "https://www.bkam.ma",
        estimatedDays: 90,
      };
    case "mining":
      return {
        id: "sector_license_mining",
        title: "Obtain a mining permit (ONHYM)",
        titleFr: "Obtenez un permis minier (ONHYM)",
        titleAr: "الحصول على رخصة منجمية",
        description:
          "Mining and extraction activities require exploration/exploitation permits under the Mining Code, coordinated with ONHYM.",
        officialLink: "https://www.onhym.com",
        estimatedDays: 90,
      };
    case "tourism":
      return {
        id: "sector_license_tourism",
        title: "Obtain tourism establishment classification",
        titleFr: "Obtenez le classement de l'établissement touristique",
        titleAr: "الحصول على تصنيف المؤسسة السياحية",
        description:
          "Hotels and tourist accommodation must be classified by the Ministry of Tourism before operating.",
        officialLink: "https://www.mtataes.gov.ma",
        estimatedDays: 45,
      };
    default:
      return null;
  }
}

/**
 * Generate the personalized setup checklist for an investor profile.
 * Steps are returned in chronological order, all with status "pending".
 */
export function generateWizardSteps(input: WizardProfileInput): WizardStep[] {
  const form = input.preferredLegalForm ?? null;
  const incorporates = form !== null && INCORPORATED_FORMS.has(form);
  const isManufacturing = MANUFACTURING_ACTIVITIES.has(input.activityType);

  const seeds: StepSeed[] = [CRI_REGISTRATION, CERTIFICAT_NEGATIF];

  if (incorporates && form) {
    seeds.push(capitalDeposit(form));
  }

  seeds.push(RC_REGISTRATION, ICE_REGISTRATION, TAX_REGISTRATION, CNSS_REGISTRATION, BANK_ACCOUNT);

  if (AGREEMENT_BRACKETS.has(input.investmentBracket)) {
    seeds.push(investmentAgreement(input.investmentBracket));
  }

  const licence = sectorLicenceStep(input.sector);
  if (licence) {
    seeds.push(licence);
  }

  if (isManufacturing) {
    seeds.push(ENVIRONMENTAL_ASSESSMENT, INDUSTRIAL_LAND);
  }

  // Foreign investors almost always relocate at least some staff.
  seeds.push(WORK_PERMITS);

  return seeds.map((seed) => ({ ...seed, status: "pending" as const }));
}

/** The id of the first step the investor should act on (first non-completed). */
export function firstActiveStepId(steps: WizardStep[]): string | undefined {
  return steps.find((s) => s.status !== "completed" && s.status !== "skipped")?.id;
}

/** Completed-vs-total progress, ignoring skipped steps from the denominator. */
export function wizardProgress(steps: WizardStep[]): {
  completed: number;
  total: number;
  percent: number;
} {
  const counted = steps.filter((s) => s.status !== "skipped");
  const completed = counted.filter((s) => s.status === "completed").length;
  const total = counted.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}
