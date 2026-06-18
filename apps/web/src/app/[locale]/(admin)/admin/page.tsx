import {
  aiChatMessages,
  db,
  expertBookings,
  incentiveResults,
  introductionRequests,
  investorProfiles,
  users,
} from "@istiqtab/db";
import { count, eq, gte, sql } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Istiqtab" };

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        accent
          ? "border-[var(--color-gold)]/30 bg-[var(--color-navy)] text-white"
          : "border-[var(--color-border)] bg-white"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${accent ? "text-[var(--color-gold)]" : "text-gray-400"}`}
      >
        {label}
      </p>
      <p
        className={`mt-2 text-4xl font-bold font-serif ${accent ? "text-white" : "text-[var(--color-navy)]"}`}
      >
        {value}
      </p>
      {sub && <p className={`mt-1 text-xs ${accent ? "text-white/60" : "text-gray-400"}`}>{sub}</p>}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">{title}</h2>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminOverviewPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const results = await Promise.all([
    db.select({ c: count() }).from(investorProfiles),
    db.select({ c: count() }).from(expertBookings),
    db
      .select({ c: count() })
      .from(introductionRequests)
      .where(eq(introductionRequests.status, "pending")),
    db.select({ c: count() }).from(aiChatMessages).where(eq(aiChatMessages.role, "user")),
    db.select({ c: count() }).from(incentiveResults),
    db.select({ c: count() }).from(users),
    db
      .select({ c: count() })
      .from(expertBookings)
      .where(gte(expertBookings.confirmedAt, thirtyDaysAgo)),
    db.select({ c: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
  ]);

  const totalInvestors = results[0][0]?.c ?? 0;
  const totalBookings = results[1][0]?.c ?? 0;
  const pendingIntros = results[2][0]?.c ?? 0;
  const totalAiMessages = results[3][0]?.c ?? 0;
  const totalCalcRuns = results[4][0]?.c ?? 0;
  const totalUsers = results[5][0]?.c ?? 0;
  const recentBookings = results[6][0]?.c ?? 0;
  const recentSignups = results[7][0]?.c ?? 0;

  // Sector breakdown
  const sectorRows = await db
    .select({
      sector: investorProfiles.sector,
      c: count(),
    })
    .from(investorProfiles)
    .groupBy(investorProfiles.sector)
    .orderBy(sql`count(*) desc`)
    .limit(6);

  // Booking status breakdown
  const bookingStatusRows = await db
    .select({
      status: expertBookings.status,
      c: count(),
    })
    .from(expertBookings)
    .groupBy(expertBookings.status);

  const STATUS_LABEL: Record<string, string> = {
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No-show",
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold font-serif text-[var(--color-navy)]">
          Platform Overview
        </h1>
        <p className="mt-1 text-sm text-gray-400">Live KPIs — all time unless noted</p>
      </header>

      {/* ── Top KPIs ── */}
      <section>
        <SectionHeading title="Platform KPIs" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          <StatCard label="Total users" value={totalUsers} accent />
          <StatCard label="Investor profiles" value={totalInvestors} />
          <StatCard label="Incentive calc runs" value={totalCalcRuns} />
          <StatCard label="Expert bookings" value={totalBookings} />
          <StatCard label="Pending intros" value={pendingIntros} sub="awaiting admin action" />
          <StatCard label="AI questions" value={totalAiMessages} sub="user messages total" />
        </div>
      </section>

      {/* ── Last 30 days ── */}
      <section>
        <SectionHeading title="Last 30 days" />
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="New signups" value={recentSignups} sub="last 30 days" />
          <StatCard label="New bookings" value={recentBookings} sub="last 30 days" />
        </div>
      </section>

      {/* ── Sector breakdown ── */}
      <section>
        <SectionHeading title="Investors by sector" />
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Sector
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Profiles
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {sectorRows.map((r) => (
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

      {/* ── Booking status ── */}
      <section>
        <SectionHeading title="Bookings by status" />
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {bookingStatusRows.map((r) => (
                <tr key={r.status}>
                  <td className="px-5 py-3 font-medium text-[var(--color-navy)]">
                    {STATUS_LABEL[r.status] ?? r.status}
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
