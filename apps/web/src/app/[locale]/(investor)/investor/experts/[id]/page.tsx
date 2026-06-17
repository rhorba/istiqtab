import { auth } from "@/auth";
import { BookSlotForm, type SlotOption } from "@/components/expert/book-slot-form";
import { Link } from "@/i18n/navigation";
import { formatRate, formatSlot } from "@/lib/format";
import { type Locale, SECTOR_LABELS, label } from "@istiqtab/core";
import { db, expertProfiles, expertSlots, investorProfiles } from "@istiqtab/db";
import { availableSlots } from "@istiqtab/experts";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = { title: "Expert profile" };

const LANG_LABELS: Record<string, string> = { en: "English", fr: "Français", ar: "العربية" };

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function ExpertDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/experts/${id}`);
  }
  const role = session.user.role;
  if (role !== "investor" && role !== "consultant" && role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "Experts" });

  const expert = await db.query.expertProfiles.findFirst({
    where: eq(expertProfiles.id, id),
  });
  if (!expert || (!expert.verified && role !== "admin")) {
    notFound();
  }

  const profile = await db.query.investorProfiles.findFirst({
    where: eq(investorProfiles.userId, session.user.id),
  });

  const slots = await db.select().from(expertSlots).where(eq(expertSlots.expertId, expert.id));
  const open = availableSlots(slots);
  const slotOptions: SlotOption[] = open.map((s) => ({
    id: s.id,
    label: formatSlot(s.startTime, s.endTime, locale as Locale),
  }));

  const bio = (locale === "fr" && expert.bioFr) || (locale === "ar" && expert.bioAr) || expert.bio;

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-3">
        {/* ── Profile ── */}
        <div className="lg:col-span-2">
          <Link
            href="/investor/experts"
            className="text-sm text-gray-500 hover:text-[var(--color-navy)]"
          >
            ← {t("backToDirectory")}
          </Link>

          <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {expert.verified && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                  ✓ {t("verified")}
                </span>
              )}
              {expert.sessionCount > 0 && (
                <span className="text-xs text-[var(--color-gold)]">
                  ★ {expert.avgRating.toFixed(1)} ·{" "}
                  {t("sessionCount", { count: expert.sessionCount })}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-semibold font-serif text-[var(--color-navy)]">
              {expert.name}
            </h1>
            <p className="mt-1 text-base font-medium text-gray-600">{expert.title}</p>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-600">{bio}</p>

            <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t("specializations")}
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {expert.specializations.map((s) => (
                    <span key={s} className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                      {label(SECTOR_LABELS, s, locale as Locale)}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t("languages")}
                </dt>
                <dd className="mt-1.5 text-sm text-gray-600">
                  {expert.languages.map((l) => LANG_LABELS[l] ?? l).join(", ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t("rate")}
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-[var(--color-navy)]">
                  {formatRate(expert, locale as Locale)}
                </dd>
              </div>
              {expert.linkedinUrl && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    LinkedIn
                  </dt>
                  <dd className="mt-1.5">
                    <a
                      href={expert.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[var(--color-gold)] hover:underline"
                    >
                      {t("viewProfile")} ↗
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* ── Booking ── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            {!profile ? (
              <p className="text-sm text-gray-500">{t("profileRequired")}</p>
            ) : (
              <BookSlotForm
                slots={slotOptions}
                labels={{
                  heading: t("bookHeading"),
                  pick: t("pickSlot"),
                  submit: t("bookSubmit"),
                  submitting: t("bookSubmitting"),
                  success: t("bookSuccess"),
                  noSlots: t("noSlots"),
                }}
              />
            )}
            <p className="mt-4 text-xs text-gray-400">{t("bookingNote")}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
