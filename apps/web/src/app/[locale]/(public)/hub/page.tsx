import { Link } from "@/i18n/navigation";
import { SECTOR_GUIDES } from "@/lib/sector-guides";
import { REGION_LABELS } from "@istiqtab/core";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hub" });
  return {
    title: `${t("title")} — Istiqtab`,
    description: t("subtitle"),
    alternates: { canonical: `/${locale}/hub` },
  };
}

const MOROCCAN_REGIONS = Object.keys(REGION_LABELS) as (keyof typeof REGION_LABELS)[];

export default async function HubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hub" });
  const tSectors = await getTranslations({ locale, namespace: "Sectors" });
  const tRegions = await getTranslations({ locale, namespace: "Regions" });

  const guideEntries = Object.entries(SECTOR_GUIDES);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-[var(--color-navy)] py-16 px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-4xl font-bold text-white md:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-lg text-[var(--color-gold)] leading-relaxed">{t("subtitle")}</p>
        </div>
      </section>

      {/* Sector guides */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[var(--color-navy)]">
                {t("sectorsTitle")}
              </h2>
              <p className="mt-2 max-w-xl text-gray-600">{t("sectorsSubtitle")}</p>
            </div>
            <Link
              href="/hub/sectors"
              className="hidden text-sm font-medium text-[var(--color-navy)] underline underline-offset-4 md:block"
            >
              {t("viewAllSectors")} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guideEntries.map(([key, guide]) => (
              <Link
                key={key}
                href={`/hub/sectors/${key}`}
                className="group rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md"
              >
                <h3 className="font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors">
                  {tSectors(guide.sector as Parameters<typeof tSectors>[0])}
                </h3>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{guide.tagline}</p>
                <p className="mt-3 text-xs font-medium text-[var(--color-gold)]">
                  {guide.stats[0]?.label}: {guide.stats[0]?.value}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-6 md:hidden">
            <Link
              href="/hub/sectors"
              className="text-sm font-medium text-[var(--color-navy)] underline underline-offset-4"
            >
              {t("viewAllSectors")} →
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* CRI regions */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[var(--color-navy)]">
                {t("regionsTitle")}
              </h2>
              <p className="mt-2 max-w-xl text-gray-600">{t("regionsSubtitle")}</p>
            </div>
            <Link
              href="/hub/regions"
              className="hidden text-sm font-medium text-[var(--color-navy)] underline underline-offset-4 md:block"
            >
              {t("viewAllRegions")} →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MOROCCAN_REGIONS.map((region) => (
              <Link
                key={region}
                href={`/hub/regions/${region}`}
                className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div>
                  <span className="font-medium text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors">
                    {tRegions(region as Parameters<typeof tRegions>[0])}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{REGION_LABELS[region].en}</p>
                </div>
                <span className="text-gray-300 group-hover:text-[var(--color-gold)] transition-colors">
                  →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-6 md:hidden">
            <Link
              href="/hub/regions"
              className="text-sm font-medium text-[var(--color-navy)] underline underline-offset-4"
            >
              {t("viewAllRegions")} →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[var(--color-navy)] py-12 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-2xl font-bold text-white">
            Ready to calculate your incentives?
          </h2>
          <p className="mt-3 text-[var(--color-gold)]">
            Use our free calculator to see exactly which Investment Charter 2022 incentives apply to
            your sector, investment size, and chosen region.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/calculator"
              className="rounded-lg bg-[var(--color-gold)] px-6 py-3 font-semibold text-[var(--color-navy)] hover:opacity-90 transition-opacity"
            >
              Incentives Calculator →
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Start Setup Wizard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
