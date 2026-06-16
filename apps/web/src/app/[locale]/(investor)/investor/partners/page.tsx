import { auth } from "@/auth";
import { PartnerCard } from "@/components/partner/partner-card";
import { PartnerDirectoryFilters } from "@/components/partner/partner-directory-filters";
import type { InvestmentSector, Locale, MoroccanRegion, PartnerType } from "@istiqtab/core";
import { db, investorProfiles, partnerProfiles } from "@istiqtab/db";
import { type PartnerFilter, matchPartners } from "@istiqtab/partners";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Find local partners" };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; sector?: string; region?: string; language?: string }>;
};

export default async function PartnerDirectoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/partners`);
  }
  const role = session.user.role;
  if (role !== "investor" && role !== "consultant" && role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "Partners" });

  // Investor affinity context (consultants/admins may have no profile → no boost).
  const profile = await db.query.investorProfiles.findFirst({
    where: eq(investorProfiles.userId, session.user.id),
  });

  // ~12 partners total → fetch + match in-memory via the partner engine.
  const all = await db.select().from(partnerProfiles);

  const filter: PartnerFilter = {
    partnerType: (sp.type as PartnerType) || undefined,
    sector: (sp.sector as InvestmentSector) || undefined,
    region: (sp.region as MoroccanRegion) || undefined,
    language: (sp.language as Locale) || undefined,
    // Admins preview unverified profiles; everyone else sees verified only.
    verifiedOnly: role !== "admin",
  };

  const partners = matchPartners(all, filter, {
    sector: profile?.sector,
    regions: profile?.targetRegions,
    languages: [locale as Locale],
  });

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold font-serif text-[var(--color-navy)]">
            {t("directoryTitle")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">{t("directorySubtitle")}</p>
        </header>

        <PartnerDirectoryFilters
          locale={locale as Locale}
          values={{ type: sp.type, sector: sp.sector, region: sp.region, language: sp.language }}
        />

        <p className="mt-6 mb-4 text-sm text-gray-500">
          {t("resultCount", { count: partners.length })}
        </p>

        {partners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-12 text-center text-sm text-gray-500">
            {t("noResults")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <PartnerCard key={p.id} locale={locale as Locale} partner={p} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
