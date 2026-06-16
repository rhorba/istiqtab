import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { db, introductionRequests, investorProfiles, partnerProfiles } from "@istiqtab/db";
import type { IntroStatus } from "@istiqtab/partners";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "My introductions" };

const STATUS_STYLES: Record<IntroStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  declined: "bg-gray-100 text-gray-500",
};

type Props = { params: Promise<{ locale: string }> };

export default async function MyIntroductionsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/introductions`);
  }
  const role = session.user.role;
  if (role !== "investor" && role !== "consultant" && role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "Partners" });

  const profile = await db.query.investorProfiles.findFirst({
    where: eq(investorProfiles.userId, session.user.id),
  });

  const rows = profile
    ? await db
        .select({
          id: introductionRequests.id,
          status: introductionRequests.status,
          message: introductionRequests.message,
          createdAt: introductionRequests.createdAt,
          partnerId: partnerProfiles.id,
          partnerName: partnerProfiles.companyName,
        })
        .from(introductionRequests)
        .innerJoin(partnerProfiles, eq(introductionRequests.partnerId, partnerProfiles.id))
        .where(eq(introductionRequests.investorId, profile.id))
        .orderBy(desc(introductionRequests.createdAt))
    : [];

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold font-serif text-[var(--color-navy)]">
            {t("myIntroductionsTitle")}
          </h1>
          <p className="mt-2 text-sm text-gray-500">{t("myIntroductionsSubtitle")}</p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-12 text-center text-sm text-gray-500">
            {t("noIntroductions")}{" "}
            <Link
              href="/investor/partners"
              className="font-medium text-[var(--color-gold)] hover:underline"
            >
              {t("browsePartners")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/investor/partners/${r.partnerId}`}
                    className="text-base font-semibold text-[var(--color-navy)] hover:text-[var(--color-gold)]"
                  >
                    {r.partnerName}
                  </Link>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}
                  >
                    {t(`status_${r.status}`)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{r.message}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {r.createdAt.toLocaleDateString(locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
