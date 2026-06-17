import type { InvestmentSector, Locale } from "@istiqtab/core";

// ─────────────────────────────────────────────────────────────────────────────
// Expert search — PURE functions (no DB, no I/O) so they are fully unit
// testable. The directory page fetches the (small) expert set and filters +
// ranks in-memory: hard filters by specialization / language / hourly rate,
// then relevance ranking against the signed-in investor's profile.
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal structural shape an expert row needs to be filtered + ranked. */
export type RankableExpert = {
  id: string;
  specializations: InvestmentSector[];
  languages: Locale[];
  hourlyRateMAD: number;
  verified: boolean;
  avgRating: number;
  sessionCount: number;
};

/** Hard filters applied to the directory (each optional → "any"). */
export type ExpertFilter = {
  sector?: InvestmentSector;
  language?: Locale;
  /** Upper bound on hourly rate (MAD). Experts above this are excluded. */
  maxRateMAD?: number;
  /** When true, only verified experts are returned (default for public browse). */
  verifiedOnly?: boolean;
};

/** Investor affinity context used to rank matches (all optional). */
export type ExpertMatchContext = {
  sector?: InvestmentSector;
  languages?: Locale[];
};

/** Relevance weights — kept as named constants so tests pin exact behaviour. */
export const EXPERT_MATCH_WEIGHTS = {
  sector: 3,
  language: 1,
  verified: 2,
  /** avgRating (0–5) is scaled by this so it tie-breaks but never dominates. */
  rating: 0.4,
} as const;

/** True if an expert satisfies every provided hard filter. */
export function expertMatchesFilter<E extends RankableExpert>(
  expert: E,
  filter: ExpertFilter,
): boolean {
  if (filter.verifiedOnly && !expert.verified) return false;
  if (filter.sector && !expert.specializations.includes(filter.sector)) return false;
  if (filter.language && !expert.languages.includes(filter.language)) return false;
  if (filter.maxRateMAD !== undefined && expert.hourlyRateMAD > filter.maxRateMAD) return false;
  return true;
}

/** Filter a list down to experts matching all provided hard filters. */
export function filterExperts<E extends RankableExpert>(experts: E[], filter: ExpertFilter): E[] {
  return experts.filter((e) => expertMatchesFilter(e, filter));
}

/**
 * Relevance score of an expert for an investor context. Higher = better match.
 * Deterministic and side-effect free.
 */
export function scoreExpert(expert: RankableExpert, ctx: ExpertMatchContext): number {
  let score = 0;

  if (ctx.sector && expert.specializations.includes(ctx.sector)) {
    score += EXPERT_MATCH_WEIGHTS.sector;
  }
  if (ctx.languages?.length) {
    const overlap = ctx.languages.filter((l) => expert.languages.includes(l)).length;
    score += overlap * EXPERT_MATCH_WEIGHTS.language;
  }
  if (expert.verified) {
    score += EXPERT_MATCH_WEIGHTS.verified;
  }
  score += expert.avgRating * EXPERT_MATCH_WEIGHTS.rating;

  return Math.round(score * 1000) / 1000;
}

/**
 * Rank experts by relevance to the investor context (desc), tie-broken by
 * avgRating then sessionCount. Returns a new array; input is not mutated.
 */
export function rankExperts<E extends RankableExpert>(experts: E[], ctx: ExpertMatchContext): E[] {
  return [...experts]
    .map((expert) => ({ expert, score: scoreExpert(expert, ctx) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.expert.avgRating - a.expert.avgRating ||
        b.expert.sessionCount - a.expert.sessionCount,
    )
    .map(({ expert }) => expert);
}

/** Filter then rank in one call — the directory's default path. */
export function matchExperts<E extends RankableExpert>(
  experts: E[],
  filter: ExpertFilter,
  ctx: ExpertMatchContext = {},
): E[] {
  return rankExperts(filterExperts(experts, filter), ctx);
}
