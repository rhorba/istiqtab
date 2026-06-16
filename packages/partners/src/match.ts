import type { InvestmentSector, Locale, MoroccanRegion, PartnerType } from "@istiqtab/core";

// ─────────────────────────────────────────────────────────────────────────────
// Partner matching — PURE functions (no DB, no I/O) so they are fully unit
// testable. The directory page uses SQL for the hard filters (type/region/
// sector/language) and pagination; this module adds relevance ranking against
// the signed-in investor's profile (sector / region / language affinity).
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal structural shape a partner row needs to be filtered + ranked. */
export type RankablePartner = {
  id: string;
  partnerType: PartnerType;
  sectors: InvestmentSector[];
  regions: MoroccanRegion[];
  languages: Locale[];
  verified: boolean;
  avgRating: number;
  reviewCount: number;
};

/** Hard filters applied to the directory (each optional → "any"). */
export type PartnerFilter = {
  partnerType?: PartnerType;
  sector?: InvestmentSector;
  region?: MoroccanRegion;
  language?: Locale;
  /** When true, only verified partners are returned (default for public browse). */
  verifiedOnly?: boolean;
};

/** Investor affinity context used to rank matches (all optional). */
export type MatchContext = {
  sector?: InvestmentSector;
  regions?: MoroccanRegion[];
  languages?: Locale[];
};

/** Relevance weights — kept as named constants so tests pin exact behaviour. */
export const MATCH_WEIGHTS = {
  sector: 3,
  region: 2,
  language: 1,
  verified: 2,
  /** avgRating (0–5) is scaled by this so it tie-breaks but never dominates. */
  rating: 0.4,
} as const;

/** True if a partner satisfies every provided hard filter. */
export function partnerMatchesFilter<P extends RankablePartner>(
  partner: P,
  filter: PartnerFilter,
): boolean {
  if (filter.verifiedOnly && !partner.verified) return false;
  if (filter.partnerType && partner.partnerType !== filter.partnerType) return false;
  if (filter.sector && !partner.sectors.includes(filter.sector)) return false;
  if (filter.region && !partner.regions.includes(filter.region)) return false;
  if (filter.language && !partner.languages.includes(filter.language)) return false;
  return true;
}

/** Filter a list down to partners matching all provided hard filters. */
export function filterPartners<P extends RankablePartner>(
  partners: P[],
  filter: PartnerFilter,
): P[] {
  return partners.filter((p) => partnerMatchesFilter(p, filter));
}

/**
 * Relevance score of a partner for an investor context. Higher = better match.
 * Deterministic and side-effect free.
 */
export function scorePartner(partner: RankablePartner, ctx: MatchContext): number {
  let score = 0;

  if (ctx.sector && partner.sectors.includes(ctx.sector)) {
    score += MATCH_WEIGHTS.sector;
  }
  if (ctx.regions?.length) {
    const overlap = ctx.regions.filter((r) => partner.regions.includes(r)).length;
    score += overlap * MATCH_WEIGHTS.region;
  }
  if (ctx.languages?.length) {
    const overlap = ctx.languages.filter((l) => partner.languages.includes(l)).length;
    score += overlap * MATCH_WEIGHTS.language;
  }
  if (partner.verified) {
    score += MATCH_WEIGHTS.verified;
  }
  score += partner.avgRating * MATCH_WEIGHTS.rating;

  return Math.round(score * 1000) / 1000;
}

/**
 * Rank partners by relevance to the investor context (desc), tie-broken by
 * avgRating then reviewCount. Returns a new array; input is not mutated.
 */
export function rankPartners<P extends RankablePartner>(partners: P[], ctx: MatchContext): P[] {
  return [...partners]
    .map((partner) => ({ partner, score: scorePartner(partner, ctx) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.partner.avgRating - a.partner.avgRating ||
        b.partner.reviewCount - a.partner.reviewCount,
    )
    .map(({ partner }) => partner);
}

/** Filter then rank in one call — the directory's default path. */
export function matchPartners<P extends RankablePartner>(
  partners: P[],
  filter: PartnerFilter,
  ctx: MatchContext = {},
): P[] {
  return rankPartners(filterPartners(partners, filter), ctx);
}
