"use client";

import {
  type CalculatorState,
  runCalculator,
  saveCalculatorResult,
} from "@/app/[locale]/(public)/calculator/actions";
import {
  ACTIVITY_LABELS,
  ActivityTypeSchema,
  BRACKET_LABELS,
  INCENTIVE_TYPE_LABELS,
  type IncentiveType,
  InvestmentBracketSchema,
  InvestmentSectorSchema,
  type Locale,
  MoroccanRegionSchema,
  REGION_LABELS,
  SECTOR_LABELS,
  type TriLabel,
  label,
} from "@istiqtab/core";
import { useTranslations } from "next-intl";
import { useActionState, useState, useTransition } from "react";

type Props = {
  locale: Locale;
  /** Whether the viewer can persist the result to their wizard (logged-in investor). */
  canSave: boolean;
};

const CONFIDENCE_STYLES: Record<string, string> = {
  confirmed: "bg-green-50 text-green-700",
  indicative: "bg-amber-50 text-amber-700",
  requires_verification: "bg-gray-100 text-gray-600",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  indicative: "Indicative",
  requires_verification: "Verify with CRI",
};

const initialState: CalculatorState = {};

const selectClass =
  "w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-navy)] outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]";

function EnumSelect<K extends string>({
  name,
  options,
  labels,
  locale,
  defaultValue,
}: {
  name: string;
  options: readonly K[];
  labels: Record<K, TriLabel>;
  locale: Locale;
  defaultValue?: K;
}) {
  return (
    <select
      id={name}
      name={name}
      required
      defaultValue={defaultValue ?? ""}
      className={selectClass}
    >
      {!defaultValue && (
        <option value="" disabled>
          —
        </option>
      )}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {label(labels, opt, locale)}
        </option>
      ))}
    </select>
  );
}

export function CalculatorForm({ locale, canSave }: Props) {
  const t = useTranslations("Calculator");
  const [state, action, isPending] = useActionState(runCalculator, initialState);

  const result = state.result;
  const comparison = state.comparison;

  return (
    <div className="space-y-8">
      <form action={action} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("steps.sector")} htmlFor="sector">
          <EnumSelect
            name="sector"
            options={InvestmentSectorSchema.options}
            labels={SECTOR_LABELS}
            locale={locale}
          />
        </Field>

        <Field label={t("steps.activity")} htmlFor="activityType">
          <EnumSelect
            name="activityType"
            options={ActivityTypeSchema.options}
            labels={ACTIVITY_LABELS}
            locale={locale}
          />
        </Field>

        <Field label={t("steps.investment")} htmlFor="investmentBracket">
          <EnumSelect
            name="investmentBracket"
            options={InvestmentBracketSchema.options}
            labels={BRACKET_LABELS}
            locale={locale}
          />
        </Field>

        <Field label={t("steps.region")} htmlFor="region">
          <EnumSelect
            name="region"
            options={MoroccanRegionSchema.options}
            labels={REGION_LABELS}
            locale={locale}
          />
        </Field>

        <Field label={t("steps.jobs")} htmlFor="jobsToCreate">
          <input
            id="jobsToCreate"
            name="jobsToCreate"
            type="number"
            min={0}
            max={100000}
            defaultValue={0}
            className={selectClass}
          />
        </Field>

        <CompareRegions locale={locale} label={t("results.compareRegions")} />

        <div className="sm:col-span-2">
          {state.error && (
            <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[var(--color-navy)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-navy-light)] disabled:opacity-60"
          >
            {isPending ? "Calculating…" : t("title")}
          </button>
        </div>
      </form>

      {result && (
        <Results
          locale={locale}
          state={state}
          canSave={canSave}
          comparison={comparison}
          t={{
            resultsTitle: t("results.title"),
            exportPdf: t("results.exportPdf"),
            saveAndTrack: t("results.saveAndTrack"),
            disclaimer: t("disclaimer"),
          }}
        />
      )}
    </div>
  );
}

function Field({
  label: text,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-[var(--color-navy)]">
        {text}
      </label>
      {children}
    </div>
  );
}

/** Up to two extra regions for the side-by-side comparison (primary + 2). */
function CompareRegions({ locale, label: heading }: { locale: Locale; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:col-span-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-[var(--color-gold-600)] hover:underline"
      >
        {open ? "−" : "+"} {heading}
      </button>
      {open && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MoroccanRegionSchema.options.map((region) => (
            <label
              key={region}
              className="flex items-center gap-2 text-sm text-[var(--color-navy)]"
            >
              <input
                type="checkbox"
                name="compareRegions"
                value={region}
                className="accent-[var(--color-gold)]"
              />
              {label(REGION_LABELS, region, locale)}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Results({
  locale,
  state,
  canSave,
  comparison,
  t,
}: {
  locale: Locale;
  state: CalculatorState;
  canSave: boolean;
  comparison: CalculatorState["comparison"];
  t: { resultsTitle: string; exportPdf: string; saveAndTrack: string; disclaimer: string };
}) {
  const [saved, setSaved] = useState(false);
  const [isSaving, startSave] = useTransition();

  const result = state.result;
  if (!result) return null;

  function handleSave() {
    if (!result) return;
    startSave(async () => {
      const res = await saveCalculatorResult({
        sector: result.sector,
        region: result.region,
        activityType: result.activityType,
        investmentBracket: result.investmentBracket,
        jobsToCreate: result.jobsToCreate,
      });
      if (res.ok) setSaved(true);
    });
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-navy)]">
          {t.resultsTitle}
        </h2>
        <div className="flex gap-2">
          {/* PDF export: native POST so the browser handles the download. */}
          <form method="post" action={`/${locale}/calculator/report`}>
            <input type="hidden" name="sector" value={result.sector} />
            <input type="hidden" name="activityType" value={result.activityType} />
            <input type="hidden" name="investmentBracket" value={result.investmentBracket} />
            <input type="hidden" name="region" value={result.region} />
            <input type="hidden" name="jobsToCreate" value={result.jobsToCreate} />
            <button
              type="submit"
              className="rounded-lg border border-[var(--color-navy)] px-4 py-2 text-sm font-medium text-[var(--color-navy)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              {t.exportPdf}
            </button>
          </form>
          {canSave && (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || saved}
              className="rounded-lg bg-[var(--color-gold)] px-4 py-2 text-sm font-semibold text-[var(--color-navy)] transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {saved ? "Saved ✓" : isSaving ? "Saving…" : t.saveAndTrack}
            </button>
          )}
        </div>
      </div>

      <IncentiveList locale={locale} incentives={result.applicableIncentives} />

      {comparison && comparison.length > 1 && (
        <ComparisonTable locale={locale} comparison={comparison} />
      )}

      <p className="mt-6 border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed text-gray-500">
        {t.disclaimer}
      </p>
    </section>
  );
}

function IncentiveList({
  locale,
  incentives,
}: {
  locale: Locale;
  incentives: NonNullable<CalculatorState["result"]>["applicableIncentives"];
}) {
  if (incentives.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No incentives matched this profile in the published Charter data. Contact your CRI to
        explore project-specific support.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {incentives.map((inc, i) => (
        <li
          key={`${inc.type}-${i}`}
          className="flex flex-wrap items-start justify-between gap-3 py-3"
        >
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-navy)]">
              {label(INCENTIVE_TYPE_LABELS, inc.type as IncentiveType, locale)}
            </p>
            <p className="text-sm text-gray-500">{inc.condition}</p>
            {inc.sourceArticle && (
              <p className="mt-0.5 text-xs text-gray-400">{inc.sourceArticle}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[var(--color-navy)]">{inc.value}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${CONFIDENCE_STYLES[inc.confidence] ?? ""}`}
            >
              {CONFIDENCE_LABEL[inc.confidence] ?? inc.confidence}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ComparisonTable({
  locale,
  comparison,
}: {
  locale: Locale;
  comparison: NonNullable<CalculatorState["comparison"]>;
}) {
  // Union of incentive types across the compared regions, in first-seen order.
  const types: IncentiveType[] = [];
  for (const col of comparison) {
    for (const inc of col.applicableIncentives) {
      if (!types.includes(inc.type as IncentiveType)) types.push(inc.type as IncentiveType);
    }
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--color-gold-600)]">
        Region comparison
      </h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-[var(--color-navy)] text-left">
            <th className="py-2 pr-4 font-medium text-gray-500">Incentive</th>
            {comparison.map((col) => (
              <th key={col.region} className="py-2 pr-4 font-semibold text-[var(--color-navy)]">
                {label(REGION_LABELS, col.region, locale)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {types.map((type) => (
            <tr key={type} className="border-b border-[var(--color-border)]">
              <td className="py-2 pr-4 text-[var(--color-navy)]">
                {label(INCENTIVE_TYPE_LABELS, type, locale)}
              </td>
              {comparison.map((col) => {
                const match = col.applicableIncentives.find((i) => i.type === type);
                return (
                  <td key={col.region} className="py-2 pr-4 text-gray-600">
                    {match ? match.value : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
