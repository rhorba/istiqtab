"use client";

import { upsertExpertProfile } from "@/app/[locale]/(expert)/expert/profile/actions";
import { CheckboxGroupField, TextAreaField, TextField } from "@/components/forms/fields";
import type { FormState } from "@/lib/action-state";
import { toOptions } from "@/lib/options";
import { type Locale, SECTOR_LABELS } from "@istiqtab/core";
import { useActionState } from "react";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

type Props = {
  locale: Locale;
  defaults?: Partial<{
    name: string;
    title: string;
    specializations: string[];
    languages: string[];
    hourlyRateMAD: number;
    hourlyRateEUR: number;
    bio: string;
    bioFr: string;
    bioAr: string;
    linkedinUrl: string;
  }>;
};

const initialState: FormState = {};

export function ExpertProfileForm({ locale, defaults = {} }: Props) {
  const [state, action, isPending] = useActionState(upsertExpertProfile, initialState);
  const fe = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {state.ok && (
        <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Profile saved.
        </div>
      )}
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          name="name"
          label="Full name"
          required
          defaultValue={defaults.name}
          error={fe.name}
        />
        <TextField
          name="title"
          label="Professional title"
          required
          defaultValue={defaults.title}
          placeholder="e.g. Investment lawyer, ex-AMDIE"
          error={fe.title}
        />
        <TextField
          name="hourlyRateMAD"
          label="Hourly rate (MAD)"
          type="number"
          required
          defaultValue={defaults.hourlyRateMAD?.toString()}
          error={fe.hourlyRateMAD}
        />
        <TextField
          name="hourlyRateEUR"
          label="Hourly rate (EUR, optional)"
          type="number"
          defaultValue={defaults.hourlyRateEUR?.toString()}
          error={fe.hourlyRateEUR}
        />
        <TextField
          name="linkedinUrl"
          label="LinkedIn (optional)"
          type="url"
          defaultValue={defaults.linkedinUrl}
          placeholder="https://linkedin.com/in/…"
          error={fe.linkedinUrl}
        />
      </div>

      <CheckboxGroupField
        name="languages"
        label="Languages spoken"
        options={LANGUAGE_OPTIONS}
        defaultValues={defaults.languages}
        error={fe.languages}
        columns={3}
      />

      <CheckboxGroupField
        name="specializations"
        label="Sector specializations"
        options={toOptions(SECTOR_LABELS, locale)}
        defaultValues={defaults.specializations}
        error={fe.specializations}
        columns={2}
      />

      <TextAreaField
        name="bio"
        label="Bio (English)"
        required
        rows={4}
        defaultValue={defaults.bio}
        error={fe.bio}
      />
      <TextAreaField
        name="bioFr"
        label="Bio (Français, optional)"
        rows={3}
        defaultValue={defaults.bioFr}
        error={fe.bioFr}
      />
      <TextAreaField
        name="bioAr"
        label="Bio (العربية, optional)"
        rows={3}
        defaultValue={defaults.bioAr}
        error={fe.bioAr}
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
