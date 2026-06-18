import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { db, criRegions } from "@istiqtab/db";
import { REGION_LABELS, SECTOR_LABELS, type MoroccanRegion } from "@istiqtab/core";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ locale: string; region: string }> };

const ALL_REGIONS = Object.keys(REGION_LABELS) as MoroccanRegion[];

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    ALL_REGIONS.map((region) => ({ locale, region })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, region } = await params;
  if (!ALL_REGIONS.includes(region as MoroccanRegion)) return {};
  const regionLabel = REGION_LABELS[region as MoroccanRegion]?.en ?? region;
  return {
    title: `Invest in ${regionLabel} — Morocco CRI Profile — Istiqtab`,
    description: `Regional Investment Centre profile for ${regionLabel}: industrial zones, key sectors, incentives, and CRI contact information.`,
    alternates: { canonical: `/${locale}/hub/regions/${region}` },
  };
}

export default async function RegionProfilePage({ params }: Props) {
  const { locale, region } = await params;
  if (!ALL_REGIONS.includes(region as MoroccanRegion)) notFound();

  const [cri] = await db
    .select()
    .from(criRegions)
    .where(eq(criRegions.region, region as MoroccanRegion))
    .limit(1);

  if (!cri) notFound();

  const t = await getTranslations({ locale, namespace: "Hub" });
  const tSectors = await getTranslations({ locale, namespace: "Sectors" });

  const regionLabel =
    locale === "fr"
      ? cri.nameFr
      : locale === "ar"
        ? cri.nameAr
        : cri.nameEn;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[var(--color-navy)] py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/hub"
            className="mb-4 inline-block text-sm text-[var(--color-gold)] hover:underline"
          >
            ← {t("regionProfile.backToHub")}
          </Link>
          <h1 className="font-serif text-4xl font-bold text-white">{regionLabel}</h1>
          <p className="mt-2 text-[var(--color-gold)]">
            Regional Investment Centre (CRI)
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 space-y-10">
        {/* Summary */}
        {cri.summaryEn && (
          <p className="text-lg text-gray-700 leading-relaxed">
            {locale === "fr" ? cri.summaryFr : locale === "ar" ? cri.summaryAr : cri.summaryEn}
          </p>
        )}

        {/* Quick facts grid */}
        <section className="grid gap-4 sm:grid-cols-2">
          <FactRow label={t("regionProfile.capitalLabel")} value={cri.capital} />
          {cri.landPriceRange && (
            <FactRow label={t("regionProfile.landPriceLabel")} value={cri.landPriceRange} />
          )}
          {cri.portAccess && (
            <FactRow label={t("regionProfile.portAccessLabel")} value={cri.portAccess} />
          )}
          {cri.talentPool && (
            <FactRow label={t("regionProfile.talentPoolLabel")} value={cri.talentPool} />
          )}
        </section>

        {/* Key sectors */}
        {cri.keySectors.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
              {t("regionProfile.keySectorsLabel")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {cri.keySectors.map((s) => (
                <Link
                  key={s}
                  href={`/hub/sectors/${s}`}
                  className="rounded-full border border-[var(--color-navy)] px-4 py-1.5 text-sm font-medium text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-white transition-colors"
                >
                  {tSectors(s as Parameters<typeof tSectors>[0])}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Industrial zones */}
        {(cri.industrialZones as string[]).length > 0 && (
          <section>
            <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
              {t("regionProfile.industrialZonesLabel")}
            </h2>
            <ul className="space-y-2">
              {(cri.industrialZones as string[]).map((zone) => (
                <li key={zone} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1 text-[var(--color-gold)] shrink-0">▪</span>
                  {zone}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CRI contact */}
        <section>
          <h2 className="font-serif text-2xl font-bold text-[var(--color-navy)] mb-4">
            {t("regionProfile.criContactLabel")}
          </h2>
          <div className="rounded-xl border border-gray-200 p-6 space-y-3 bg-gray-50">
            {cri.criContactName && (
              <p className="font-semibold text-[var(--color-navy)]">{cri.criContactName}</p>
            )}
            {cri.criContactEmail && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t("regionProfile.criEmailLabel")}:</span>{" "}
                <a
                  href={`mailto:${cri.criContactEmail}`}
                  className="text-[var(--color-navy)] underline underline-offset-2"
                >
                  {cri.criContactEmail}
                </a>
              </p>
            )}
            {cri.criContactPhone && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t("regionProfile.criPhoneLabel")}:</span>{" "}
                {cri.criContactPhone}
              </p>
            )}
            {cri.criWebsite && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t("regionProfile.criWebsiteLabel")}:</span>{" "}
                <a
                  href={cri.criWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-navy)] underline underline-offset-2"
                >
                  {cri.criWebsite}
                </a>
              </p>
            )}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl bg-[var(--color-navy)] p-8 text-center">
          <h3 className="font-serif text-xl font-bold text-white mb-2">
            Calculate incentives for {regionLabel}
          </h3>
          <p className="text-gray-300 text-sm mb-6">
            See exactly which Investment Charter 2022 incentives apply to your project in this region.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/calculator"
              className="rounded-lg bg-[var(--color-gold)] px-6 py-3 font-semibold text-[var(--color-navy)] hover:opacity-90 transition-opacity"
            >
              {t("regionProfile.ctaCalculator")}
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg border border-white px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {t("regionProfile.ctaWizard")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 font-medium text-[var(--color-navy)]">{value}</p>
    </div>
  );
}
