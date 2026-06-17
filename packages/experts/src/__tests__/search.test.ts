import { describe, expect, it } from "vitest";
import {
  type ExpertFilter,
  type RankableExpert,
  expertMatchesFilter,
  filterExperts,
  matchExperts,
  rankExperts,
  scoreExpert,
} from "../search.js";

function expert(over: Partial<RankableExpert> = {}): RankableExpert {
  return {
    id: "e1",
    specializations: ["automotive"],
    languages: ["en", "fr"],
    hourlyRateMAD: 1500,
    verified: true,
    avgRating: 4.5,
    sessionCount: 20,
    ...over,
  };
}

describe("expertMatchesFilter", () => {
  it("passes with no filters", () => {
    expect(expertMatchesFilter(expert(), {})).toBe(true);
  });

  it("filters by sector specialization", () => {
    expect(expertMatchesFilter(expert(), { sector: "automotive" })).toBe(true);
    expect(expertMatchesFilter(expert(), { sector: "pharma" })).toBe(false);
  });

  it("filters by language", () => {
    expect(expertMatchesFilter(expert(), { language: "fr" })).toBe(true);
    expect(expertMatchesFilter(expert(), { language: "ar" })).toBe(false);
  });

  it("filters by max hourly rate (inclusive)", () => {
    expect(expertMatchesFilter(expert({ hourlyRateMAD: 1500 }), { maxRateMAD: 1500 })).toBe(true);
    expect(expertMatchesFilter(expert({ hourlyRateMAD: 1501 }), { maxRateMAD: 1500 })).toBe(false);
  });

  it("respects verifiedOnly", () => {
    expect(expertMatchesFilter(expert({ verified: false }), { verifiedOnly: true })).toBe(false);
    expect(expertMatchesFilter(expert({ verified: false }), { verifiedOnly: false })).toBe(true);
  });

  it("ANDs all provided filters", () => {
    const f: ExpertFilter = { sector: "automotive", language: "en", maxRateMAD: 2000 };
    expect(expertMatchesFilter(expert(), f)).toBe(true);
    expect(expertMatchesFilter(expert({ languages: ["ar"] }), f)).toBe(false);
  });
});

describe("filterExperts", () => {
  it("returns only matching experts", () => {
    const list = [
      expert({ id: "a", specializations: ["automotive"] }),
      expert({ id: "b", specializations: ["pharma"] }),
    ];
    expect(filterExperts(list, { sector: "automotive" }).map((e) => e.id)).toEqual(["a"]);
  });
});

describe("scoreExpert", () => {
  it("rewards sector match, language overlap, verified and rating", () => {
    const e = expert({ avgRating: 5, verified: true });
    // sector 3 + language(en) 1 + verified 2 + rating 5*0.4=2 = 8
    expect(scoreExpert(e, { sector: "automotive", languages: ["en"] })).toBe(8);
  });

  it("scores an unverified, off-sector expert only on rating", () => {
    const e = expert({ verified: false, avgRating: 4, specializations: ["tech"] });
    expect(scoreExpert(e, { sector: "automotive" })).toBe(1.6);
  });
});

describe("rankExperts", () => {
  it("orders by score desc, then rating, then sessionCount; pure", () => {
    const a = expert({ id: "a", specializations: ["automotive"], avgRating: 4.0 });
    const b = expert({ id: "b", specializations: ["pharma"], avgRating: 5.0 });
    const input = [b, a];
    const ranked = rankExperts(input, { sector: "automotive" });
    expect(ranked[0]?.id).toBe("a"); // sector match outweighs higher rating
    expect(input.map((e) => e.id)).toEqual(["b", "a"]); // not mutated
  });

  it("breaks score ties by sessionCount", () => {
    const a = expert({ id: "a", sessionCount: 10, avgRating: 4.5 });
    const b = expert({ id: "b", sessionCount: 99, avgRating: 4.5 });
    const ranked = rankExperts([a, b], {});
    expect(ranked.map((e) => e.id)).toEqual(["b", "a"]);
  });
});

describe("matchExperts", () => {
  it("filters then ranks", () => {
    const list = [
      expert({ id: "a", specializations: ["pharma"], verified: false }),
      expert({ id: "b", specializations: ["automotive"], avgRating: 4.0 }),
      expert({ id: "c", specializations: ["automotive"], avgRating: 4.9 }),
    ];
    const out = matchExperts(list, { verifiedOnly: true }, { sector: "automotive" });
    expect(out.map((e) => e.id)).toEqual(["c", "b"]); // 'a' filtered, then by rating
  });
});
