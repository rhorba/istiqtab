import { Link } from "@/i18n/navigation";
import { toOptions } from "@/lib/options";
import { type Locale, PARTNER_TYPE_LABELS, REGION_LABELS, SECTOR_LABELS } from "@istiqtab/core";
import { getTranslations } from "next-intl/server";

type Values = { type?: string; sector?: string; region?: string; language?: string };
type Props = { locale: Locale; values: Values };

const selectCls =
  "w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:border-[var(--color-gold)] focus:outline-none";

/**
 * Plain GET form — server-rendered, no client JS. Submitting updates the URL
 * searchParams which the directory page reads to filter.
 */
export async function PartnerDirectoryFilters({ locale, values }: Props) {
  const t = await getTranslations({ locale, namespace: "Partners" });

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "ar", label: "العربية" },
  ];

  return (
    <form
      method="get"
      className="grid grid-cols-1 gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <label className="text-xs font-medium text-gray-600">
        {t("filterType")}
        <select name="type" defaultValue={values.type ?? ""} className={`mt-1 ${selectCls}`}>
          <option value="">{t("any")}</option>
          {toOptions(PARTNER_TYPE_LABELS, locale).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs font-medium text-gray-600">
        {t("filterSector")}
        <select name="sector" defaultValue={values.sector ?? ""} className={`mt-1 ${selectCls}`}>
          <option value="">{t("any")}</option>
          {toOptions(SECTOR_LABELS, locale).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs font-medium text-gray-600">
        {t("filterRegion")}
        <select name="region" defaultValue={values.region ?? ""} className={`mt-1 ${selectCls}`}>
          <option value="">{t("any")}</option>
          {toOptions(REGION_LABELS, locale).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs font-medium text-gray-600">
        {t("filterLanguage")}
        <select
          name="language"
          defaultValue={values.language ?? ""}
          className={`mt-1 ${selectCls}`}
        >
          <option value="">{t("any")}</option>
          {languageOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] transition-colors"
        >
          {t("apply")}
        </button>
        <Link
          href="/investor/partners"
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          {t("clear")}
        </Link>
      </div>
    </form>
  );
}
