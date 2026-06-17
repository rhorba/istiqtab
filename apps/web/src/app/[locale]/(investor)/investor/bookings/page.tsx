import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { formatSlot } from "@/lib/format";
import type { Locale } from "@istiqtab/core";
import { db, expertBookings, expertProfiles, expertSlots, investorProfiles } from "@istiqtab/db";
import type { BookingStatus } from "@istiqtab/experts";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "My sessions" };

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  no_show: "bg-red-50 text-red-700",
};

type Props = { params: Promise<{ locale: string }> };

export default async function InvestorBookingsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/bookings`);
  }
  const role = session.user.role;
  if (role !== "investor" && role !== "consultant" && role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "Bookings" });

  const profile = await db.query.investorProfiles.findFirst({
    where: eq(investorProfiles.userId, session.user.id),
  });

  const rows = profile
    ? await db
        .select({
          id: expertBookings.id,
          status: expertBookings.status,
          meetingUrl: expertBookings.meetingUrl,
          expertName: expertProfiles.name,
          expertTitle: expertProfiles.title,
          startTime: expertSlots.startTime,
          endTime: expertSlots.endTime,
        })
        .from(expertBookings)
        .innerJoin(expertProfiles, eq(expertBookings.expertId, expertProfiles.id))
        .innerJoin(expertSlots, eq(expertBookings.slotId, expertSlots.id))
        .where(eq(expertBookings.investorId, profile.id))
        .orderBy(desc(expertSlots.startTime))
    : [];

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold font-serif text-[var(--color-navy)]">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-gray-500">{t("subtitle")}</p>
        </header>

        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-12 text-center text-sm text-gray-500">
            {t("empty")}{" "}
            <Link
              href="/investor/experts"
              className="font-medium text-[var(--color-gold)] hover:underline"
            >
              {t("browseExperts")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {rows.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--color-navy)]">{b.expertName}</p>
                    <p className="text-sm text-gray-500">{b.expertTitle}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status]}`}
                  >
                    {t(`status_${b.status}`)}
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-600">
                  {formatSlot(b.startTime, b.endTime, locale as Locale)}
                </p>

                {b.status === "confirmed" && b.meetingUrl && (
                  <a
                    href={b.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-lg bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] transition-colors"
                  >
                    {t("joinMeeting")} ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
