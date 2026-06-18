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
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("title"), description: t("description") };
}

// Show the top 6 sectors with the most compelling stats on the landing page.
const FEATURED_SECTORS = ["automotive", "renewables", "bpo_ites", "agrifood", "tourism", "aerospace"] as const;

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });
  const tSectors = await getTranslations({ locale, namespace: "Sectors" });

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-navy)] py-20 px-4 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-5xl font-bold text-white leading-tight md:text-6xl">
            {t("hero.headline")}
          </h1>
          <p className="mt-3 font-serif text-3xl text-[var(--color-gold)] md:text-4xl">
            {t("hero.headlineSub")}
          </p>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-gray-300 leading-relaxed">
            {t("hero.body")}
          </p>

          {/* Stat pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {(["fdi", "growth", "target", "sectors"] as const).map((key) => (
              <span
                key={key}
                className="rounded-full border border-[var(--color-gold)]/40 px-5 py-2 text-sm font-medium text-[var(--color-gold)]"
              >
                {t(`hero.stats.${key}`)}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/calculator"
              className="rounded-lg bg-[var(--color-gold)] px-8 py-4 text-lg font-bold text-[var(--color-navy)] hover:opacity-90 transition-opacity"
            >
              {t("hero.ctaCalculator")} →
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg border-2 border-white px-8 py-4 text-lg font-bold text-white hover:bg-white/10 transition-colors"
            >
              {t("hero.ctaWizard")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-8 px-4">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-6">
            What Istiqtab covers
          </p>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            {[
              { icon: "🗂", label: "Setup Wizard", sub: "Personalised company setup checklist" },
              { icon: "📊", label: "Incentives Calculator", sub: "Investment Charter 2022 rules" },
              { icon: "🤝", label: "Partner Finder", sub: "Vetted local firms & distributors" },
              { icon: "🤖", label: "AI Advisor", sub: "24/7 investment Q&A" },
            ].map((item) => (
              <div key={item.label} className="p-4">
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-semibold text-[var(--color-navy)] text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sector cards ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-[var(--color-navy)] md:text-4xl">
              {t("sectors.title")}
            </h2>
            <p className="mt-3 mx-auto max-w-2xl text-gray-600">{t("sectors.subtitle")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_SECTORS.map((sector) => {
              const guide = SECTOR_GUIDES[sector];
              if (!guide) return null;
              const stat = guide.stats[0];
              return (
                <Link
                  key={sector}
                  href={`/hub/sectors/${sector}`}
                  className="group rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[var(--color-gold)]/40 transition-all"
                >
                  <h3 className="font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors">
                    {tSectors(sector as Parameters<typeof tSectors>[0])}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{guide.tagline}</p>
                  {stat && (
                    <p className="mt-3 text-xs font-medium text-[var(--color-gold)]">
                      {stat.label}: {stat.value}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/hub"
              className="inline-block text-sm font-medium text-[var(--color-navy)] underline underline-offset-4 hover:text-[var(--color-gold)]"
            >
              View all sector guides in the Intelligence Hub →
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-16 border-t border-gray-100">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-serif text-3xl font-bold text-[var(--color-navy)] text-center mb-10">
            From interested to operational — in weeks, not months
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Calculate your incentives",
                body: "Run the free calculator. See your IS exemption, VAT relief, land subsidy, and employment premiums — before signing anything.",
              },
              {
                step: "02",
                title: "Follow your setup wizard",
                body: "Your personalised checklist: RC → ICE → CNSS → bank account → sector licence → work permits. Every step has official links and document requirements.",
              },
              {
                step: "03",
                title: "Book an expert or find a partner",
                body: "Connect with vetted investment lawyers, tax advisors, and local distributors. We broker the introduction — you focus on the deal.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-xl bg-white border border-gray-200 p-6">
                <span className="text-4xl font-bold text-[var(--color-gold)]/30 font-serif">
                  {item.step}
                </span>
                <h3 className="mt-2 font-semibold text-[var(--color-navy)]">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-navy)] py-16 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-[var(--color-gold)] text-sm uppercase tracking-widest mb-4">
            Morocco's first AI-powered FDI platform
          </p>
          <h2 className="font-serif text-3xl font-bold text-white">
            AMDIE tells you Morocco is open for business.
          </h2>
          <p className="mt-2 font-serif text-2xl text-[var(--color-gold)]">
            Istiqtab tells you exactly how to open yours.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/calculator"
              className="rounded-lg bg-[var(--color-gold)] px-8 py-4 font-bold text-[var(--color-navy)] hover:opacity-90 transition-opacity"
            >
              Free Incentives Calculator
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg border-2 border-white px-8 py-4 font-bold text-white hover:bg-white/10 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            No account required for the calculator. Setup wizard and advisor require a free account.
          </p>
        </div>
      </section>
    </main>
  );
}
