import { auth } from "@/auth";
import { SlotManager, type SlotRow } from "@/components/expert/slot-manager";
import { Link } from "@/i18n/navigation";
import { formatSlot } from "@/lib/format";
import type { Locale } from "@istiqtab/core";
import { db, expertBookings, expertProfiles, expertSlots } from "@istiqtab/db";
import type { BookingStatus } from "@istiqtab/experts";
import { asc, desc, eq } from "drizzle-orm";
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

export default async function ExpertSessionsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/expert/sessions`);
  }
  if (session.user.role !== "expert" && session.user.role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "Sessions" });

  const expert = await db.query.expertProfiles.findFirst({
    where: eq(expertProfiles.userId, session.user.id),
  });

  if (!expert) {
    return (
      <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-12 text-center">
          <p className="text-sm text-gray-500">{t("noProfile")}</p>
          <Link
            href="/expert/profile"
            className="mt-4 inline-block font-medium text-[var(--color-gold)] hover:underline"
          >
            {t("createProfile")} →
          </Link>
        </div>
      </main>
    );
  }

  const slots = await db
    .select()
    .from(expertSlots)
    .where(eq(expertSlots.expertId, expert.id))
    .orderBy(asc(expertSlots.startTime));

  const slotRows: SlotRow[] = slots.map((s) => ({
    id: s.id,
    label: formatSlot(s.startTime, s.endTime, locale as Locale),
    booked: s.booked,
  }));

  const bookings = await db
    .select({
      id: expertBookings.id,
      status: expertBookings.status,
      meetingUrl: expertBookings.meetingUrl,
      startTime: expertSlots.startTime,
      endTime: expertSlots.endTime,
    })
    .from(expertBookings)
    .innerJoin(expertSlots, eq(expertBookings.slotId, expertSlots.id))
    .where(eq(expertBookings.expertId, expert.id))
    .orderBy(desc(expertSlots.startTime));

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2">
        <section>
          <h1 className="mb-2 text-2xl font-semibold font-serif text-[var(--color-navy)]">
            {t("availabilityTitle")}
          </h1>
          <p className="mb-6 text-sm text-gray-500">{t("availabilitySubtitle")}</p>
          <SlotManager
            slots={slotRows}
            labels={{
              addHeading: t("addHeading"),
              startLabel: t("startLabel"),
              durationLabel: t("durationLabel"),
              min30: t("min30"),
              min60: t("min60"),
              add: t("add"),
              adding: t("adding"),
              added: t("added"),
              booked: t("booked"),
              remove: t("remove"),
              empty: t("noSlots"),
            }}
          />
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-semibold font-serif text-[var(--color-navy)]">
            {t("bookingsTitle")}
          </h2>
          <p className="mb-6 text-sm text-gray-500">{t("bookingsSubtitle")}</p>

          {bookings.length === 0 ? (
            <p className="text-sm text-gray-500">{t("noBookings")}</p>
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-[var(--color-navy)]">
                      {formatSlot(b.startTime, b.endTime, locale as Locale)}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[b.status]}`}
                    >
                      {t(`status_${b.status}`)}
                    </span>
                  </div>
                  {b.status === "confirmed" && b.meetingUrl && (
                    <a
                      href={b.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-[var(--color-gold)] hover:underline"
                    >
                      {t("joinMeeting")} ↗
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
