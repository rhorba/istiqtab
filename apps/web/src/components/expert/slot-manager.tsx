"use client";

import { addSlot, removeSlot } from "@/app/[locale]/(expert)/expert/sessions/actions";
import type { FormState } from "@/lib/action-state";
import { useActionState, useTransition } from "react";

export type SlotRow = {
  id: string;
  label: string;
  booked: boolean;
};

type Props = {
  slots: SlotRow[];
  labels: {
    addHeading: string;
    startLabel: string;
    durationLabel: string;
    min30: string;
    min60: string;
    add: string;
    adding: string;
    added: string;
    booked: string;
    remove: string;
    empty: string;
  };
};

const initialState: FormState = {};

export function SlotManager({ slots, labels }: Props) {
  const [state, action, isPending] = useActionState(addSlot, initialState);
  const [isRemoving, startRemove] = useTransition();

  return (
    <div className="space-y-6">
      <form
        action={action}
        className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
      >
        <h3 className="text-base font-semibold text-[var(--color-navy)]">{labels.addHeading}</h3>

        {state.error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
        )}
        {state.ok && (
          <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            {labels.added}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-[var(--color-navy)]">
            {labels.startLabel}
            <input
              type="datetime-local"
              name="start"
              required
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)]"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--color-navy)]">
            {labels.durationLabel}
            <select
              name="durationMinutes"
              defaultValue="30"
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] bg-white"
            >
              <option value="30">{labels.min30}</option>
              <option value="60">{labels.min60}</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[var(--color-gold)] px-4 py-2.5 text-sm font-semibold text-[var(--color-navy)] hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {isPending ? labels.adding : labels.add}
        </button>
      </form>

      {slots.length === 0 ? (
        <p className="text-sm text-gray-500">{labels.empty}</p>
      ) : (
        <ul className="space-y-2">
          {slots.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm"
            >
              <span className="text-[var(--color-navy)]">{s.label}</span>
              {s.booked ? (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {labels.booked}
                </span>
              ) : (
                <button
                  type="button"
                  disabled={isRemoving}
                  onClick={() => startRemove(async () => void (await removeSlot(s.id)))}
                  className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  {labels.remove}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
