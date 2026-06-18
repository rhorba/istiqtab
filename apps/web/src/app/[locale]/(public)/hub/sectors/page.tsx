import { Link } from "@/i18n/navigation";
import { GUIDE_SECTORS, SECTOR_GUIDES } from "@/lib/sector-guides";
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
    title: `${t("sectorsTitle")} — Istiqtab`,
    description: t("sectorsSubtitle"),
  };
}

export default async function SectorsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hub" });
  const tSectors = await getTranslations({ locale, namespace: "Sectors" });

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-[var(--color-navy)] py-14 px-4">
        <div className="mx-auto max-w-4xl">
          <Link href="/hub" className="mb-4 inline-block text-sm text-[var(--color-gold)] hover:underline">
            ← {t("sectorGuide.backToHub")}
          </Link>
          <h1 className="font-serif text-4xl font-bold text-white">{t("sectorsTitle")}</h1>
          <p className="mt-3 text-gray-300 max-w-2xl">{t("sectorsSubtitle")}</p>
        </div>
      </section>
      <section className="px-4 py-14">
        <div className="mx-auto max-w-4xl grid gap-5 sm:grid-cols-2">
          {GUIDE_SECTORS.map((sector) => {
            const guide = SECTOR_GUIDES[sector];
            if (!guide) return null;
            return (
              <Link
                key={sector}
                href={`/hub/sectors/${sector}`}
                className="group rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-lg text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors">
                  {tSectors(sector as Parameters<typeof tSectors>[0])}
                </h2>
                <p className="mt-2 text-sm text-gray-500">{guide.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {guide.stats.slice(0, 2).map((s) => (
                    <span key={s.label} className="text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 text-gray-600">
                      {s.label}: <strong>{s.value}</strong>
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
