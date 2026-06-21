/**
 * Istiqtab demo seed (§8).
 *
 * Idempotent: clears seeded tables then re-inserts. Runs inside an admin RLS
 * context so it works whether DATABASE_URL points at a superuser or the
 * RLS-bound `istiqtab_app` role.
 *
 *   pnpm db:seed
 *
 * Demo login: hans.schmidt@demo.istiqtab.ma / demo1234
 */
import { randomUUID } from "node:crypto";
import { REGION_LABELS } from "@istiqtab/core";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { withUserContext } from "../rls/index.js";
import {
  type NewIncentiveRule,
  type NewWizardStepTemplate,
  accounts,
  aiChatMessages,
  criRegions,
  expertBookings,
  expertProfiles,
  expertSlots,
  incentiveResults,
  incentiveRules,
  introductionRequests,
  investorDocuments,
  investorProfiles,
  notifications,
  partnerProfiles,
  sessions,
  users,
  wizardStepTemplates,
} from "../schema/index.js";

const DEMO_PASSWORD = "demo1234";

type SeedUser = {
  id: string;
  email: string;
  name: string;
  role: "investor" | "consultant" | "expert" | "partner" | "admin";
  company?: string;
  country?: string;
};

function mkUser(u: Omit<SeedUser, "id">): SeedUser {
  return { id: randomUUID(), ...u };
}

async function seed(): Promise<void> {
  const passwordHash = await argon2.hash(DEMO_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = mkUser({ email: "admin@istiqtab.ma", name: "Istiqtab Admin", role: "admin" });

  const investors = {
    hans: mkUser({
      email: "hans.schmidt@demo.istiqtab.ma",
      name: "Hans Schmidt",
      role: "investor",
      company: "Müller Automotive GmbH",
      country: "Germany",
    }),
    claire: mkUser({
      email: "claire.dubois@demo.istiqtab.ma",
      name: "Claire Dubois",
      role: "investor",
      company: "Atlas BPO Services",
      country: "France",
    }),
    khalid: mkUser({
      email: "khalid.almansoori@demo.istiqtab.ma",
      name: "Khalid Al Mansoori",
      role: "investor",
      company: "Gulf Horizon Real Estate",
      country: "United Arab Emirates",
    }),
    sarah: mkUser({
      email: "sarah.johnson@demo.istiqtab.ma",
      name: "Sarah Johnson",
      role: "investor",
      company: "SunPeak Renewables Inc.",
      country: "United States",
    }),
    pablo: mkUser({
      email: "pablo.garcia@demo.istiqtab.ma",
      name: "Pablo García",
      role: "investor",
      company: "Costa Sur Hospitality",
      country: "Spain",
    }),
  };

  const expertUsers = {
    amine: mkUser({
      email: "amine.bennani@demo.istiqtab.ma",
      name: "Amine Bennani",
      role: "expert",
    }),
    fatima: mkUser({
      email: "fatima.zahra@demo.istiqtab.ma",
      name: "Fatima Zahra El Fassi",
      role: "expert",
    }),
    youssef: mkUser({
      email: "youssef.tazi@demo.istiqtab.ma",
      name: "Youssef Tazi",
      role: "expert",
    }),
    leila: mkUser({
      email: "leila.cherkaoui@demo.istiqtab.ma",
      name: "Leila Cherkaoui",
      role: "expert",
    }),
    omar: mkUser({
      email: "omar.benjelloun@demo.istiqtab.ma",
      name: "Omar Benjelloun",
      role: "expert",
    }),
    nadia: mkUser({ email: "nadia.alaoui@demo.istiqtab.ma", name: "Nadia Alaoui", role: "expert" }),
  };

  const partnerUsers = Array.from({ length: 12 }, (_, i) =>
    mkUser({
      email: `partner${i + 1}@demo.istiqtab.ma`,
      name: `Partner Contact ${i + 1}`,
      role: "partner",
    }),
  );

  const allUsers: SeedUser[] = [
    admin,
    ...Object.values(investors),
    ...Object.values(expertUsers),
    ...partnerUsers,
  ];

  // ── CRI regions (trilingual names reused from core labels) ──────────────────
  const regionCapitals: Record<keyof typeof REGION_LABELS, string> = {
    tanger_tetouan: "Tangier",
    oriental: "Oujda",
    fes_meknes: "Fès",
    rabat_sale: "Rabat",
    beni_mellal: "Béni Mellal",
    casablanca_settat: "Casablanca",
    marrakech_safi: "Marrakech",
    draa_tafilalet: "Errachidia",
    souss_massa: "Agadir",
    guelmim_oued_noun: "Guelmim",
    laayoune_sakia: "Laâyoune",
    dakhla_oued_dahab: "Dakhla",
  };
  const regionSectors: Record<
    keyof typeof REGION_LABELS,
    (
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
      | "other"
    )[]
  > = {
    tanger_tetouan: ["automotive", "logistics", "textile"],
    oriental: ["renewables", "agrifood", "logistics"],
    fes_meknes: ["agrifood", "textile", "tourism"],
    rabat_sale: ["bpo_ites", "tech", "finance"],
    beni_mellal: ["agrifood", "renewables", "mining"],
    casablanca_settat: ["finance", "automotive", "aerospace"],
    marrakech_safi: ["tourism", "agrifood", "renewables"],
    draa_tafilalet: ["tourism", "mining", "renewables"],
    souss_massa: ["agrifood", "tourism", "renewables"],
    guelmim_oued_noun: ["renewables", "agrifood", "tourism"],
    laayoune_sakia: ["renewables", "agrifood", "mining"],
    dakhla_oued_dahab: ["renewables", "agrifood", "tourism"],
  };

  const criRows = (Object.keys(REGION_LABELS) as (keyof typeof REGION_LABELS)[]).map((region) => ({
    region,
    nameEn: REGION_LABELS[region].en,
    nameFr: REGION_LABELS[region].fr,
    nameAr: REGION_LABELS[region].ar,
    capital: regionCapitals[region],
    keySectors: regionSectors[region],
    industrialZones: [`${regionCapitals[region]} Industrial Park`, "Free Zone"],
    landPriceRange: "200–1,200 MAD/m²",
    portAccess: [
      "tanger_tetouan",
      "casablanca_settat",
      "souss_massa",
      "dakhla_oued_dahab",
      "laayoune_sakia",
    ].includes(region)
      ? "Direct deep-water port access"
      : "Inland — served by national road & rail network",
    talentPool: "Universities + OFPPT vocational centers in the region",
    criContactName: `CRI ${REGION_LABELS[region].en}`,
    criContactEmail: `contact@cri-${region.replace(/_/g, "")}.ma`,
    criContactPhone: "+212 5XX-XXXXXX",
    criWebsite: `https://www.cri-${region.replace(/_/g, "")}.ma`,
    summaryEn: `${REGION_LABELS[region].en} is a key destination for ${regionSectors[region].join(", ")} investment, anchored by ${regionCapitals[region]}.`,
    summaryFr: `${REGION_LABELS[region].fr} est une destination clé pour l'investissement, autour de ${regionCapitals[region]}.`,
    summaryAr: `${REGION_LABELS[region].ar} وجهة رئيسية للاستثمار.`,
  }));

  // ── Incentive rules (Investment Charter 2022 — DATA, not code) ──────────────
  const ruleRows: NewIncentiveRule[] = [
    {
      incentiveType: "is_exemption" as const,
      label: "Corporate tax (IS) exemption — 5 years",
      labelFr: "Exonération de l'IS — 5 ans",
      labelAr: "إعفاء من الضريبة على الشركات — 5 سنوات",
      value: "5 years full IS exemption",
      condition: "Newly created industrial company, investment ≥ 25M MAD",
      sourceArticle: "Charter 2022, Art. 6",
      confidence: "indicative" as const,
      brackets: ["25m_to_100m", "100m_to_500m", "over_500m"],
      priority: 100,
    },
    {
      incentiveType: "is_reduced_rate" as const,
      label: "Reduced IS rate after exemption",
      labelFr: "Taux d'IS réduit après exonération",
      labelAr: "نسبة مخفّضة بعد الإعفاء",
      value: "20% IS rate post-exemption",
      condition: "Applies after the initial exemption period",
      sourceArticle: "Charter 2022, Art. 6",
      confidence: "indicative" as const,
      priority: 90,
    },
    {
      incentiveType: "tva_exemption" as const,
      label: "VAT exemption on capital equipment",
      labelFr: "Exonération de TVA sur biens d'équipement",
      labelAr: "إعفاء من الضريبة على القيمة المضافة للمعدات",
      value: "VAT exemption on imported equipment (36 months)",
      condition: "Manufacturing or mixed activity importing production equipment",
      sourceArticle: "CGI Art. 123",
      confidence: "indicative" as const,
      activityTypes: ["manufacturing", "mixed"],
      priority: 80,
    },
    {
      incentiveType: "customs_exemption" as const,
      label: "Customs duty exemption on equipment",
      labelFr: "Exonération des droits de douane sur équipements",
      labelAr: "إعفاء من الرسوم الجمركية على المعدات",
      value: "Import duty exemption on production equipment",
      condition: "Manufacturing investment under an investment agreement",
      sourceArticle: "Charter 2022, Art. 7",
      confidence: "indicative" as const,
      activityTypes: ["manufacturing"],
      priority: 75,
    },
    {
      incentiveType: "land_subsidy" as const,
      label: "Land subsidy (prime foncière)",
      labelFr: "Prime foncière",
      labelAr: "منحة عقارية",
      value: "Up to 30% of land cost covered by the State",
      condition: "Manufacturing project on an eligible industrial zone",
      sourceArticle: "Charter 2022 — main support, Art. 4",
      confidence: "requires_verification" as const,
      activityTypes: ["manufacturing"],
      priority: 70,
    },
    {
      incentiveType: "employment_premium" as const,
      label: "Employment premium (prime à l'emploi)",
      labelFr: "Prime à l'emploi",
      labelAr: "منحة التشغيل",
      value: "Premium per stable job created (region-dependent)",
      condition: "At least 50 stable jobs created",
      sourceArticle: "Charter 2022 — common bonus",
      confidence: "indicative" as const,
      minJobs: 50,
      priority: 65,
    },
    {
      incentiveType: "energy_benefit" as const,
      label: "Green energy priority access",
      labelFr: "Accès prioritaire à l'énergie verte",
      labelAr: "أولوية الولوج للطاقة الخضراء",
      value: "Priority grid access + tariff reduction",
      condition: "Renewable energy projects",
      sourceArticle: "Law 13-09",
      confidence: "indicative" as const,
      sectors: ["renewables"],
      priority: 60,
    },
    {
      incentiveType: "export_support" as const,
      label: "AMDIE export support",
      labelFr: "Soutien à l'export AMDIE",
      labelAr: "دعم التصدير AMDIE",
      value: "Export market access programs & co-financing",
      condition: "Export-oriented activity",
      sourceArticle: "AMDIE programs",
      confidence: "indicative" as const,
      priority: 50,
    },
    {
      incentiveType: "sez_benefit" as const,
      label: "Special economic zone benefits",
      labelFr: "Avantages zone économique spéciale",
      labelAr: "امتيازات المنطقة الاقتصادية الخاصة",
      value: "Reduced IS, customs facilitation in designated zones",
      condition: "Located in a free/accelerated industrial zone",
      sourceArticle: "Law 19-94 (free zones)",
      confidence: "requires_verification" as const,
      regions: ["tanger_tetouan", "casablanca_settat", "souss_massa"],
      priority: 55,
    },
    {
      incentiveType: "r_and_d_credit" as const,
      label: "R&D support",
      labelFr: "Soutien R&D",
      labelAr: "دعم البحث والتطوير",
      value: "Innovation & R&D co-funding (MEN/CNRST programs)",
      condition: "R&D or mixed activity",
      sourceArticle: "Charter 2022 — strategic bonus",
      confidence: "indicative" as const,
      activityTypes: ["r_and_d", "mixed"],
      priority: 45,
    },
  ];

  // ── Wizard step templates ───────────────────────────────────────────────────
  const stepRows: NewWizardStepTemplate[] = [
    {
      key: "rc_registration",
      titleEn: "Register with the Commercial Registry (RC)",
      titleFr: "Inscription au Registre de Commerce (RC)",
      titleAr: "التسجيل في السجل التجاري",
      descriptionEn: "File with the Tribunal de Commerce to obtain your RC number.",
      descriptionFr: "Déposer au Tribunal de Commerce pour obtenir votre numéro RC.",
      descriptionAr: "الإيداع لدى المحكمة التجارية للحصول على رقم السجل التجاري.",
      officialLink: "https://www.mahakim.ma",
      estimatedDays: 7,
      requiredDocuments: ["Statuts", "Certificat négatif"],
      orderIndex: 1,
    },
    {
      key: "ice_registration",
      titleEn: "Obtain the ICE identifier",
      titleFr: "Obtenir l'Identifiant Commun de l'Entreprise (ICE)",
      titleAr: "الحصول على المعرّف الموحد للمقاولة",
      descriptionEn: "Register with the DGI to obtain your unique company identifier (ICE).",
      descriptionFr: "S'enregistrer auprès de la DGI pour obtenir l'ICE.",
      descriptionAr: "التسجيل لدى المديرية العامة للضرائب للحصول على المعرّف.",
      officialLink: "https://www.tax.gov.ma",
      estimatedDays: 3,
      requiredDocuments: ["RC", "Statuts"],
      orderIndex: 2,
    },
    {
      key: "cnss_registration",
      titleEn: "Register with the CNSS",
      titleFr: "Affiliation à la CNSS",
      titleAr: "التسجيل في الصندوق الوطني للضمان الاجتماعي",
      descriptionEn: "Affiliate your company and employees with social security (CNSS).",
      descriptionFr: "Affilier l'entreprise et les salariés à la sécurité sociale (CNSS).",
      descriptionAr: "تسجيل الشركة والموظفين في الضمان الاجتماعي.",
      officialLink: "https://www.cnss.ma",
      estimatedDays: 5,
      requiredDocuments: ["RC", "ICE"],
      orderIndex: 3,
    },
    {
      key: "bank_account",
      titleEn: "Open a corporate bank account",
      titleFr: "Ouvrir un compte bancaire professionnel",
      titleAr: "فتح حساب بنكي مهني",
      descriptionEn: "Open a business account enabling international transfers.",
      descriptionFr: "Ouvrir un compte permettant les virements internationaux.",
      descriptionAr: "فتح حساب يتيح التحويلات الدولية.",
      estimatedDays: 5,
      requiredDocuments: ["RC", "ICE", "Statuts"],
      orderIndex: 4,
    },
    {
      key: "sector_license",
      titleEn: "Obtain sector-specific licenses",
      titleFr: "Obtenir les licences sectorielles",
      titleAr: "الحصول على التراخيص القطاعية",
      descriptionEn:
        "Depending on your sector (ONSSA, ANRT, AMEE…), obtain the required authorizations.",
      descriptionFr:
        "Selon votre secteur (ONSSA, ANRT, AMEE…), obtenir les autorisations requises.",
      descriptionAr: "حسب القطاع، الحصول على التراخيص اللازمة.",
      estimatedDays: 30,
      requiredDocuments: [],
      appliesToActivities: ["manufacturing", "services", "mixed"],
      orderIndex: 5,
    },
    {
      key: "work_permits",
      titleEn: "Work permits for foreign staff",
      titleFr: "Permis de travail pour le personnel étranger",
      titleAr: "رخص العمل للموظفين الأجانب",
      descriptionEn: "Process ANAPEC validation and work permits for expatriate employees.",
      descriptionFr: "Traiter la validation ANAPEC et les permis pour les expatriés.",
      descriptionAr: "معالجة مصادقة ANAPEC ورخص العمل للأجانب.",
      officialLink: "https://www.anapec.org",
      estimatedDays: 21,
      requiredDocuments: ["Contrat de travail"],
      orderIndex: 6,
    },
  ];

  // ── Write everything under an admin RLS context ─────────────────────────────
  await withUserContext(db, "seed-script", "admin", async (tx) => {
    // Clear (children first; users cascade to most profile tables).
    await tx.delete(expertBookings);
    await tx.delete(expertSlots);
    await tx.delete(introductionRequests);
    await tx.delete(incentiveResults);
    await tx.delete(aiChatMessages);
    await tx.delete(investorDocuments);
    await tx.delete(notifications);
    await tx.delete(investorProfiles);
    await tx.delete(partnerProfiles);
    await tx.delete(expertProfiles);
    await tx.delete(incentiveRules);
    await tx.delete(wizardStepTemplates);
    await tx.delete(criRegions);
    await tx.delete(accounts);
    await tx.delete(sessions);
    await tx.delete(users);

    await tx.insert(users).values(
      allUsers.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
        company: u.company ?? null,
        country: u.country ?? null,
        emailVerified: new Date(),
        preferredLanguage: "en" as const,
        isActive: true,
      })),
    );

    const investorRows = await tx
      .insert(investorProfiles)
      .values([
        {
          userId: investors.hans.id,
          companyName: "Müller Automotive GmbH",
          companyCountry: "germany",
          sector: "automotive",
          activityType: "manufacturing",
          investmentBracket: "100m_to_500m",
          targetRegions: ["tanger_tetouan", "casablanca_settat"],
          jobsToCreate: 350,
          preferredLegalForm: "sarl",
        },
        {
          userId: investors.claire.id,
          companyName: "Atlas BPO Services",
          companyCountry: "france",
          sector: "bpo_ites",
          activityType: "services",
          investmentBracket: "25m_to_100m",
          targetRegions: ["rabat_sale", "casablanca_settat"],
          jobsToCreate: 600,
          preferredLegalForm: "sa",
        },
        {
          userId: investors.khalid.id,
          companyName: "Gulf Horizon Real Estate",
          companyCountry: "uae",
          sector: "real_estate",
          activityType: "mixed",
          investmentBracket: "100m_to_500m",
          targetRegions: ["marrakech_safi", "casablanca_settat"],
          jobsToCreate: 120,
          preferredLegalForm: "sa",
        },
        {
          userId: investors.sarah.id,
          companyName: "SunPeak Renewables Inc.",
          companyCountry: "usa",
          sector: "renewables",
          activityType: "manufacturing",
          investmentBracket: "over_500m",
          targetRegions: ["souss_massa", "dakhla_oued_dahab"],
          jobsToCreate: 450,
          preferredLegalForm: "sa",
        },
        {
          userId: investors.pablo.id,
          companyName: "Costa Sur Hospitality",
          companyCountry: "spain",
          sector: "tourism",
          activityType: "services",
          investmentBracket: "25m_to_100m",
          targetRegions: ["marrakech_safi", "souss_massa"],
          jobsToCreate: 200,
          preferredLegalForm: "sarl",
        },
      ])
      .returning();

    const expertRows = await tx
      .insert(expertProfiles)
      .values([
        {
          userId: expertUsers.amine.id,
          name: "Amine Bennani",
          title: "Investment lawyer — corporate setup",
          specializations: ["automotive", "aerospace", "logistics"],
          languages: ["en", "fr", "ar"],
          hourlyRateMAD: 1500,
          hourlyRateEUR: 140,
          bio: "20 years advising foreign manufacturers on company setup and Investment Charter agreements.",
          verified: true,
          avgRating: 4.9,
          sessionCount: 64,
        },
        {
          userId: expertUsers.fatima.id,
          name: "Fatima Zahra El Fassi",
          title: "Investment lawyer — M&A and JV",
          specializations: ["finance", "real_estate", "tech"],
          languages: ["en", "fr"],
          hourlyRateMAD: 1800,
          hourlyRateEUR: 170,
          bio: "Specialist in joint ventures and foreign ownership structuring across regulated sectors.",
          verified: true,
          avgRating: 4.8,
          sessionCount: 41,
        },
        {
          userId: expertUsers.youssef.id,
          name: "Youssef Tazi",
          title: "Tax advisor — Charter incentives",
          specializations: ["agrifood", "automotive", "textile"],
          languages: ["en", "fr", "ar"],
          hourlyRateMAD: 1200,
          hourlyRateEUR: 115,
          bio: "Former Big Four tax partner; optimizes IS/TVA exemptions under the 2022 Charter.",
          verified: true,
          avgRating: 4.7,
          sessionCount: 88,
        },
        {
          userId: expertUsers.leila.id,
          name: "Leila Cherkaoui",
          title: "Industrial real estate specialist",
          specializations: ["real_estate", "logistics", "automotive"],
          languages: ["en", "fr"],
          hourlyRateMAD: 1000,
          hourlyRateEUR: 95,
          bio: "Sources industrial land and free-zone plots near Tangier Med and Casablanca.",
          verified: true,
          avgRating: 4.6,
          sessionCount: 33,
        },
        {
          userId: expertUsers.omar.id,
          name: "Omar Benjelloun",
          title: "Ex-AMDIE official — FDI facilitation",
          specializations: ["renewables", "bpo_ites", "pharma"],
          languages: ["en", "fr", "ar"],
          hourlyRateMAD: 2000,
          hourlyRateEUR: 190,
          bio: "15 years at AMDIE; deep network across the 12 CRIs and the interministerial commission.",
          verified: true,
          avgRating: 5.0,
          sessionCount: 52,
        },
        {
          userId: expertUsers.nadia.id,
          name: "Nadia Alaoui",
          title: "Automotive supply-chain specialist",
          specializations: ["automotive", "aerospace"],
          languages: ["en", "fr"],
          hourlyRateMAD: 1300,
          hourlyRateEUR: 125,
          bio: "Advises tier-1/tier-2 suppliers entering the Tangier and Kenitra automotive clusters.",
          verified: true,
          avgRating: 4.8,
          sessionCount: 29,
        },
      ])
      .returning();

    // ─── Expert availability slots + one demo booking ────────────────────────
    // Future slots (UTC) for the first three experts so the directory has
    // something bookable. Times are anchored to "now" so seeds never go stale.
    const dayMs = 86_400_000;
    const at = (daysAhead: number, hourUtc: number, minutes = 0) => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      return new Date(d.getTime() + daysAhead * dayMs + hourUtc * 3_600_000 + minutes * 60_000);
    };

    const slotValues = expertRows.slice(0, 3).flatMap((e, i) => [
      { expertId: e.id, start: at(3 + i, 9), dur: 30 as const },
      { expertId: e.id, start: at(3 + i, 11), dur: 60 as const },
      { expertId: e.id, start: at(7 + i, 14), dur: 30 as const },
    ]);

    const slotRows = await tx
      .insert(expertSlots)
      .values(
        slotValues.map((s) => ({
          expertId: s.expertId,
          startTime: s.start,
          endTime: new Date(s.start.getTime() + s.dur * 60_000),
          durationMinutes: s.dur,
        })),
      )
      .returning();

    // Demo booking: Hans (German automotive investor) books Amine's first slot.
    const demoSlot = slotRows[0];
    if (demoSlot && investorRows[0] && expertRows[0]) {
      await tx
        .update(expertSlots)
        .set({ booked: true, bookedByUserId: investors.hans.id })
        .where(eq(expertSlots.id, demoSlot.id));
      await tx.insert(expertBookings).values({
        slotId: demoSlot.id,
        investorId: investorRows[0].id,
        expertId: expertRows[0].id,
        status: "confirmed",
        meetingUrl: `https://meet.jit.si/istiqtab-${demoSlot.id}`,
      });
    }

    const partnerSpecs: {
      type:
        | "law_firm"
        | "tax_advisor"
        | "real_estate"
        | "recruitment"
        | "distributor"
        | "logistics";
      company: string;
    }[] = [
      { type: "law_firm", company: "Bennani & Associés" },
      { type: "law_firm", company: "Maghreb Legal Partners" },
      { type: "law_firm", company: "Tangier Corporate Counsel" },
      { type: "tax_advisor", company: "Atlas Fiscalité Conseil" },
      { type: "tax_advisor", company: "Casablanca Tax Advisors" },
      { type: "real_estate", company: "Med Industrial Estates" },
      { type: "real_estate", company: "Souss Land & Zones" },
      { type: "recruitment", company: "Talent Maroc Recruitment" },
      { type: "recruitment", company: "Nearshore Staffing Co." },
      { type: "distributor", company: "Atlas Distribution Network" },
      { type: "distributor", company: "Sahara Trade Partners" },
      { type: "logistics", company: "TangierMed Logistics" },
    ];

    const partnerRows = await tx
      .insert(partnerProfiles)
      .values(
        partnerSpecs.map((p, i) => ({
          userId: partnerUsers[i]?.id,
          companyName: p.company,
          ice: `00${1000 + i}`,
          partnerType: p.type,
          sectors: ["automotive", "agrifood", "logistics"] as (
            | "automotive"
            | "agrifood"
            | "logistics"
          )[],
          regions: ["tanger_tetouan", "casablanca_settat"] as (
            | "tanger_tetouan"
            | "casablanca_settat"
          )[],
          languages: ["en", "fr", "ar"] as ("en" | "fr" | "ar")[],
          description: `${p.company} supports international investors with ${p.type.replace(/_/g, " ")} services across Morocco.`,
          verified: i % 2 === 0,
          avgRating: 4 + (i % 10) / 10,
          reviewCount: 5 + i,
        })),
      )
      .returning();

    await tx.insert(criRegions).values(criRows);
    await tx.insert(incentiveRules).values(ruleRows);
    await tx.insert(wizardStepTemplates).values(stepRows);

    // One saved incentive calculation per investor profile (§8 demo data).
    // Indicative snapshots — the Sprint 3 rule engine will recompute from
    // incentive_rules; every line stays "requires_verification" per the
    // no-financial-advice boundary (§11 / non-negotiable #1).
    await tx.insert(incentiveResults).values(
      investorRows.map((p) => ({
        investorId: p.id,
        sector: p.sector,
        region: p.targetRegions[0] ?? "casablanca_settat",
        investmentBracket: p.investmentBracket,
        activityType: p.activityType,
        jobsToCreate: p.jobsToCreate ?? 0,
        applicableIncentives: [
          {
            type: "is_exemption" as const,
            label: "Corporate tax (IS) exemption",
            labelFr: "Exonération de l'IS",
            labelAr: "إعفاء من الضريبة على الشركات",
            value: "5 years full IS exemption, then reduced rate",
            condition: `Investment in the ${p.sector} sector under the 2022 Charter`,
            sourceArticle: "Charte de l'investissement 2022, art. 6",
            confidence: "requires_verification" as const,
          },
          {
            type: "customs_exemption" as const,
            label: "Customs duty exemption on equipment",
            labelFr: "Exonération des droits de douane sur les équipements",
            labelAr: "إعفاء من الرسوم الجمركية على المعدات",
            value: "0% on imported production equipment",
            condition: `${p.activityType} activity importing capital goods`,
            sourceArticle: "Charte de l'investissement 2022, art. 7",
            confidence: "requires_verification" as const,
          },
          {
            type: "employment_premium" as const,
            label: "Employment premium",
            labelFr: "Prime à l'emploi",
            labelAr: "منحة التشغيل",
            value: `Indicative premium for ~${p.jobsToCreate ?? 0} jobs created`,
            condition: "Net stable jobs created within the investment programme",
            sourceArticle: "Charte de l'investissement 2022, prime commune",
            confidence: "requires_verification" as const,
          },
        ],
        totalEstimatedBenefit: "Indicative — confirm final figures with your CRI",
      })),
    );

    // Demo introduction requests (investor → partner), one per status, all to
    // verified partners (even indices). Showcases the admin mediation queue.
    const verifiedPartners = partnerRows.filter((p) => p.verified);
    await tx.insert(introductionRequests).values([
      {
        investorId: investorRows[0]?.id,
        partnerId: verifiedPartners[0]?.id,
        message:
          "We are setting up an automotive parts plant near Tangier and need legal support for company registration (SARL) and industrial land lease.",
        status: "pending",
      },
      {
        investorId: investorRows[1]?.id,
        partnerId: verifiedPartners[1]?.id,
        message:
          "Looking for a recruitment partner to staff a 200-seat BPO centre in Casablanca with French/English speakers.",
        status: "accepted",
      },
      {
        investorId: investorRows[2]?.id,
        partnerId: verifiedPartners[2]?.id,
        message:
          "Need industrial real estate advisory for a logistics hub close to Tanger Med port.",
        status: "completed",
      },
    ]);
  });

  const counts = await db.select().from(users);
  console.log(
    `Seed complete — ${counts.length} users, ${criRows.length} CRI regions, ${ruleRows.length} incentive rules, ${stepRows.length} wizard steps, 5 saved incentive calculations.`,
  );
  console.log("Demo login: hans.schmidt@demo.istiqtab.ma / demo1234");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
