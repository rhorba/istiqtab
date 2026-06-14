import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign In" };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function SignInPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { callbackUrl } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-8">
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold font-serif text-[var(--color-navy)]">
              استقطاب
            </span>
            <p className="mt-1 text-[var(--color-gold)] text-xs font-medium tracking-wider uppercase">
              Istiqtab
            </p>
            <h1 className="mt-6 text-xl font-semibold text-[var(--color-navy)]">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to continue your Morocco investment journey
            </p>
          </div>

          <SignInForm locale={locale} callbackUrl={callbackUrl} />
        </div>
      </div>
    </main>
  );
}
