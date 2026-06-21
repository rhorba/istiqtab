import type { IncentiveType } from "@istiqtab/core";
import { describe, expect, it } from "vitest";
import {
  DISCLAIMER,
  type IncentiveInput,
  type IncentiveRuleLike,
  compareRegions,
  computeIncentives,
  ruleMatches,
} from "../engine.js";

// ── Fixture rule set (mirrors the seeded incentive_rules shape) ───────────────
// Covers all 11 incentive types. `r()` fills defaults so each case states only
// the criteria that matter to it.

function r(
  partial: Partial<IncentiveRuleLike> & { incentiveType: IncentiveType },
): IncentiveRuleLike {
  return {
    label: `${partial.incentiveType} EN`,
    labelFr: `${partial.incentiveType} FR`,
    labelAr: `${partial.incentiveType} AR`,
    value: "indicative value",
    condition: "condition text",
    sourceArticle: "Charter 2022",
    confidence: "indicative",
    sectors: [],
    regions: [],
    activityTypes: [],
    brackets: [],
    minJobs: 0,
    priority: 0,
    active: true,
    ...partial,
  };
}

const RULES: IncentiveRuleLike[] = [
  // Applies to everyone (no constraints) — IS exemption, top priority.
  r({
    incentiveType: "is_exemption",
    priority: 100,
    brackets: ["25m_to_100m", "100m_to_500m", "over_500m"],
  }),
  r({ incentiveType: "is_reduced_rate", priority: 90 }),
  r({ incentiveType: "tva_exemption", priority: 80, activityTypes: ["manufacturing", "mixed"] }),
  r({
    incentiveType: "customs_exemption",
    priority: 70,
    activityTypes: ["manufacturing", "mixed"],
  }),
  r({
    incentiveType: "land_subsidy",
    priority: 60,
    brackets: ["100m_to_500m", "over_500m"],
    confidence: "requires_verification",
  }),
  r({ incentiveType: "employment_premium", priority: 50, minJobs: 50, value: "per {jobs} jobs" }),
  r({ incentiveType: "training_subsidy", priority: 45 }),
  r({ incentiveType: "energy_benefit", priority: 40, sectors: ["renewables"] }),
  r({ incentiveType: "export_support", priority: 30 }),
  r({
    incentiveType: "sez_benefit",
    priority: 20,
    regions: ["tanger_tetouan", "casablanca_settat", "souss_massa"],
    confidence: "requires_verification",
  }),
  r({ incentiveType: "r_and_d_credit", priority: 10, activityTypes: ["r_and_d", "mixed"] }),
];

const ALL_TYPES: IncentiveType[] = [
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
];

function typesFor(input: IncentiveInput): IncentiveType[] {
  return computeIncentives(input, RULES).applicableIncentives.map((i) => i.type);
}

// ── Golden profiles ───────────────────────────────────────────────────────────

describe("computeIncentives — golden profiles (S3-01)", () => {
  it("German automotive, manufacturing, 100–500M, Tanger, 400 jobs", () => {
    const types = typesFor({
      sector: "automotive",
      region: "tanger_tetouan",
      activityType: "manufacturing",
      investmentBracket: "100m_to_500m",
      jobsToCreate: 400,
    });
    expect(types).toEqual([
      "is_exemption", // 100
      "is_reduced_rate", // 90
      "tva_exemption", // 80
      "customs_exemption", // 70
      "land_subsidy", // 60
      "employment_premium", // 50
      "training_subsidy", // 45
      "export_support", // 30
      "sez_benefit", // 20 (Tanger qualifies)
    ]);
    // renewables-only and r_and_d-only rules excluded.
    expect(types).not.toContain("energy_benefit");
    expect(types).not.toContain("r_and_d_credit");
  });

  it("US renewables, R&D, over 500M, Souss-Massa, 300 jobs", () => {
    const types = typesFor({
      sector: "renewables",
      region: "souss_massa",
      activityType: "r_and_d",
      investmentBracket: "over_500m",
      jobsToCreate: 300,
    });
    expect(types).toContain("energy_benefit"); // renewables
    expect(types).toContain("r_and_d_credit"); // r_and_d
    expect(types).toContain("sez_benefit"); // Souss-Massa qualifies
    // Manufacturing-only incentives excluded for a pure R&D activity.
    expect(types).not.toContain("tva_exemption");
    expect(types).not.toContain("customs_exemption");
  });

  it("Small services project, under 5M, 10 jobs, non-SEZ region", () => {
    const types = typesFor({
      sector: "tech",
      region: "fes_meknes",
      activityType: "services",
      investmentBracket: "under_5m",
      jobsToCreate: 10,
    });
    expect(types).toContain("is_reduced_rate");
    expect(types).toContain("training_subsidy");
    expect(types).toContain("export_support");
    expect(types).not.toContain("is_exemption"); // bracket too small
    expect(types).not.toContain("land_subsidy"); // bracket too small
    expect(types).not.toContain("employment_premium"); // under 50 jobs
    expect(types).not.toContain("sez_benefit"); // Fès-Meknès not an SEZ region
  });
});

// ── Edge cases (Test Architect) ───────────────────────────────────────────────

describe("computeIncentives — matching edge cases", () => {
  const base: IncentiveInput = {
    sector: "textile",
    region: "oriental",
    activityType: "services",
    investmentBracket: "5m_to_25m",
    jobsToCreate: 0,
  };

  it("empty criteria arrays mean 'applies to all'", () => {
    expect(ruleMatches(base, r({ incentiveType: "is_reduced_rate" }))).toBe(true);
  });

  it("minJobs is an inclusive boundary", () => {
    const rule = r({ incentiveType: "employment_premium", minJobs: 50 });
    expect(ruleMatches({ ...base, jobsToCreate: 49 }, rule)).toBe(false);
    expect(ruleMatches({ ...base, jobsToCreate: 50 }, rule)).toBe(true);
    expect(ruleMatches({ ...base, jobsToCreate: 51 }, rule)).toBe(true);
  });

  it("inactive rules never match", () => {
    expect(ruleMatches(base, r({ incentiveType: "is_exemption", active: false }))).toBe(false);
    const withInactive = [
      ...RULES,
      r({ incentiveType: "is_exemption", active: false, priority: 999 }),
    ];
    // Active is_exemption requires a larger bracket than base → none should apply.
    expect(
      computeIncentives(base, withInactive).applicableIncentives.map((i) => i.type),
    ).not.toContain("is_exemption");
  });

  it("a single mismatched dimension excludes the rule", () => {
    const rule = r({ incentiveType: "energy_benefit", sectors: ["renewables"] });
    expect(ruleMatches({ ...base, sector: "renewables" }, rule)).toBe(true);
    expect(ruleMatches({ ...base, sector: "automotive" }, rule)).toBe(false);
  });

  it("a profile matching nothing returns an empty list (disclaimer still applies)", () => {
    const lonely: IncentiveRuleLike[] = [
      r({ incentiveType: "energy_benefit", sectors: ["renewables"] }),
    ];
    const result = computeIncentives(base, lonely);
    expect(result.applicableIncentives).toEqual([]);
    expect(DISCLAIMER).toMatch(/not financial, tax, or legal advice/i);
  });

  it("no rules at all → empty, no throw", () => {
    expect(computeIncentives(base, []).applicableIncentives).toEqual([]);
  });
});

describe("computeIncentives — output shape & determinism", () => {
  const input: IncentiveInput = {
    sector: "renewables",
    region: "tanger_tetouan",
    activityType: "mixed",
    investmentBracket: "over_500m",
    jobsToCreate: 200,
  };

  it("results are ordered by descending priority", () => {
    const items = computeIncentives(input, RULES).applicableIncentives;
    const priorityOf = new Map(RULES.map((r) => [r.incentiveType, r.priority]));
    for (let i = 1; i < items.length; i++) {
      expect(priorityOf.get(items[i - 1]!.type)!).toBeGreaterThanOrEqual(
        priorityOf.get(items[i]!.type)!,
      );
    }
  });

  it("order is independent of input rule order", () => {
    const shuffled = [...RULES].reverse();
    const a = computeIncentives(input, RULES).applicableIncentives.map((i) => i.type);
    const b = computeIncentives(input, shuffled).applicableIncentives.map((i) => i.type);
    expect(a).toEqual(b);
  });

  it("each applied incentive carries label trio, confidence, and source", () => {
    for (const inc of computeIncentives(input, RULES).applicableIncentives) {
      expect(inc.label.length).toBeGreaterThan(0);
      expect(inc.labelFr.length).toBeGreaterThan(0);
      expect(inc.labelAr.length).toBeGreaterThan(0);
      expect(["confirmed", "indicative", "requires_verification"]).toContain(inc.confidence);
      expect(inc.sourceArticle).toBeTruthy();
    }
  });

  it("{jobs} is interpolated into the value template", () => {
    const inc = computeIncentives({ ...input, jobsToCreate: 123 }, RULES).applicableIncentives.find(
      (i) => i.type === "employment_premium",
    );
    expect(inc?.value).toBe("per 123 jobs");
  });

  it("computedAt is injectable for stable snapshots", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    expect(computeIncentives(input, RULES, now).computedAt).toEqual(now);
  });

  it("every one of the 11 incentive types can be produced", () => {
    const seen = new Set<IncentiveType>();
    const inputs: IncentiveInput[] = [
      {
        sector: "renewables",
        region: "tanger_tetouan",
        activityType: "mixed",
        investmentBracket: "over_500m",
        jobsToCreate: 500,
      },
      {
        sector: "tech",
        region: "fes_meknes",
        activityType: "services",
        investmentBracket: "under_5m",
        jobsToCreate: 10,
      },
    ];
    for (const i of inputs) {
      for (const inc of computeIncentives(i, RULES).applicableIncentives) seen.add(inc.type);
    }
    for (const t of ALL_TYPES) expect(seen.has(t), `type '${t}' never produced`).toBe(true);
  });
});

describe("compareRegions", () => {
  const input: IncentiveInput = {
    sector: "automotive",
    region: "tanger_tetouan",
    activityType: "manufacturing",
    investmentBracket: "100m_to_500m",
    jobsToCreate: 400,
  };

  it("computes each region independently and caps at 3", () => {
    const cmp = compareRegions(input, RULES, [
      "tanger_tetouan",
      "fes_meknes",
      "casablanca_settat",
      "oriental", // 4th is dropped
    ]);
    expect(cmp).toHaveLength(3);
    expect(cmp.map((c) => c.region)).toEqual(["tanger_tetouan", "fes_meknes", "casablanca_settat"]);

    const tanger = cmp.find((c) => c.region === "tanger_tetouan")!;
    const fes = cmp.find((c) => c.region === "fes_meknes")!;
    // SEZ benefit applies in Tanger but not Fès-Meknès — the comparison's whole point.
    expect(tanger.applicableIncentives.map((i) => i.type)).toContain("sez_benefit");
    expect(fes.applicableIncentives.map((i) => i.type)).not.toContain("sez_benefit");
  });
});
