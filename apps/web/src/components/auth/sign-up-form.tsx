"use client";

import { type SignUpState, signUpAction } from "@/app/[locale]/(public)/auth/sign-up/actions";
import { useActionState } from "react";

type Props = { locale: string };

const ROLES = [
  { value: "investor", label: "Foreign investor" },
  { value: "consultant", label: "Investment consultant" },
  { value: "expert", label: "Morocco advisor / expert" },
  { value: "partner", label: "Local partner / supplier" },
] as const;

const initialState: SignUpState = {};

export function SignUpForm({ locale }: Props) {
  const [state, action, isPending] = useActionState(signUpAction, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--color-navy)] mb-1">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-[var(--color-navy)] mb-1"
          >
            Company name
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--color-navy)] mb-1">
          Email address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-[var(--color-navy)] mb-1"
        >
          Password <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
        />
        <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-[var(--color-navy)] mb-1">
          I am a… <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          required
          defaultValue=""
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] bg-white"
        >
          <option value="" disabled>
            Select your role
          </option>
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.role && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.role}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-[var(--color-navy)] mb-1"
        >
          Country
        </label>
        <input
          id="country"
          name="country"
          type="text"
          autoComplete="country-name"
          placeholder="e.g. Germany, France, UAE"
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
        />
      </div>

      <input type="hidden" name="preferredLanguage" value={locale} />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60 transition-colors"
      >
        {isPending ? "Creating account…" : "Create Account"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <a
          href={`/${locale}/auth/sign-in`}
          className="text-[var(--color-gold)] font-medium hover:underline"
        >
          Sign in
        </a>
      </p>
    </form>
  );
}
