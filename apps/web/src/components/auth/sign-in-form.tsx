"use client";

import {
  type SignInState,
  signInWithCredentials,
  signInWithGoogle,
  signInWithLinkedIn,
} from "@/app/[locale]/(public)/auth/sign-in/actions";
import { useActionState } from "react";

type Props = {
  locale: string;
  callbackUrl?: string;
};

const initialState: SignInState = {};

export function SignInForm({ locale, callbackUrl }: Props) {
  const [state, action, isPending] = useActionState(signInWithCredentials, initialState);

  const cb = callbackUrl ?? `/${locale}`;

  return (
    <div className="space-y-6">
      {/* OAuth buttons */}
      <div className="space-y-3">
        <form action={signInWithLinkedIn}>
          <input type="hidden" name="callbackUrl" value={cb} />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] hover:bg-gray-50 transition-colors"
          >
            <LinkedInIcon />
            Continue with LinkedIn
          </button>
        </form>

        <form action={signInWithGoogle}>
          <input type="hidden" name="callbackUrl" value={cb} />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--color-border)]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-400">Or continue with email</span>
        </div>
      </div>

      {/* Credentials form */}
      <form action={action} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={cb} />

        {state.error && (
          <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[var(--color-navy)] mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--color-navy)]"
            >
              Password
            </label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60 transition-colors"
        >
          {isPending ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <a
          href={`/${locale}/auth/sign-up`}
          className="text-[var(--color-gold)] font-medium hover:underline"
        >
          Create account
        </a>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0077B5" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
