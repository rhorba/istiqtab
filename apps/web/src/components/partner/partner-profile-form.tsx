"use client";

import { upsertPartnerProfile } from "@/app/[locale]/(partner)/partner/profile/actions";
import {
  CheckboxGroupField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/forms/fields";
import type { FormState } from "@/lib/action-state";
import { toOptions } from "@/lib/options";
import { type Locale, PARTNER_TYPE_LABELS, REGION_LABELS, SECTOR_LABELS } from "@istiqtab/core";
import { useActionState } from "react";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

type Props = {
  locale: Locale;
  defaults?: Partial<{
    companyName: string;
    ice: string;
    partnerType: string;
    sectors: string[];
    regions: string[];
    languages: string[];
    description: string;
    internationalClients: string[];
    websiteUrl: string;
  }>;
};

const initialState: FormState = {};

export function PartnerProfileForm({ locale, defaults = {} }: Props) {
  const [state, action, isPending] = useActionState(upsertPartnerProfile, initialState);
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
          name="companyName"
          label="Company name"
          required
          defaultValue={defaults.companyName}
          error={fe.companyName}
        />
        <TextField
          name="ice"
          label="ICE (optional)"
          defaultValue={defaults.ice}
          placeholder="Identifiant Commun de l'Entreprise"
          error={fe.ice}
        />
        <SelectField
          name="partnerType"
          label="Partner type"
          required
          options={toOptions(PARTNER_TYPE_LABELS, locale)}
          defaultValue={defaults.partnerType}
          error={fe.partnerType}
        />
        <TextField
          name="websiteUrl"
          label="Website (optional)"
          type="url"
          defaultValue={defaults.websiteUrl}
          placeholder="https://"
          error={fe.websiteUrl}
        />
      </div>

      <TextAreaField
        name="description"
        label="Description"
        required
        rows={4}
        defaultValue={defaults.description}
        placeholder="What you do, who you serve, and why international investors should work with you."
        error={fe.description}
      />

      <CheckboxGroupField
        name="languages"
        label="Languages spoken"
        options={LANGUAGE_OPTIONS}
        defaultValues={defaults.languages}
        error={fe.languages}
        columns={3}
      />

      <CheckboxGroupField
        name="sectors"
        label="Sectors served"
        options={toOptions(SECTOR_LABELS, locale)}
        defaultValues={defaults.sectors}
        error={fe.sectors}
        columns={2}
      />

      <CheckboxGroupField
        name="regions"
        label="Regions covered"
        options={toOptions(REGION_LABELS, locale)}
        defaultValues={defaults.regions}
        error={fe.regions}
        columns={2}
      />

      <TextAreaField
        name="internationalClients"
        label="Past international clients (optional, comma-separated)"
        rows={2}
        defaultValue={defaults.internationalClients?.join(", ")}
        placeholder="e.g. Siemens, Renault, Decathlon"
        error={fe.internationalClients}
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
