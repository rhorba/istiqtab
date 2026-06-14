import { auth } from "@/auth";
import { OnboardingForm } from "@/components/investor/onboarding-form";
import type { Locale } from "@istiqtab/core";
import { db, investorProfiles, withUserContext } from "@istiqtab/db";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Investor onboarding" };

type Props = { params: Promise<{ locale: string }> };

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/onboarding`);
  }

  const existing = await withUserContext(db, session.user.id, session.user.role, async (tx) =>
    tx.query.investorProfiles.findFirst({
      where: eq(investorProfiles.userId, session.user.id),
    }),
  );

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold font-serif text-[var(--color-navy)]">
            Tell us about your investment
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            This drives your personalized setup wizard, incentive estimates, and AI advisor. You can
            update it any time.
          </p>
        </header>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8 shadow-sm">
          <OnboardingForm
            locale={locale as Locale}
            defaults={
              existing
                ? {
                    companyName: existing.companyName ?? undefined,
                    companyCountry: existing.companyCountry,
                    sector: existing.sector,
                    activityType: existing.activityType,
                    investmentBracket: existing.investmentBracket,
                    preferredLegalForm: existing.preferredLegalForm ?? undefined,
                    targetRegions: existing.targetRegions,
                    jobsToCreate: existing.jobsToCreate ?? undefined,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </main>
  );
}
