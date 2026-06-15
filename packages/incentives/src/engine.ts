import type {
  ActivityType,
  AppliedIncentive,
  IncentiveType,
  InvestmentBracket,
  InvestmentSector,
  MoroccanRegion,
} from "@istiqtab/core";

// ─────────────────────────────────────────────────────────────────────────────
// Investment Charter 2022 — incentives computation engine.
//
// Rules live in the `incentive_rules` DB table (DATA, not code — admin-editable
// without a deploy, non-negotiable #7). This module is PURE: the caller loads the
// active rules and passes them in, so computation is deterministic and unit-
// testable (golden file) without a database.
//
// Every result is INDICATIVE. The mandatory disclaimer (non-negotiable #1) must
// accompany any rendering of these results — see DISCLAIMER / DISCLAIMER_FR/AR.
// ─────────────────────────────────────────────────────────────────────────────

/** The investor parameters a calculation runs against. */
export type IncentiveInput = {
  sector: InvestmentSector;
  region: MoroccanRegion;
  activityType: ActivityType;
  investmentBracket: InvestmentBracket;
  jobsToCreate: number;
};

/**
 * Structural shape of an incentive rule the engine needs. The Drizzle
 * `IncentiveRule` row type from `@istiqtab/db` is assignable to this, so the
 * server action can pass DB rows straight in.
 */
export type IncentiveRuleLike = {
  incentiveType: IncentiveType;
  label: string;
  labelFr: string;
  labelAr: string;
  value: string;
  condition: string;
  sourceArticle?: string | null;
  confidence: AppliedIncentive["confidence"];
  sectors: InvestmentSector[];
  regions: MoroccanRegion[];
  activityTypes: ActivityType[];
  brackets: InvestmentBracket[];
  minJobs: number;
  priority: number;
  active: boolean;
};

export type ComputedIncentives = {
  sector: InvestmentSector;
  region: MoroccanRegion;
  activityType: ActivityType;
  investmentBracket: InvestmentBracket;
  jobsToCreate: number;
  applicableIncentives: AppliedIncentive[];
  computedAt: Date;
};

export type RegionComparison = {
  region: MoroccanRegion;
  applicableIncentives: AppliedIncentive[];
};

/** Mandatory legal disclaimer — must be shown with every result (§11, #1). */
export const DISCLAIMER =
  "Indicative only, based on publicly available Investment Charter 2022 and AMDIE data. " +
  "This is not financial, tax, or legal advice. For binding confirmation, contact your CRI " +
  "or a qualified advisor.";

export const DISCLAIMER_FR =
  "Donné à titre indicatif, sur la base des données publiques de la Charte de l'investissement " +
  "2022 et de l'AMDIE. Ne constitue pas un conseil financier, fiscal ou juridique. Pour une " +
  "confirmation contraignante, contactez votre CRI ou un conseiller qualifié.";

export const DISCLAIMER_AR =
  "معطيات إرشادية فقط، استنادًا إلى البيانات العمومية لميثاق الاستثمار 2022 والوكالة المغربية " +
  "لتنمية الاستثمارات. لا تشكل استشارة مالية أو ضريبية أو قانونية. للتأكيد الملزم، اتصل بالمركز " +
  "الجهوي للاستثمار أو بمستشار مؤهل.";

/** An empty criteria array means "no constraint on that dimension". */
function constrains<T>(criteria: T[], value: T): boolean {
  return criteria.length === 0 || criteria.includes(value);
}

/** True when every dimension of the rule matches the input (and the rule is active). */
export function ruleMatches(input: IncentiveInput, rule: IncentiveRuleLike): boolean {
  return (
    rule.active &&
    constrains(rule.sectors, input.sector) &&
    constrains(rule.regions, input.region) &&
    constrains(rule.activityTypes, input.activityType) &&
    constrains(rule.brackets, input.investmentBracket) &&
    input.jobsToCreate >= rule.minJobs
  );
}

/** Light templating in rule values: `{jobs}` → the input's job-creation target. */
function interpolate(value: string, input: IncentiveInput): string {
  return value.replace(/\{jobs\}/g, String(input.jobsToCreate));
}

function toApplied(rule: IncentiveRuleLike, input: IncentiveInput): AppliedIncentive {
  return {
    type: rule.incentiveType,
    label: rule.label,
    labelFr: rule.labelFr,
    labelAr: rule.labelAr,
    value: interpolate(rule.value, input),
    condition: rule.condition,
    sourceArticle: rule.sourceArticle ?? undefined,
    confidence: rule.confidence,
  };
}

/**
 * Order applied incentives deterministically: higher priority first, then by
 * incentive type, then label — stable regardless of DB row order.
 */
function sortApplied(a: { rule: IncentiveRuleLike }, b: { rule: IncentiveRuleLike }): number {
  if (a.rule.priority !== b.rule.priority) return b.rule.priority - a.rule.priority;
  if (a.rule.incentiveType !== b.rule.incentiveType) {
    return a.rule.incentiveType < b.rule.incentiveType ? -1 : 1;
  }
  return a.rule.label < b.rule.label ? -1 : a.rule.label > b.rule.label ? 1 : 0;
}

/** Compute the applicable incentives for one investor profile against the rule set. */
export function computeIncentives(
  input: IncentiveInput,
  rules: IncentiveRuleLike[],
  now: Date = new Date(),
): ComputedIncentives {
  const matched = rules
    .filter((rule) => ruleMatches(input, rule))
    .map((rule) => ({ rule }))
    .sort(sortApplied)
    .map(({ rule }) => toApplied(rule, input));

  return {
    sector: input.sector,
    region: input.region,
    activityType: input.activityType,
    investmentBracket: input.investmentBracket,
    jobsToCreate: input.jobsToCreate,
    applicableIncentives: matched,
    computedAt: now,
  };
}

/** Compute the same project across up to 3 regions for side-by-side comparison. */
export function compareRegions(
  input: IncentiveInput,
  rules: IncentiveRuleLike[],
  regions: MoroccanRegion[],
): RegionComparison[] {
  return regions.slice(0, 3).map((region) => ({
    region,
    applicableIncentives: computeIncentives({ ...input, region }, rules).applicableIncentives,
  }));
}
