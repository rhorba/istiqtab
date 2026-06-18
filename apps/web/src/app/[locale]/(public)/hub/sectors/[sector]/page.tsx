import { Link } from "@/i18n/navigation";
import { GUIDE_SECTORS, SECTOR_GUIDES } from "@/lib/sector-guides";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; sector: string }> };

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    GUIDE_SECTORS.map((sector) => ({ locale, sector })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, sector } = await params;
  const guide = SECTOR_GUIDES[sector];
  if (!guide) return {};
  const tSectors = await getTranslations({ locale, namespace: "Sectors" });
  const sectorLabel = tSectors(guide.sector as Parameters<typeof tSectors>[0]);
  return {
    title: `Invest in Morocco's ${sectorLabel} Sector — Istiqtab`,
    description: guide.tagline,
    alternates: { canonical: `/${locale}/hub/sectors/${sector}` },
  };
}

export default async function SectorGuidePage({ params }: Props) {
  const { locale, sector } = await params;
  const guide = SECTOR_GUIDES[sector];
  if (!guide) notFound();

  const t = await getTranslations({ locale, namespace: "Hub" });
  const tSectors = await getTranslations({ locale, namespace: "Sectors" });
  const sectorLabel = tSectors(guide.sector as Parameters<typeof tSectors>[0]);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[var(--color-navy)] py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/hub"
            className="mb-4 inline-block text-sm text-[var(--color-gold)] hover:underline"
          >
            ← {t("sectorGuide.backToHub")}
          </Link>
          <h1 className="font-serif text-4xl font-bold text-white">
            {sectorLabel} in Morocco
          </h1>
          <p className="mt-3 text-lg text-gray-300 max-w-2xl">{guide.tagline}</p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 space-y-12">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {guide.stats.map((s) => (
            <div key={s.label} className="rounded-lg bg-gray-50 border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-[var(--color-navy)]">{s.value}</p>
              <p className="mt-1 text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Overview */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
            {t("sectorGuide.overviewHeading")}
          </h2>
          <p className="text-gray-700 leading-relaxed">{guide.overview}</p>
        </section>

        {/* Top regions */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
            Top Regions
          </h2>
          <div className="flex flex-wrap gap-2">
            {guide.topRegions.map((r) => (
              <span
                key={r}
                className="rounded-full border border-[var(--color-navy)] px-4 py-1.5 text-sm font-medium text-[var(--color-navy)]"
              >
                {r}
              </span>
            ))}
          </div>
        </section>

        {/* Incentives */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
            {t("sectorGuide.incentivesHeading")}
          </h2>
          <ul className="space-y-2">
            {guide.incentiveHighlights.map((item) => (
              <li key={item} className="flex items-start gap-2 text-gray-700">
                <span className="mt-1 text-[var(--color-gold)] shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-gray-400 border-t pt-4">{t("sectorGuide.disclaimer")}</p>
        </section>

        {/* Key players */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
            {t("sectorGuide.keyPlayersHeading")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {guide.keyPlayers.map((p) => (
              <span
                key={p}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700"
              >
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* Setup notes */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
            {t("sectorGuide.setupHeading")}
          </h2>
          <ul className="space-y-2">
            {guide.setupNotes.map((note) => (
              <li key={note} className="flex items-start gap-2 text-gray-700">
                <span className="mt-1 text-[var(--color-navy)] shrink-0">→</span>
                {note}
              </li>
            ))}
          </ul>
        </section>

        {/* Regulatory bodies */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
            {t("sectorGuide.criHeading")}
          </h2>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {guide.regulatoryBodies.map((body) => (
              <div key={body.name} className="flex items-start gap-4 p-4">
                <span className="min-w-[120px] font-semibold text-[var(--color-navy)] text-sm">
                  {body.name}
                </span>
                <span className="text-sm text-gray-600">{body.role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl bg-[var(--color-navy)] p-8 text-center">
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            Calculate your {sectorLabel} incentives
          </h3>
          <p className="text-gray-300 text-sm mb-6">
            Get a personalised incentives breakdown for your investment size and target region.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/calculator"
              className="rounded-lg bg-[var(--color-gold)] px-6 py-3 font-semibold text-[var(--color-navy)] hover:opacity-90 transition-opacity"
            >
              {t("sectorGuide.ctaCalculator")}
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {t("sectorGuide.ctaWizard")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
