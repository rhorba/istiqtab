import { describe, expect, it } from "vitest";
import {
  ACTIVITY_LABELS,
  BRACKET_LABELS,
  INCENTIVE_TYPE_LABELS,
  LEGAL_FORM_LABELS,
  ORIGIN_LABELS,
  PARTNER_TYPE_LABELS,
  REGION_LABELS,
  SECTOR_LABELS,
  type TriLabel,
  label,
} from "../labels.js";
import {
  ActivityTypeSchema,
  IncentiveTypeSchema,
  InvestmentBracketSchema,
  InvestmentSectorSchema,
  InvestorOriginSchema,
  LegalFormSchema,
  MoroccanRegionSchema,
  PartnerTypeSchema,
} from "../schemas.js";

const CASES: [string, Record<string, TriLabel>, readonly string[]][] = [
  ["sectors", SECTOR_LABELS, InvestmentSectorSchema.options],
  ["activities", ACTIVITY_LABELS, ActivityTypeSchema.options],
  ["brackets", BRACKET_LABELS, InvestmentBracketSchema.options],
  ["regions", REGION_LABELS, MoroccanRegionSchema.options],
  ["partner types", PARTNER_TYPE_LABELS, PartnerTypeSchema.options],
  ["incentive types", INCENTIVE_TYPE_LABELS, IncentiveTypeSchema.options],
  ["legal forms", LEGAL_FORM_LABELS, LegalFormSchema.options],
  ["origins", ORIGIN_LABELS, InvestorOriginSchema.options],
];

describe("trilingual label maps (S1-08)", () => {
  for (const [name, map, members] of CASES) {
    it(`${name}: every enum value has non-empty en/fr/ar`, () => {
      for (const value of members) {
        const tri = map[value];
        expect(tri, `${name} missing key '${value}'`).toBeDefined();
        if (!tri) continue;
        expect(tri.en.trim().length, `${name}.${value}.en empty`).toBeGreaterThan(0);
        expect(tri.fr.trim().length, `${name}.${value}.fr empty`).toBeGreaterThan(0);
        expect(tri.ar.trim().length, `${name}.${value}.ar empty`).toBeGreaterThan(0);
      }
    });

    it(`${name}: no extra keys beyond the schema enum`, () => {
      expect(Object.keys(map).sort()).toEqual([...members].sort());
    });
  }

  it("label() resolves by locale and falls back to en", () => {
    expect(label(SECTOR_LABELS, "automotive", "fr")).toBe("Automobile");
    expect(label(SECTOR_LABELS, "automotive", "ar")).toBe("صناعة السيارات");
    expect(label(SECTOR_LABELS, "automotive")).toBe("Automotive");
  });
});
