import { Link } from "@/i18n/navigation";
import { REGION_LABELS, type MoroccanRegion } from "@istiqtab/core";
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
    title: `${t("regionsTitle")} — Istiqtab`,
    description: t("regionsSubtitle"),
  };
}

const ALL_REGIONS = Object.keys(REGION_LABELS) as MoroccanRegion[];

export default async function RegionsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hub" });
  const tRegions = await getTranslations({ locale, namespace: "Regions" });

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[var(--color-navy)] py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <Link href="/hub" className="mb-4 inline-block text-sm text-[var(--color-gold)] hover:underline">
            ← {t("regionProfile.backToHub")}
          </Link>
          <h1 className="font-serif text-4xl font-bold text-white">{t("regionsTitle")}</h1>
          <p className="mt-3 text-gray-300 max-w-2xl">{t("regionsSubtitle")}</p>
        </div>
      </section>
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_REGIONS.map((region) => (
            <Link
              key={region}
              href={`/hub/regions/${region}`}
              className="group rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <h2 className="font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors">
                {tRegions(region as Parameters<typeof tRegions>[0])}
              </h2>
              <p className="mt-1 text-xs text-gray-400">{REGION_LABELS[region].en}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
