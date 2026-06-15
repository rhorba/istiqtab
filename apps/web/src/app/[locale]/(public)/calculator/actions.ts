"use server";

import { withRole } from "@/lib/with-role";
import { IncentivesInputSchema } from "@istiqtab/core";
import { db, incentiveResults, incentiveRules, investorProfiles } from "@istiqtab/db";
import {
  type ComputedIncentives,
  type IncentiveInput,
  type RegionComparison,
  compareRegions,
  computeIncentives,
} from "@istiqtab/incentives";
import { eq } from "drizzle-orm";

export type CalculatorState = {
  ok?: boolean;
  error?: string;
  result?: ComputedIncentives;
  comparison?: RegionComparison[];
};

/** Load the active Charter rules (DATA table, public catalog — no RLS). */
async function loadActiveRules() {
  return db.select().from(incentiveRules).where(eq(incentiveRules.active, true));
}

/**
 * Run the incentives calculator. Public — anonymous investors can compute before
 * creating an account (UX hook). Optionally compares up to 3 regions.
 */
export async function runCalculator(
  _prev: CalculatorState,
  formData: FormData,
): Promise<CalculatorState> {
  const parsed = IncentivesInputSchema.safeParse({
    sector: formData.get("sector"),
    activityType: formData.get("activityType"),
    investmentBracket: formData.get("investmentBracket"),
    region: formData.get("region"),
    jobsToCreate: formData.get("jobsToCreate") ? Number(formData.get("jobsToCreate")) : 0,
    compareRegions: formData.getAll("compareRegions").filter(Boolean),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please complete all required fields." };
  }

  const input: IncentiveInput = {
    sector: parsed.data.sector,
    region: parsed.data.region,
    activityType: parsed.data.activityType,
    investmentBracket: parsed.data.investmentBracket,
    jobsToCreate: parsed.data.jobsToCreate,
  };

  const rules = await loadActiveRules();
  const result = computeIncentives(input, rules);

  const others = (parsed.data.compareRegions ?? []).filter((r) => r !== input.region).slice(0, 2);
  const comparison =
    others.length > 0 ? compareRegions(input, rules, [input.region, ...others]) : undefined;

  return { ok: true, result, comparison };
}

/** Persist a computed result for the signed-in investor (incentive_results snapshot). */
export const saveCalculatorResult = withRole(
  ["investor", "consultant", "admin"],
  async (session, input: IncentiveInput): Promise<{ ok: boolean; error?: string }> => {
    const parsed = IncentivesInputSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid input." };

    const [profile] = await db
      .select({ id: investorProfiles.id })
      .from(investorProfiles)
      .where(eq(investorProfiles.userId, session.user.id))
      .limit(1);

    const rules = await loadActiveRules();
    const result = computeIncentives(
      {
        sector: parsed.data.sector,
        region: parsed.data.region,
        activityType: parsed.data.activityType,
        investmentBracket: parsed.data.investmentBracket,
        jobsToCreate: parsed.data.jobsToCreate,
      },
      rules,
    );

    await db.insert(incentiveResults).values({
      investorId: profile?.id ?? null,
      sector: result.sector,
      region: result.region,
      investmentBracket: result.investmentBracket,
      activityType: result.activityType,
      jobsToCreate: result.jobsToCreate,
      applicableIncentives: result.applicableIncentives,
    });

    return { ok: true };
  },
);
