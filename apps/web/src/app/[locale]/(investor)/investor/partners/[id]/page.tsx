import { auth } from "@/auth";
import { IntroRequestForm } from "@/components/partner/intro-request-form";
import { Link } from "@/i18n/navigation";
import {
  type Locale,
  PARTNER_TYPE_LABELS,
  REGION_LABELS,
  SECTOR_LABELS,
  label,
} from "@istiqtab/core";
import { db, introductionRequests, investorProfiles, partnerProfiles } from "@istiqtab/db";
import { ACTIVE_INTRO_STATUSES, type IntroStatus } from "@istiqtab/partners";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = { title: "Partner profile" };

const LANG_LABELS: Record<string, string> = { en: "English", fr: "Français", ar: "العربية" };

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function PartnerDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/partners/${id}`);
  }
  const role = session.user.role;
  if (role !== "investor" && role !== "consultant" && role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "Partners" });

  const partner = await db.query.partnerProfiles.findFirst({
    where: eq(partnerProfiles.id, id),
  });
  if (!partner || (!partner.verified && role !== "admin")) {
    notFound();
  }

  // Has this user already an active request to this partner?
  const profile = await db.query.investorProfiles.findFirst({
    where: eq(investorProfiles.userId, session.user.id),
  });
  let activeStatus: IntroStatus | null = null;
  if (profile) {
    const existing = await db
      .select({ status: introductionRequests.status })
      .from(introductionRequests)
      .where(
        and(
          eq(introductionRequests.investorId, profile.id),
          eq(introductionRequests.partnerId, partner.id),
        ),
      );
    const active = existing.find((e) => ACTIVE_INTRO_STATUSES.includes(e.status));
    activeStatus = active?.status ?? null;
  }

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-3">
        {/* ── Profile ── */}
        <div className="lg:col-span-2">
          <Link
            href="/investor/partners"
            className="text-sm text-gray-500 hover:text-[var(--color-navy)]"
          >
            ← {t("backToDirectory")}
          </Link>

          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-navy)]">
                {label(PARTNER_TYPE_LABELS, partner.partnerType, locale as Locale)}
              </span>
              {partner.verified && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                  ✓ {t("verified")}
                </span>
              )}
              {partner.reviewCount > 0 && (
                <span className="text-xs text-[var(--color-gold)]">
                  ★ {partner.avgRating.toFixed(1)} ({partner.reviewCount})
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-semibold font-serif text-[var(--color-navy)]">
              {partner.companyName}
            </h1>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {partner.description}
            </p>

            <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t("sectorsServed")}
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {partner.sectors.map((s) => (
                    <span key={s} className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                      {label(SECTOR_LABELS, s, locale as Locale)}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t("regionsCovered")}
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {partner.regions.map((r) => (
                    <span key={r} className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                      {label(REGION_LABELS, r, locale as Locale)}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t("languages")}
                </dt>
                <dd className="mt-1.5 text-sm text-gray-600">
                  {partner.languages.map((l) => LANG_LABELS[l] ?? l).join(", ")}
                </dd>
              </div>
              {partner.internationalClients && partner.internationalClients.length > 0 && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {t("internationalClients")}
                  </dt>
                  <dd className="mt-1.5 text-sm text-gray-600">
                    {partner.internationalClients.join(", ")}
                  </dd>
                </div>
              )}
            </dl>

            {partner.websiteUrl && (
              <a
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block text-sm font-medium text-[var(--color-gold)] hover:underline"
              >
                {partner.websiteUrl} ↗
              </a>
            )}
          </div>
        </div>

        {/* ── Intro request ── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            {!profile ? (
              <p className="text-sm text-gray-500">{t("profileRequired")}</p>
            ) : activeStatus ? (
              <div>
                <h3 className="text-base font-semibold text-[var(--color-navy)]">
                  {t("requestSent")}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t("currentStatus")}:{" "}
                  <span className="font-medium text-[var(--color-navy)]">
                    {t(`status_${activeStatus}`)}
                  </span>
                </p>
                <Link
                  href="/investor/introductions"
                  className="mt-4 inline-block text-sm font-medium text-[var(--color-gold)] hover:underline"
                >
                  {t("viewMyIntroductions")} →
                </Link>
              </div>
            ) : (
              <IntroRequestForm
                partnerId={partner.id}
                labels={{
                  heading: t("requestHeading"),
                  placeholder: t("requestPlaceholder"),
                  submit: t("requestSubmit"),
                  submitting: t("requestSubmitting"),
                  success: t("requestSuccess"),
                  mediation: t("requestMediation"),
                }}
              />
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
