"use client";

import { bookSlot } from "@/app/[locale]/(investor)/investor/experts/actions";
import type { FormState } from "@/lib/action-state";
import { useActionState, useState } from "react";

export type SlotOption = { id: string; label: string };

type Props = {
  slots: SlotOption[];
  labels: {
    heading: string;
    pick: string;
    submit: string;
    submitting: string;
    success: string;
    noSlots: string;
  };
};

const initialState: FormState = {};

export function BookSlotForm({ slots, labels }: Props) {
  const [state, action, isPending] = useActionState(bookSlot, initialState);
  const [selected, setSelected] = useState<string>("");

  if (state.ok) {
    return (
      <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
        {labels.success}
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="text-sm text-gray-500">{labels.noSlots}</p>;
  }

  return (
    <form action={action} className="space-y-4">
      <h3 className="text-base font-semibold text-[var(--color-navy)]">{labels.heading}</h3>

      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <fieldset className="space-y-2">
        <legend className="sr-only">{labels.pick}</legend>
        {slots.map((s) => (
          <label
            key={s.id}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              selected === s.id
                ? "border-[var(--color-gold)] bg-[var(--color-surface-muted)]"
                : "border-[var(--color-border)] hover:bg-gray-50"
            }`}
          >
            <input
              type="radio"
              name="slotId"
              value={s.id}
              checked={selected === s.id}
              onChange={() => setSelected(s.id)}
              className="accent-[var(--color-gold)]"
              required
            />
            <span className="text-[var(--color-navy)]">{s.label}</span>
          </label>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={isPending || !selected}
        className="w-full rounded-lg bg-[var(--color-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {isPending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
