"use server";

import type { FormState } from "@/lib/action-state";
import { withRole } from "@/lib/with-role";
import { type WizardStep, WizardStepStatusSchema } from "@istiqtab/core";
import { db, investorProfiles, withUserContext } from "@istiqtab/db";
import { firstActiveStepId, generateWizardSteps } from "@istiqtab/wizard";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const StepUpdateSchema = z.object({
  stepId: z.string().min(1).max(64),
  status: WizardStepStatusSchema,
  notes: z.string().max(2000).optional(),
});

/**
 * Update the status (and optional notes) of a single wizard step for the
 * signed-in investor. Recomputes the active step pointer. Owner-scoped via RLS.
 * Called programmatically from the wizard client component.
 */
export const changeStepStatus = withRole(
  ["investor", "consultant", "admin"],
  async (
    session,
    input: { stepId: string; status: string; notes?: string },
  ): Promise<FormState> => {
    const parsed = StepUpdateSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid step update." };
    }

    const { stepId, status, notes } = parsed.data;
    const userId = session.user.id;
    const role = session.user.role;

    const result = await withUserContext(db, userId, role, async (tx) => {
      const [profile] = await tx
        .select({ steps: investorProfiles.wizardSteps })
        .from(investorProfiles)
        .where(eq(investorProfiles.userId, userId))
        .limit(1);

      if (!profile) return "no_profile" as const;

      const steps = profile.steps as WizardStep[];
      const idx = steps.findIndex((s) => s.id === stepId);
      if (idx === -1) return "no_step" as const;

      const next: WizardStep[] = steps.map((step, i) =>
        i === idx
          ? {
              ...step,
              status,
              completedAt: status === "completed" ? new Date() : undefined,
              notes: notes ?? step.notes,
            }
          : step,
      );

      await tx
        .update(investorProfiles)
        .set({
          wizardSteps: next,
          currentStep: firstActiveStepId(next) ?? null,
          updatedAt: new Date(),
        })
        .where(eq(investorProfiles.userId, userId));

      return "ok" as const;
    });

    if (result === "no_profile") return { ok: false, error: "Complete your profile first." };
    if (result === "no_step") return { ok: false, error: "Unknown step." };

    revalidatePath("/[locale]/investor/wizard", "page");
    return { ok: true };
  },
);

/**
 * Regenerate the checklist from the current profile. Preserves status/notes for
 * steps whose ids still exist; new steps start pending. Used when the investor
 * changes their sector, activity, bracket, or legal form.
 */
export const regenerateWizard = withRole(
  ["investor", "consultant", "admin"],
  async (session): Promise<FormState> => {
    const userId = session.user.id;
    const role = session.user.role;

    const result = await withUserContext(db, userId, role, async (tx) => {
      const [profile] = await tx
        .select()
        .from(investorProfiles)
        .where(eq(investorProfiles.userId, userId))
        .limit(1);

      if (!profile) return "no_profile" as const;

      const prior = new Map((profile.wizardSteps as WizardStep[]).map((s) => [s.id, s] as const));
      const fresh = generateWizardSteps({
        sector: profile.sector,
        activityType: profile.activityType,
        investmentBracket: profile.investmentBracket,
        targetRegions: profile.targetRegions,
        companyCountry: profile.companyCountry,
        jobsToCreate: profile.jobsToCreate,
        preferredLegalForm: profile.preferredLegalForm,
      });

      // Carry forward progress for steps that survive regeneration.
      const merged: WizardStep[] = fresh.map((step) => {
        const before = prior.get(step.id);
        return before
          ? { ...step, status: before.status, completedAt: before.completedAt, notes: before.notes }
          : step;
      });

      await tx
        .update(investorProfiles)
        .set({
          wizardSteps: merged,
          currentStep: firstActiveStepId(merged) ?? null,
          updatedAt: new Date(),
        })
        .where(eq(investorProfiles.userId, userId));

      return "ok" as const;
    });

    if (result === "no_profile") return { ok: false, error: "Complete your profile first." };

    revalidatePath("/[locale]/investor/wizard", "page");
    return { ok: true };
  },
);
