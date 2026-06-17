import { Link } from "@/i18n/navigation";
import { type Locale, SECTOR_LABELS, label } from "@istiqtab/core";
import type { ExpertProfile } from "@istiqtab/db";

type Props = { locale: Locale; expert: ExpertProfile; rateLabel: string };

const LANG_LABELS: Record<string, string> = { en: "EN", fr: "FR", ar: "AR" };

export function ExpertCard({ locale, expert, rateLabel }: Props) {
  return (
    <Link
      href={`/investor/experts/${expert.id}`}
      className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-gold)] transition-colors">
          {expert.name}
        </h2>
        {expert.verified && (
          <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
            ✓
          </span>
        )}
      </div>

      <p className="mt-1 text-sm font-medium text-gray-600">{expert.title}</p>
      <p className="mt-2 line-clamp-2 text-sm text-gray-500">{expert.bio}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {expert.specializations.slice(0, 3).map((s) => (
          <span key={s} className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
            {label(SECTOR_LABELS, s, locale)}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="font-semibold text-[var(--color-navy)]">{rateLabel}</span>
        <span className="flex items-center gap-2">
          {expert.sessionCount > 0 && (
            <span className="text-[var(--color-gold)]">★ {expert.avgRating.toFixed(1)}</span>
          )}
          <span className="font-medium">
            {expert.languages.map((l) => LANG_LABELS[l] ?? l).join(" · ")}
          </span>
        </span>
      </div>
    </Link>
  );
}
