"use client";

import { requestIntroduction } from "@/app/[locale]/(investor)/investor/partners/actions";
import { TextAreaField } from "@/components/forms/fields";
import type { FormState } from "@/lib/action-state";
import { useActionState } from "react";

type Props = {
  partnerId: string;
  labels: {
    heading: string;
    placeholder: string;
    submit: string;
    submitting: string;
    success: string;
    mediation: string;
  };
};

const initialState: FormState = {};

export function IntroRequestForm({ partnerId, labels }: Props) {
  const [state, action, isPending] = useActionState(requestIntroduction, initialState);
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
        {labels.success}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="partnerId" value={partnerId} />
      <h3 className="text-base font-semibold text-[var(--color-navy)]">{labels.heading}</h3>

      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <TextAreaField
        name="message"
        label=""
        required
        rows={4}
        placeholder={labels.placeholder}
        error={fe.message}
      />

      <p className="text-xs text-gray-500">{labels.mediation}</p>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--color-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {isPending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
