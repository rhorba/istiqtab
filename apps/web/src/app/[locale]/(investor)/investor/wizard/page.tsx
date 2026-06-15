import { auth } from "@/auth";
import { WizardChecklist } from "@/components/investor/wizard-checklist";
import type { Locale, WizardStep } from "@istiqtab/core";
import { db, investorProfiles, withUserContext } from "@istiqtab/db";
import { wizardProgress } from "@istiqtab/wizard";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Setup wizard" };

type Props = { params: Promise<{ locale: string }> };

export default async function WizardPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/wizard`);
  }
  if (!["investor", "consultant", "admin"].includes(session.user.role)) {
    redirect(`/${locale}`);
  }

  const profile = await withUserContext(db, session.user.id, session.user.role, async (tx) =>
    tx.query.investorProfiles.findFirst({
      where: eq(investorProfiles.userId, session.user.id),
    }),
  );

  if (!profile) {
    redirect(`/${locale}/investor/onboarding`);
  }

  const steps = (profile.wizardSteps ?? []) as WizardStep[];
  const progress = wizardProgress(steps);

  return (
    <main className="min-h-screen bg-[var(--color-surface-muted)] px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-gold-600)]">
            Your setup journey
          </p>
          <h1 className="mt-1 text-2xl font-semibold font-serif text-[var(--color-navy)]">
            Company setup wizard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            A checklist personalized to your sector, activity, investment size, and legal form. Work
            through each step — the Regional Investment Centre (CRI) coordinates your file.
          </p>
        </header>

        {steps.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-8 text-center">
            <p className="text-sm text-gray-500">Your checklist hasn&apos;t been generated yet.</p>
            <Link
              href={`/${locale}/investor/onboarding`}
              className="mt-4 inline-block rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] transition-colors"
            >
              Complete your profile
            </Link>
          </div>
        ) : (
          <WizardChecklist locale={locale as Locale} steps={steps} progress={progress} />
        )}
      </div>
    </main>
  );
}
