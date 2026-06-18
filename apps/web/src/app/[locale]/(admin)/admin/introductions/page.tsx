import { IntroAdminActions } from "@/components/partner/intro-admin-actions";
import { db, introductionRequests, investorProfiles, partnerProfiles, users } from "@istiqtab/db";
import type { IntroStatus } from "@istiqtab/partners";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Introduction requests" };

const STATUS_STYLES: Record<IntroStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  declined: "bg-gray-100 text-gray-500",
};

type Props = { params: Promise<{ locale: string }> };

export default async function AdminIntroductionsPage({ params }: Props) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: "Partners" });

  const rows = await db
    .select({
      id: introductionRequests.id,
      status: introductionRequests.status,
      message: introductionRequests.message,
      createdAt: introductionRequests.createdAt,
      partnerName: partnerProfiles.companyName,
      investorCompany: investorProfiles.companyName,
      investorName: users.name,
      investorEmail: users.email,
    })
    .from(introductionRequests)
    .innerJoin(partnerProfiles, eq(introductionRequests.partnerId, partnerProfiles.id))
    .innerJoin(investorProfiles, eq(introductionRequests.investorId, investorProfiles.id))
    .innerJoin(users, eq(investorProfiles.userId, users.id))
    .orderBy(desc(introductionRequests.createdAt));

  const statusLabels: Record<IntroStatus, string> = {
    pending: t("status_pending"),
    accepted: t("status_accepted"),
    completed: t("status_completed"),
    declined: t("status_declined"),
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-[var(--color-navy)]">
          {t("adminTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-400">{t("adminSubtitle")}</p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-12 text-center text-sm text-gray-500">
          {t("adminEmpty")}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-navy)]">
                      {r.investorCompany ?? r.investorName ?? r.investorEmail}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-sm font-semibold text-[var(--color-navy)]">
                      {r.partnerName}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}
                    >
                      {statusLabels[r.status]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{r.message}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {r.investorEmail} · {r.createdAt.toLocaleDateString(locale)}
                  </p>
                </div>
                <IntroAdminActions requestId={r.id} status={r.status} labels={statusLabels} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
