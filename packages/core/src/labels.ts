import type {
  ActivityType,
  IncentiveType,
  InvestmentBracket,
  InvestmentSector,
  InvestorOrigin,
  LegalForm,
  Locale,
  MoroccanRegion,
  PartnerType,
} from "./types.js";

// ─────────────────────────────────────────────────────────────────────────────
// Trilingual (EN/FR/AR) display labels for every enum used in the UI.
// English is primary. Use `label(MAP, value, locale)` to resolve.
// ─────────────────────────────────────────────────────────────────────────────

export type TriLabel = { en: string; fr: string; ar: string };

export function label<K extends string>(
  map: Record<K, TriLabel>,
  key: K,
  locale: Locale = "en",
): string {
  return map[key]?.[locale] ?? map[key]?.en ?? key;
}

export const SECTOR_LABELS: Record<InvestmentSector, TriLabel> = {
  automotive: { en: "Automotive", fr: "Automobile", ar: "صناعة السيارات" },
  aerospace: { en: "Aerospace", fr: "Aéronautique", ar: "صناعة الطيران" },
  renewables: { en: "Renewable energy", fr: "Énergies renouvelables", ar: "الطاقات المتجددة" },
  bpo_ites: {
    en: "BPO / Offshoring / IT",
    fr: "BPO / Offshoring / IT",
    ar: "الترحيل وخدمات تكنولوجيا المعلومات",
  },
  pharma: { en: "Pharmaceuticals", fr: "Industrie pharmaceutique", ar: "الصناعة الصيدلانية" },
  agrifood: { en: "Agri-food", fr: "Agroalimentaire", ar: "الصناعة الغذائية" },
  tourism: { en: "Tourism & hospitality", fr: "Tourisme & hôtellerie", ar: "السياحة والضيافة" },
  real_estate: { en: "Real estate", fr: "Immobilier", ar: "العقارات" },
  finance: { en: "Financial services", fr: "Services financiers", ar: "الخدمات المالية" },
  logistics: { en: "Logistics & transport", fr: "Logistique & transport", ar: "اللوجستيك والنقل" },
  tech: { en: "Tech & digital", fr: "Tech & digital", ar: "التكنولوجيا والرقمنة" },
  textile: { en: "Textile & apparel", fr: "Textile & habillement", ar: "النسيج والملابس" },
  mining: { en: "Mining & extraction", fr: "Mines & extraction", ar: "المعادن والاستخراج" },
  other: { en: "Other", fr: "Autre", ar: "أخرى" },
};

export const ACTIVITY_LABELS: Record<ActivityType, TriLabel> = {
  manufacturing: { en: "Manufacturing", fr: "Production / Fabrication", ar: "التصنيع" },
  services: { en: "Services", fr: "Services", ar: "الخدمات" },
  r_and_d: { en: "R&D", fr: "R&D", ar: "البحث والتطوير" },
  distribution: { en: "Distribution", fr: "Distribution", ar: "التوزيع" },
  headquarters: { en: "Regional HQ", fr: "Siège régional", ar: "مقر إقليمي" },
  mixed: { en: "Mixed activities", fr: "Activités mixtes", ar: "أنشطة مختلطة" },
};

export const LEGAL_FORM_LABELS: Record<LegalForm, TriLabel> = {
  sarl: { en: "SARL (limited liability)", fr: "SARL", ar: "شركة ذات مسؤولية محدودة" },
  sarlau: { en: "SARL-AU (single-member)", fr: "SARL à associé unique", ar: "ش.م.م بشريك وحيد" },
  sa: { en: "SA (public limited)", fr: "Société Anonyme", ar: "شركة مساهمة" },
  sas: { en: "SAS (simplified joint-stock)", fr: "SAS", ar: "شركة مساهمة مبسطة" },
  succursale: { en: "Branch office", fr: "Succursale", ar: "فرع" },
  bureau_de_liaison: { en: "Liaison office", fr: "Bureau de liaison", ar: "مكتب اتصال" },
};

export const BRACKET_LABELS: Record<InvestmentBracket, TriLabel> = {
  under_5m: { en: "Under 5M MAD", fr: "Moins de 5M MAD", ar: "أقل من 5 مليون درهم" },
  "5m_to_25m": { en: "5–25M MAD", fr: "5–25M MAD", ar: "5–25 مليون درهم" },
  "25m_to_100m": { en: "25–100M MAD", fr: "25–100M MAD", ar: "25–100 مليون درهم" },
  "100m_to_500m": { en: "100–500M MAD", fr: "100–500M MAD", ar: "100–500 مليون درهم" },
  over_500m: { en: "Over 500M MAD", fr: "Plus de 500M MAD", ar: "أكثر من 500 مليون درهم" },
};

export const REGION_LABELS: Record<MoroccanRegion, TriLabel> = {
  tanger_tetouan: {
    en: "Tangier-Tetouan-Al Hoceima",
    fr: "Tanger-Tétouan-Al Hoceïma",
    ar: "طنجة-تطوان-الحسيمة",
  },
  oriental: { en: "Oriental", fr: "L'Oriental", ar: "الشرق" },
  fes_meknes: { en: "Fès-Meknès", fr: "Fès-Meknès", ar: "فاس-مكناس" },
  rabat_sale: { en: "Rabat-Salé-Kénitra", fr: "Rabat-Salé-Kénitra", ar: "الرباط-سلا-القنيطرة" },
  beni_mellal: { en: "Béni Mellal-Khénifra", fr: "Béni Mellal-Khénifra", ar: "بني ملال-خنيفرة" },
  casablanca_settat: { en: "Casablanca-Settat", fr: "Casablanca-Settat", ar: "الدار البيضاء-سطات" },
  marrakech_safi: { en: "Marrakech-Safi", fr: "Marrakech-Safi", ar: "مراكش-آسفي" },
  draa_tafilalet: { en: "Drâa-Tafilalet", fr: "Drâa-Tafilalet", ar: "درعة-تافيلالت" },
  souss_massa: { en: "Souss-Massa", fr: "Souss-Massa", ar: "سوس-ماسة" },
  guelmim_oued_noun: { en: "Guelmim-Oued Noun", fr: "Guelmim-Oued Noun", ar: "كلميم-واد نون" },
  laayoune_sakia: {
    en: "Laâyoune-Sakia El Hamra",
    fr: "Laâyoune-Sakia El Hamra",
    ar: "العيون-الساقية الحمراء",
  },
  dakhla_oued_dahab: {
    en: "Dakhla-Oued Ed-Dahab",
    fr: "Dakhla-Oued Ed-Dahab",
    ar: "الداخلة-وادي الذهب",
  },
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, TriLabel> = {
  law_firm: { en: "Law firm", fr: "Cabinet d'avocats", ar: "مكتب محاماة" },
  tax_advisor: {
    en: "Tax & accounting advisor",
    fr: "Cabinet fiscal & comptable",
    ar: "مستشار ضريبي ومحاسبي",
  },
  real_estate: {
    en: "Industrial / commercial real estate",
    fr: "Immobilier industriel / commercial",
    ar: "عقارات صناعية / تجارية",
  },
  industrial_zone: {
    en: "Industrial zone operator",
    fr: "Gestionnaire de zone industrielle",
    ar: "مدبّر منطقة صناعية",
  },
  recruitment: { en: "Recruitment agency", fr: "Cabinet de recrutement", ar: "وكالة توظيف" },
  logistics: { en: "Logistics operator", fr: "Opérateur logistique", ar: "مشغّل لوجستيكي" },
  distributor: { en: "Local distributor", fr: "Distributeur local", ar: "موزّع محلي" },
  supplier: { en: "Industrial supplier", fr: "Fournisseur industriel", ar: "مورّد صناعي" },
  it_provider: {
    en: "IT / integration provider",
    fr: "Prestataire IT / intégration",
    ar: "مزوّد خدمات تكنولوجيا المعلومات",
  },
  other: { en: "Other", fr: "Autre", ar: "أخرى" },
};

export const INCENTIVE_TYPE_LABELS: Record<IncentiveType, TriLabel> = {
  is_exemption: {
    en: "Corporate tax (IS) exemption",
    fr: "Exonération de l'IS",
    ar: "إعفاء من الضريبة على الشركات",
  },
  is_reduced_rate: {
    en: "Reduced corporate tax rate",
    fr: "Taux d'IS réduit",
    ar: "نسبة مخفّضة للضريبة على الشركات",
  },
  tva_exemption: {
    en: "VAT exemption",
    fr: "Exonération de la TVA",
    ar: "إعفاء من الضريبة على القيمة المضافة",
  },
  customs_exemption: {
    en: "Customs duty exemption",
    fr: "Exonération des droits de douane",
    ar: "إعفاء من الرسوم الجمركية",
  },
  land_subsidy: { en: "Land subsidy (prime foncière)", fr: "Prime foncière", ar: "منحة عقارية" },
  employment_premium: { en: "Employment premium", fr: "Prime à l'emploi", ar: "منحة التشغيل" },
  training_subsidy: { en: "Training subsidy", fr: "Subvention à la formation", ar: "منحة التكوين" },
  energy_benefit: { en: "Energy benefit", fr: "Avantage énergétique", ar: "امتياز طاقي" },
  export_support: {
    en: "AMDIE export support",
    fr: "Soutien à l'export AMDIE",
    ar: "دعم التصدير AMDIE",
  },
  sez_benefit: {
    en: "Special economic zone benefit",
    fr: "Avantage zone économique spéciale",
    ar: "امتياز المنطقة الاقتصادية الخاصة",
  },
  r_and_d_credit: {
    en: "R&D tax credit",
    fr: "Crédit d'impôt R&D",
    ar: "ائتمان ضريبي للبحث والتطوير",
  },
};

export const ORIGIN_LABELS: Record<InvestorOrigin, TriLabel> = {
  france: { en: "France", fr: "France", ar: "فرنسا" },
  spain: { en: "Spain", fr: "Espagne", ar: "إسبانيا" },
  germany: { en: "Germany", fr: "Allemagne", ar: "ألمانيا" },
  other_europe: { en: "Other Europe", fr: "Autre Europe", ar: "أوروبا أخرى" },
  uae: { en: "United Arab Emirates", fr: "Émirats arabes unis", ar: "الإمارات العربية المتحدة" },
  saudi: { en: "Saudi Arabia", fr: "Arabie saoudite", ar: "السعودية" },
  other_gulf: { en: "Other Gulf", fr: "Autre Golfe", ar: "دول خليجية أخرى" },
  usa: { en: "United States", fr: "États-Unis", ar: "الولايات المتحدة" },
  china: { en: "China", fr: "Chine", ar: "الصين" },
  other_asia: { en: "Other Asia", fr: "Autre Asie", ar: "آسيا أخرى" },
  africa: { en: "Africa", fr: "Afrique", ar: "إفريقيا" },
  other: { en: "Other", fr: "Autre", ar: "أخرى" },
};
