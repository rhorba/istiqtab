import { LocaleSchema } from "@istiqtab/core";
import { describe, expect, it } from "vitest";
import {
  type WizardProfileInput,
  firstActiveStepId,
  generateWizardSteps,
  wizardProgress,
} from "../generate.js";

const VALID_DOC_TYPES = new Set([
  "passport",
  "company_reg",
  "financial_statement",
  "project_memo",
  "other",
]);

// ── Demo personas (CLAUDE.md §8) → expected ordered step ids (golden) ─────────

type Persona = { name: string; input: WizardProfileInput; expected: string[] };

// Reused below by the progress-tracking suite.
const FRENCH_BPO_INPUT: WizardProfileInput = {
  sector: "bpo_ites",
  activityType: "services",
  investmentBracket: "5m_to_25m",
  targetRegions: ["casablanca_settat"],
  companyCountry: "france",
  jobsToCreate: 150,
  preferredLegalForm: "sarl",
};

const PERSONAS: Persona[] = [
  {
    name: "German automotive — manufacturing, 100–500M, SARL",
    input: {
      sector: "automotive",
      activityType: "manufacturing",
      investmentBracket: "100m_to_500m",
      targetRegions: ["tanger_tetouan"],
      companyCountry: "germany",
      jobsToCreate: 400,
      preferredLegalForm: "sarl",
    },
    expected: [
      "cri_registration",
      "certificat_negatif",
      "capital_deposit",
      "rc_registration",
      "ice_registration",
      "tax_registration",
      "cnss_registration",
      "bank_account",
      "investment_agreement",
      "environmental_assessment",
      "industrial_land",
      "work_permits",
    ],
  },
  {
    name: "French BPO — services, 5–25M, SARL",
    input: FRENCH_BPO_INPUT,
    expected: [
      "cri_registration",
      "certificat_negatif",
      "capital_deposit",
      "rc_registration",
      "ice_registration",
      "tax_registration",
      "cnss_registration",
      "bank_account",
      "sector_license_cndp",
      "work_permits",
    ],
  },
  {
    name: "UAE real estate — services, 100–500M, SA",
    input: {
      sector: "real_estate",
      activityType: "services",
      investmentBracket: "100m_to_500m",
      targetRegions: ["marrakech_safi"],
      companyCountry: "uae",
      jobsToCreate: 80,
      preferredLegalForm: "sa",
    },
    expected: [
      "cri_registration",
      "certificat_negatif",
      "capital_deposit",
      "rc_registration",
      "ice_registration",
      "tax_registration",
      "cnss_registration",
      "bank_account",
      "investment_agreement",
      "work_permits",
    ],
  },
  {
    name: "US renewables — manufacturing, >500M, SA",
    input: {
      sector: "renewables",
      activityType: "manufacturing",
      investmentBracket: "over_500m",
      targetRegions: ["souss_massa"],
      companyCountry: "usa",
      jobsToCreate: 300,
      preferredLegalForm: "sa",
    },
    expected: [
      "cri_registration",
      "certificat_negatif",
      "capital_deposit",
      "rc_registration",
      "ice_registration",
      "tax_registration",
      "cnss_registration",
      "bank_account",
      "investment_agreement",
      "sector_license_energy",
      "environmental_assessment",
      "industrial_land",
      "work_permits",
    ],
  },
  {
    name: "Spanish tourism — services, 25–100M, Succursale (no capital)",
    input: {
      sector: "tourism",
      activityType: "services",
      investmentBracket: "25m_to_100m",
      targetRegions: ["marrakech_safi"],
      companyCountry: "spain",
      jobsToCreate: 120,
      preferredLegalForm: "succursale",
    },
    expected: [
      "cri_registration",
      "certificat_negatif",
      "rc_registration",
      "ice_registration",
      "tax_registration",
      "cnss_registration",
      "bank_account",
      "sector_license_tourism",
      "work_permits",
    ],
  },
];

describe("generateWizardSteps — golden checklists per persona (S2-01)", () => {
  for (const { name, input, expected } of PERSONAS) {
    it(`${name}: exact ordered step ids`, () => {
      const ids = generateWizardSteps(input).map((s) => s.id);
      expect(ids).toEqual(expected);
    });
  }
});

describe("generateWizardSteps — structural invariants", () => {
  const ALL = PERSONAS.map((p) => generateWizardSteps(p.input));

  it("every step starts pending", () => {
    for (const steps of ALL) {
      for (const step of steps) expect(step.status).toBe("pending");
    }
  });

  it("step ids are unique within a checklist", () => {
    for (const steps of ALL) {
      const ids = steps.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("every step has non-empty trilingual titles and a description", () => {
    for (const steps of ALL) {
      for (const step of steps) {
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.titleFr.trim().length).toBeGreaterThan(0);
        expect(step.titleAr.trim().length).toBeGreaterThan(0);
        expect(step.description.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("officialLink is always https and estimatedDays positive", () => {
    for (const steps of ALL) {
      for (const step of steps) {
        if (step.officialLink) expect(step.officialLink).toMatch(/^https:\/\//);
        if (step.estimatedDays !== undefined) expect(step.estimatedDays).toBeGreaterThan(0);
      }
    }
  });

  it("requiredDocuments only reference known document types", () => {
    for (const steps of ALL) {
      for (const step of steps) {
        for (const doc of step.requiredDocuments ?? []) {
          expect(VALID_DOC_TYPES.has(doc), `unknown doc type '${doc}'`).toBe(true);
        }
      }
    }
  });
});

describe("generateWizardSteps — branching rules", () => {
  const base: WizardProfileInput = {
    sector: "textile",
    activityType: "services",
    investmentBracket: "under_5m",
    targetRegions: ["fes_meknes"],
    companyCountry: "other",
  };

  it("incorporated forms add capital_deposit; entity presences do not", () => {
    const sarl = generateWizardSteps({ ...base, preferredLegalForm: "sarl" }).map((s) => s.id);
    const branch = generateWizardSteps({ ...base, preferredLegalForm: "succursale" }).map(
      (s) => s.id,
    );
    const liaison = generateWizardSteps({ ...base, preferredLegalForm: "bureau_de_liaison" }).map(
      (s) => s.id,
    );
    expect(sarl).toContain("capital_deposit");
    expect(branch).not.toContain("capital_deposit");
    expect(liaison).not.toContain("capital_deposit");
  });

  it("no legal form selected yet → no capital_deposit step", () => {
    const ids = generateWizardSteps(base).map((s) => s.id);
    expect(ids).not.toContain("capital_deposit");
  });

  it("manufacturing & mixed add environmental + land; services do not", () => {
    const mfg = generateWizardSteps({ ...base, activityType: "manufacturing" }).map((s) => s.id);
    const mixed = generateWizardSteps({ ...base, activityType: "mixed" }).map((s) => s.id);
    const svc = generateWizardSteps({ ...base, activityType: "services" }).map((s) => s.id);
    expect(mfg).toEqual(expect.arrayContaining(["environmental_assessment", "industrial_land"]));
    expect(mixed).toEqual(expect.arrayContaining(["environmental_assessment", "industrial_land"]));
    expect(svc).not.toContain("environmental_assessment");
    expect(svc).not.toContain("industrial_land");
  });

  it("large brackets trigger the State investment agreement; small ones do not", () => {
    for (const bracket of ["100m_to_500m", "over_500m"] as const) {
      expect(
        generateWizardSteps({ ...base, investmentBracket: bracket }).map((s) => s.id),
      ).toContain("investment_agreement");
    }
    for (const bracket of ["under_5m", "5m_to_25m", "25m_to_100m"] as const) {
      expect(
        generateWizardSteps({ ...base, investmentBracket: bracket }).map((s) => s.id),
      ).not.toContain("investment_agreement");
    }
  });

  it("sector licence appears only for regulated sectors", () => {
    const expectations: [WizardProfileInput["sector"], string | null][] = [
      ["agrifood", "sector_license_onssa"],
      ["pharma", "sector_license_pharma"],
      ["renewables", "sector_license_energy"],
      ["bpo_ites", "sector_license_cndp"],
      ["tech", "sector_license_cndp"],
      ["finance", "sector_license_finance"],
      ["mining", "sector_license_mining"],
      ["tourism", "sector_license_tourism"],
      ["automotive", null],
      ["logistics", null],
    ];
    for (const [sector, licence] of expectations) {
      const ids = generateWizardSteps({ ...base, sector }).map((s) => s.id);
      const found = ids.filter((id) => id.startsWith("sector_license_"));
      if (licence) expect(found).toEqual([licence]);
      else expect(found).toEqual([]);
    }
  });

  it("work permits are always present for foreign investors", () => {
    for (const steps of PERSONAS.map((p) => generateWizardSteps(p.input))) {
      expect(steps.map((s) => s.id)).toContain("work_permits");
    }
  });
});

describe("firstActiveStepId & wizardProgress", () => {
  const steps = generateWizardSteps(FRENCH_BPO_INPUT);

  it("firstActiveStepId is the first non-completed/non-skipped step", () => {
    expect(firstActiveStepId(steps)).toBe("cri_registration");
    const advanced = steps.map((s, i) => (i === 0 ? { ...s, status: "completed" as const } : s));
    expect(firstActiveStepId(advanced)).toBe("certificat_negatif");
  });

  it("wizardProgress counts completed over non-skipped total", () => {
    const fresh = wizardProgress(steps);
    expect(fresh).toEqual({ completed: 0, total: steps.length, percent: 0 });

    const two = steps.map((s, i) => (i < 2 ? { ...s, status: "completed" as const } : s));
    const p = wizardProgress(two);
    expect(p.completed).toBe(2);
    expect(p.percent).toBe(Math.round((2 / steps.length) * 100));
  });

  it("skipped steps are excluded from the denominator", () => {
    const withSkip = steps.map((s, i) => (i === 0 ? { ...s, status: "skipped" as const } : s));
    const p = wizardProgress(withSkip);
    expect(p.total).toBe(steps.length - 1);
  });

  it("empty checklist yields 0% (no divide-by-zero)", () => {
    expect(wizardProgress([])).toEqual({ completed: 0, total: 0, percent: 0 });
  });
});

it("LocaleSchema sanity — generator titles cover all three locales", () => {
  // Guards against drift if a locale is added to the enum.
  expect(LocaleSchema.options).toEqual(["en", "fr", "ar"]);
});
