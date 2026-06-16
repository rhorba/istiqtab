import { describe, expect, it } from "vitest";
import {
  MATCH_WEIGHTS,
  type RankablePartner,
  filterPartners,
  matchPartners,
  partnerMatchesFilter,
  rankPartners,
  scorePartner,
} from "../match.js";

function partner(over: Partial<RankablePartner> = {}): RankablePartner {
  return {
    id: "p",
    partnerType: "law_firm",
    sectors: ["automotive"],
    regions: ["tanger_tetouan"],
    languages: ["en", "fr"],
    verified: true,
    avgRating: 4,
    reviewCount: 10,
    ...over,
  };
}

describe("partnerMatchesFilter", () => {
  it("returns true when no filters are set", () => {
    expect(partnerMatchesFilter(partner(), {})).toBe(true);
  });

  it("matches partner type", () => {
    expect(
      partnerMatchesFilter(partner({ partnerType: "logistics" }), { partnerType: "logistics" }),
    ).toBe(true);
    expect(
      partnerMatchesFilter(partner({ partnerType: "law_firm" }), { partnerType: "logistics" }),
    ).toBe(false);
  });

  it("matches sector / region / language membership", () => {
    const p = partner({
      sectors: ["automotive", "agrifood"],
      regions: ["oriental"],
      languages: ["ar"],
    });
    expect(partnerMatchesFilter(p, { sector: "agrifood" })).toBe(true);
    expect(partnerMatchesFilter(p, { sector: "tourism" })).toBe(false);
    expect(partnerMatchesFilter(p, { region: "oriental" })).toBe(true);
    expect(partnerMatchesFilter(p, { region: "casablanca_settat" })).toBe(false);
    expect(partnerMatchesFilter(p, { language: "ar" })).toBe(true);
    expect(partnerMatchesFilter(p, { language: "en" })).toBe(false);
  });

  it("honours verifiedOnly", () => {
    expect(partnerMatchesFilter(partner({ verified: false }), { verifiedOnly: true })).toBe(false);
    expect(partnerMatchesFilter(partner({ verified: true }), { verifiedOnly: true })).toBe(true);
  });

  it("requires ALL provided filters to pass (AND semantics)", () => {
    const p = partner({ partnerType: "law_firm", sectors: ["automotive"], regions: ["oriental"] });
    expect(partnerMatchesFilter(p, { partnerType: "law_firm", region: "oriental" })).toBe(true);
    expect(partnerMatchesFilter(p, { partnerType: "law_firm", region: "souss_massa" })).toBe(false);
  });
});

describe("filterPartners", () => {
  it("filters the list", () => {
    const list = [
      partner({ id: "a", partnerType: "law_firm" }),
      partner({ id: "b", partnerType: "logistics" }),
    ];
    expect(filterPartners(list, { partnerType: "logistics" }).map((p) => p.id)).toEqual(["b"]);
  });
});

describe("scorePartner", () => {
  it("is zero for an unverified partner with no context match and no rating", () => {
    expect(scorePartner(partner({ verified: false, avgRating: 0 }), {})).toBe(0);
  });

  it("adds the sector weight on a sector match", () => {
    const base = scorePartner(partner({ verified: false, avgRating: 0 }), {});
    const matched = scorePartner(partner({ verified: false, avgRating: 0 }), {
      sector: "automotive",
    });
    expect(matched - base).toBe(MATCH_WEIGHTS.sector);
  });

  it("scales region overlap by count", () => {
    const p = partner({ verified: false, avgRating: 0, regions: ["tanger_tetouan", "oriental"] });
    const s = scorePartner(p, { regions: ["tanger_tetouan", "oriental", "souss_massa"] });
    expect(s).toBe(2 * MATCH_WEIGHTS.region);
  });

  it("adds verified + rating contributions", () => {
    const s = scorePartner(partner({ verified: true, avgRating: 5 }), {});
    expect(s).toBe(MATCH_WEIGHTS.verified + 5 * MATCH_WEIGHTS.rating);
  });
});

describe("rankPartners", () => {
  it("orders by relevance, then rating, then review count", () => {
    const ctx = { sector: "automotive" as const };
    const strong = partner({ id: "strong", sectors: ["automotive"], verified: true, avgRating: 5 });
    const weak = partner({ id: "weak", sectors: ["tourism"], verified: false, avgRating: 2 });
    const mid = partner({ id: "mid", sectors: ["tourism"], verified: true, avgRating: 3 });
    expect(rankPartners([weak, mid, strong], ctx).map((p) => p.id)).toEqual([
      "strong",
      "mid",
      "weak",
    ]);
  });

  it("does not mutate the input array", () => {
    const list = [partner({ id: "a", avgRating: 1 }), partner({ id: "b", avgRating: 5 })];
    const snapshot = list.map((p) => p.id);
    rankPartners(list, {});
    expect(list.map((p) => p.id)).toEqual(snapshot);
  });

  it("breaks rating ties by review count", () => {
    const fewer = partner({ id: "fewer", verified: false, avgRating: 4, reviewCount: 3 });
    const more = partner({ id: "more", verified: false, avgRating: 4, reviewCount: 30 });
    expect(rankPartners([fewer, more], {}).map((p) => p.id)).toEqual(["more", "fewer"]);
  });
});

describe("matchPartners", () => {
  it("filters then ranks", () => {
    const list = [
      partner({ id: "law-auto", partnerType: "law_firm", sectors: ["automotive"], verified: true }),
      partner({ id: "law-other", partnerType: "law_firm", sectors: ["tourism"], verified: false }),
      partner({ id: "logi", partnerType: "logistics", sectors: ["automotive"], verified: true }),
    ];
    const out = matchPartners(list, { partnerType: "law_firm" }, { sector: "automotive" });
    expect(out.map((p) => p.id)).toEqual(["law-auto", "law-other"]);
  });
});
