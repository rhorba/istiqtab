"use server";

import { type FormState, zodFieldErrors } from "@/lib/action-state";
import { withRole } from "@/lib/with-role";
import { InvestorProfileCreateSchema } from "@istiqtab/core";
import { db, investorProfiles, withUserContext } from "@istiqtab/db";
import { firstActiveStepId, generateWizardSteps } from "@istiqtab/wizard";

/**
 * Create or update the signed-in investor's profile. Writes run under the
 * caller's RLS context so the row is owner-scoped.
 */
export const upsertInvestorProfile = withRole(
  ["investor", "consultant", "admin"],
  async (session, _prev: FormState, formData: FormData): Promise<FormState> => {
    const parsed = InvestorProfileCreateSchema.safeParse({
      companyName: (formData.get("companyName") as string) || undefined,
      companyCountry: formData.get("companyCountry"),
      sector: formData.get("sector"),
      activityType: formData.get("activityType"),
      investmentBracket: formData.get("investmentBracket"),
      targetRegions: formData.getAll("targetRegions"),
      jobsToCreate: formData.get("jobsToCreate") ? Number(formData.get("jobsToCreate")) : undefined,
      preferredLegalForm: (formData.get("preferredLegalForm") as string) || undefined,
    });

    if (!parsed.success) {
      return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
    }

    const { userId, role } = { userId: session.user.id, role: session.user.role };
    const data = parsed.data;

    // Seed the personalized setup checklist on first creation. On update we
    // leave wizardSteps/currentStep untouched to preserve the investor's
    // progress — an explicit regenerate action handles profile changes.
    const wizardSteps = generateWizardSteps({
      sector: data.sector,
      activityType: data.activityType,
      investmentBracket: data.investmentBracket,
      targetRegions: data.targetRegions,
      companyCountry: data.companyCountry,
      jobsToCreate: data.jobsToCreate ?? null,
      preferredLegalForm: data.preferredLegalForm ?? null,
    });

    await withUserContext(db, userId, role, async (tx) => {
      await tx
        .insert(investorProfiles)
        .values({
          userId,
          companyName: data.companyName ?? null,
          companyCountry: data.companyCountry,
          sector: data.sector,
          activityType: data.activityType,
          investmentBracket: data.investmentBracket,
          targetRegions: data.targetRegions,
          jobsToCreate: data.jobsToCreate ?? null,
          preferredLegalForm: data.preferredLegalForm ?? null,
          wizardSteps,
          currentStep: firstActiveStepId(wizardSteps) ?? null,
        })
        .onConflictDoUpdate({
          target: investorProfiles.userId,
          set: {
            companyName: data.companyName ?? null,
            companyCountry: data.companyCountry,
            sector: data.sector,
            activityType: data.activityType,
            investmentBracket: data.investmentBracket,
            targetRegions: data.targetRegions,
            jobsToCreate: data.jobsToCreate ?? null,
            preferredLegalForm: data.preferredLegalForm ?? null,
            updatedAt: new Date(),
          },
        });
    });

    return { ok: true };
  },
);
