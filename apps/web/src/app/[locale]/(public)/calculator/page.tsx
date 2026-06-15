import { auth } from "@/auth";
import { CalculatorForm } from "@/components/calculator/calculator-form";
import type { Locale } from "@istiqtab/core";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Calculator" });
  return { title: t("title"), description: t("subtitle") };
}

// Public, no-auth incentives calculator (DoD §10.2 — the conversion hook).
// Anonymous investors can compute before creating an account; logged-in
// investors additionally get "Save & Track".
export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Calculator" });

  const session = await auth();
  const canSave = ["investor", "consultant", "admin"].includes(session?.user?.role ?? "");

  return (
    <main className="min-h-screen bg-[var(--color-surface-muted)] px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-gold-600)]">
            Investment Charter 2022
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[var(--color-navy)]">
            {t("title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500">{t("subtitle")}</p>
        </header>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <CalculatorForm locale={locale as Locale} canSave={canSave} />
        </div>
      </div>
    </main>
  );
}
