import type { Metadata } from "next";

export const metadata: Metadata = { title: "Authentication Error" };

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link may have expired or already been used.",
  OAuthSignin: "Could not sign in with that provider. Please try again.",
  OAuthCallback: "Could not complete OAuth sign-in. Please try again.",
  OAuthCreateAccount: "Could not create an account. The email may already be in use.",
  EmailCreateAccount: "Could not create account with that email.",
  Callback: "There was a problem with the sign-in callback.",
  Default: "An authentication error occurred. Please try again.",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function AuthErrorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { error } = await searchParams;
  const message = ERROR_MESSAGES[error ?? ""] ?? ERROR_MESSAGES.Default;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-8 text-center">
          <div className="mb-4 mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-navy)]">
            Sign-in error
          </h1>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href={`/${locale}/auth/sign-in`}
              className="rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] transition-colors"
            >
              Back to Sign In
            </a>
            <a
              href={`/${locale}`}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] hover:bg-gray-50 transition-colors"
            >
              Go to Homepage
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
