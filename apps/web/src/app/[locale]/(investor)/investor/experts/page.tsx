import { auth } from "@/auth";
import { ExpertCard } from "@/components/expert/expert-card";
import { ExpertDirectoryFilters } from "@/components/expert/expert-directory-filters";
import { formatRate } from "@/lib/format";
import type { InvestmentSector, Locale } from "@istiqtab/core";
import { db, expertProfiles, investorProfiles } from "@istiqtab/db";
import { type ExpertFilter, matchExperts } from "@istiqtab/experts";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Book an expert" };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sector?: string; language?: string; maxRate?: string }>;
};

export default async function ExpertDirectoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/experts`);
  }
  const role = session.user.role;
  if (role !== "investor" && role !== "consultant" && role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "Experts" });

  const profile = await db.query.investorProfiles.findFirst({
    where: eq(investorProfiles.userId, session.user.id),
  });

  // Small set → fetch + match in-memory via the experts engine.
  const all = await db.select().from(expertProfiles);

  const maxRate = sp.maxRate ? Number(sp.maxRate) : undefined;
  const filter: ExpertFilter = {
    sector: (sp.sector as InvestmentSector) || undefined,
    language: (sp.language as Locale) || undefined,
    maxRateMAD: Number.isFinite(maxRate) ? maxRate : undefined,
    // Admins preview unverified profiles; everyone else sees verified only.
    verifiedOnly: role !== "admin",
  };

  const experts = matchExperts(all, filter, {
    sector: profile?.sector,
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

        <ExpertDirectoryFilters
          locale={locale as Locale}
          values={{ sector: sp.sector, language: sp.language, maxRate: sp.maxRate }}
        />

        <p className="mt-6 mb-4 text-sm text-gray-500">
          {t("resultCount", { count: experts.length })}
        </p>

        {experts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-12 text-center text-sm text-gray-500">
            {t("noResults")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {experts.map((e) => (
              <ExpertCard
                key={e.id}
                locale={locale as Locale}
                expert={e}
                rateLabel={formatRate(e, locale as Locale)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
