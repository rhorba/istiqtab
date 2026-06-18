import type { WizardStep } from "@istiqtab/core";
import { db, investorProfiles } from "@istiqtab/db";
import { count, sql } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Wizard Analytics — Admin" };

export default async function AdminWizardPage() {
  // Sector + country breakdown
  const bySector = await db
    .select({ sector: investorProfiles.sector, c: count() })
    .from(investorProfiles)
    .groupBy(investorProfiles.sector)
    .orderBy(sql`count(*) desc`);

  const byCountry = await db
    .select({ country: investorProfiles.companyCountry, c: count() })
    .from(investorProfiles)
    .groupBy(investorProfiles.companyCountry)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  // Wizard completion: compute step stats from stored JSONB
  const profiles = await db
    .select({ wizardSteps: investorProfiles.wizardSteps, sector: investorProfiles.sector })
    .from(investorProfiles);

  // Aggregate step status counts across all profiles
  const stepCounts: Record<string, { label: string; completed: number; total: number }> = {};

  for (const p of profiles) {
    const steps = (p.wizardSteps ?? []) as WizardStep[];
    for (const step of steps) {
      const entry = stepCounts[step.id] ?? { label: step.title, completed: 0, total: 0 };
      entry.total += 1;
      if (step.status === "completed") entry.completed += 1;
      stepCounts[step.id] = entry;
    }
  }

  const stepRows = Object.entries(stepCounts)
    .map(([id, v]) => ({
      id,
      ...v,
      pct: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  const totalProfiles = profiles.length;
  const withSteps = profiles.filter(
    (p) => ((p.wizardSteps ?? []) as WizardStep[]).length > 0,
  ).length;
  const fullyCompleted = profiles.filter((p) => {
    const steps = (p.wizardSteps ?? []) as WizardStep[];
    return steps.length > 0 && steps.every((s) => s.status === "completed");
  }).length;

  const withStepsPct = totalProfiles > 0 ? Math.round((withSteps / totalProfiles) * 100) : 0;
  const fullyCompletedPct = withSteps > 0 ? Math.round((fullyCompleted / withSteps) * 100) : 0;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold font-serif text-[var(--color-navy)]">Wizard Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">
          Setup wizard completion rates by sector and source country
        </p>
      </header>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total profiles", value: totalProfiles },
          { label: "Started wizard", value: withSteps, sub: `${withStepsPct}% of profiles` },
          {
            label: "Fully completed",
            value: fullyCompleted,
            sub: `${fullyCompletedPct}% of started`,
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
            <p className="mt-2 text-4xl font-bold font-serif text-[var(--color-navy)]">{value}</p>
            {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Step completion rates ── */}
      {stepRows.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Step completion rates
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Step
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Completed
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Total
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {stepRows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium text-[var(--color-navy)]">{r.label}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-600">
                      {r.completed}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-600">{r.total}</td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.pct >= 70
                            ? "bg-green-50 text-green-700"
                            : r.pct >= 40
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {r.pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── By sector ── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
          Profiles by sector
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Sector
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Investors
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {bySector.map((r) => (
                <tr key={r.sector}>
                  <td className="px-5 py-3 font-medium text-[var(--color-navy)] capitalize">
                    {r.sector.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-gray-600">{r.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── By source country ── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
          Investors by source country
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Origin
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Investors
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {byCountry.map((r) => (
                <tr key={r.country}>
                  <td className="px-5 py-3 font-medium text-[var(--color-navy)] capitalize">
                    {r.country.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-gray-600">{r.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
