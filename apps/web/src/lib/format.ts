import type { Locale } from "@istiqtab/core";

const LOCALE_TAG: Record<Locale, string> = { en: "en-GB", fr: "fr-FR", ar: "ar-MA" };

/** Hourly rate label, preferring EUR for the international audience when set. */
export function formatRate(
  rate: { hourlyRateMAD: number; hourlyRateEUR?: number | null },
  locale: Locale,
): string {
  if (rate.hourlyRateEUR != null) {
    const eur = new Intl.NumberFormat(LOCALE_TAG[locale], {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(rate.hourlyRateEUR);
    return `${eur}/hr`;
  }
  const mad = new Intl.NumberFormat(LOCALE_TAG[locale]).format(rate.hourlyRateMAD);
  return `${mad} MAD/hr`;
}

/** Date + time of a slot, rendered in UTC (slot times are stored with tz). */
export function formatSlot(start: Date, end: Date, locale: Locale): string {
  const day = new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(start);
  const time = (d: Date) =>
    new Intl.DateTimeFormat(LOCALE_TAG[locale], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(d);
  return `${day} · ${time(start)}–${time(end)} UTC`;
}
