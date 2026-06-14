"use client";

import { upsertInvestorProfile } from "@/app/[locale]/(investor)/investor/onboarding/actions";
import { CheckboxGroupField, SelectField, TextField } from "@/components/forms/fields";
import type { FormState } from "@/lib/action-state";
import { toOptions } from "@/lib/options";
import {
  ACTIVITY_LABELS,
  BRACKET_LABELS,
  LEGAL_FORM_LABELS,
  type Locale,
  ORIGIN_LABELS,
  REGION_LABELS,
  SECTOR_LABELS,
} from "@istiqtab/core";
import Link from "next/link";
import { useActionState } from "react";

type Props = {
  locale: Locale;
  defaults?: Partial<{
    companyName: string;
    companyCountry: string;
    sector: string;
    activityType: string;
    investmentBracket: string;
    preferredLegalForm: string;
    targetRegions: string[];
    jobsToCreate: number;
  }>;
};

const initialState: FormState = {};

export function OnboardingForm({ locale, defaults = {} }: Props) {
  const [state, action, isPending] = useActionState(upsertInvestorProfile, initialState);
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[var(--color-navy)]">Profile saved</h2>
        <p className="mt-2 text-sm text-gray-500">
          Your investment profile is ready. We&apos;ll use it to personalize your setup wizard,
          incentive estimates, and AI advisor.
        </p>
        <Link
          href={`/${locale}`}
          className="mt-6 inline-block rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] transition-colors"
        >
          Continue
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <TextField
        name="companyName"
        label="Company name"
        defaultValue={defaults.companyName}
        placeholder="e.g. Müller Automotive GmbH"
        error={fe.companyName}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SelectField
          name="companyCountry"
          label="Source country"
          required
          options={toOptions(ORIGIN_LABELS, locale)}
          defaultValue={defaults.companyCountry}
          error={fe.companyCountry}
        />
        <SelectField
          name="sector"
          label="Investment sector"
          required
          options={toOptions(SECTOR_LABELS, locale)}
          defaultValue={defaults.sector}
          error={fe.sector}
        />
        <SelectField
          name="activityType"
          label="Primary activity"
          required
          options={toOptions(ACTIVITY_LABELS, locale)}
          defaultValue={defaults.activityType}
          error={fe.activityType}
        />
        <SelectField
          name="investmentBracket"
          label="Investment size"
          required
          options={toOptions(BRACKET_LABELS, locale)}
          defaultValue={defaults.investmentBracket}
          error={fe.investmentBracket}
        />
        <SelectField
          name="preferredLegalForm"
          label="Preferred legal form (optional)"
          options={toOptions(LEGAL_FORM_LABELS, locale)}
          placeholder="Not sure yet"
          defaultValue={defaults.preferredLegalForm}
          error={fe.preferredLegalForm}
        />
        <TextField
          name="jobsToCreate"
          label="Jobs to create (optional)"
          type="number"
          defaultValue={defaults.jobsToCreate?.toString()}
          placeholder="e.g. 120"
          error={fe.jobsToCreate}
        />
      </div>

      <CheckboxGroupField
        name="targetRegions"
        label="Target regions (pick up to 4)"
        options={toOptions(REGION_LABELS, locale)}
        defaultValues={defaults.targetRegions}
        error={fe.targetRegions}
        columns={2}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60 transition-colors"
      >
        {isPending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
