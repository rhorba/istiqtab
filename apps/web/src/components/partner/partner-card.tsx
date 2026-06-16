import { Link } from "@/i18n/navigation";
import {
  type Locale,
  PARTNER_TYPE_LABELS,
  REGION_LABELS,
  SECTOR_LABELS,
  label,
} from "@istiqtab/core";
import type { PartnerProfile } from "@istiqtab/db";

type Props = { locale: Locale; partner: PartnerProfile };

const LANG_LABELS: Record<string, string> = { en: "EN", fr: "FR", ar: "AR" };

export function PartnerCard({ locale, partner }: Props) {
  return (
    <Link
      href={`/investor/partners/${partner.id}`}
      className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-navy)]">
          {label(PARTNER_TYPE_LABELS, partner.partnerType, locale)}
        </span>
        {partner.verified && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
            ✓ Verified
          </span>
        )}
      </div>

      <h2 className="mt-3 text-lg font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors">
        {partner.companyName}
      </h2>

      <p className="mt-1.5 line-clamp-3 text-sm text-gray-500">{partner.description}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {partner.sectors.slice(0, 3).map((s) => (
          <span key={s} className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
            {label(SECTOR_LABELS, s, locale)}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          {partner.regions
            .slice(0, 2)
            .map((r) => label(REGION_LABELS, r, locale))
            .join(", ")}
          {partner.regions.length > 2 && ` +${partner.regions.length - 2}`}
        </span>
        <span className="flex items-center gap-2">
          {partner.reviewCount > 0 && (
            <span className="text-[var(--color-gold)]">★ {partner.avgRating.toFixed(1)}</span>
          )}
          <span className="font-medium">
            {partner.languages.map((l) => LANG_LABELS[l] ?? l).join(" · ")}
          </span>
        </span>
      </div>
    </Link>
  );
}
