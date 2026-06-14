import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create Account" };

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SignUpPage({ params }: Props) {
  const { locale } = await params;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-8">
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold font-serif text-[var(--color-navy)]">
              استقطاب
            </span>
            <p className="mt-1 text-[var(--color-gold)] text-xs font-medium tracking-wider uppercase">
              Istiqtab
            </p>
            <h1 className="mt-6 text-xl font-semibold text-[var(--color-navy)]">
              Start your Morocco journey
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create your free account to save your progress and access all features
            </p>
          </div>

          <SignUpForm locale={locale} />
        </div>
      </div>
    </main>
  );
}
