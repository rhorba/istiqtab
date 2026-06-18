import { db, expertBookings, expertProfiles, investorProfiles, users } from "@istiqtab/db";
import { count, desc, eq, gte, sql } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Expert Bookings — Admin" };

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  no_show: "bg-red-50 text-red-600",
};

export default async function AdminBookingsPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Status breakdown
  const statusRows = await db
    .select({ status: expertBookings.status, c: count() })
    .from(expertBookings)
    .groupBy(expertBookings.status);

  // Per-expert performance
  const expertRows = await db
    .select({
      expertName: expertProfiles.name,
      expertTitle: expertProfiles.title,
      total: count(),
      avgRating: expertProfiles.avgRating,
      sessionCount: expertProfiles.sessionCount,
    })
    .from(expertBookings)
    .innerJoin(expertProfiles, eq(expertBookings.expertId, expertProfiles.id))
    .groupBy(
      expertProfiles.id,
      expertProfiles.name,
      expertProfiles.title,
      expertProfiles.avgRating,
      expertProfiles.sessionCount,
    )
    .orderBy(sql`count(*) desc`);

  // Recent bookings (last 20)
  const recentRows = await db
    .select({
      id: expertBookings.id,
      status: expertBookings.status,
      confirmedAt: expertBookings.confirmedAt,
      expertName: expertProfiles.name,
      investorCompany: investorProfiles.companyName,
      investorName: users.name,
    })
    .from(expertBookings)
    .innerJoin(expertProfiles, eq(expertBookings.expertId, expertProfiles.id))
    .innerJoin(investorProfiles, eq(expertBookings.investorId, investorProfiles.id))
    .innerJoin(users, eq(investorProfiles.userId, users.id))
    .orderBy(desc(expertBookings.confirmedAt))
    .limit(20);

  const last30dCount = await db
    .select({ c: count() })
    .from(expertBookings)
    .where(gte(expertBookings.confirmedAt, thirtyDaysAgo));

  const STATUS_LABEL: Record<string, string> = {
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No-show",
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold font-serif text-[var(--color-navy)]">Expert Bookings</h1>
        <p className="mt-1 text-sm text-gray-400">Booking performance across all experts</p>
      </header>

      {/* ── Status cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-[var(--color-gold)]/30 bg-[var(--color-navy)] p-6 text-white sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">
            Last 30 days
          </p>
          <p className="mt-2 text-4xl font-bold font-serif">{last30dCount[0]?.c ?? 0}</p>
          <p className="mt-1 text-xs text-white/60">new bookings</p>
        </div>
        {statusRows.map((r) => (
          <div
            key={r.status}
            className="rounded-2xl border border-[var(--color-border)] bg-white p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {STATUS_LABEL[r.status] ?? r.status}
            </p>
            <p className="mt-2 text-4xl font-bold font-serif text-[var(--color-navy)]">{r.c}</p>
          </div>
        ))}
      </div>

      {/* ── Per-expert table ── */}
      {expertRows.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Performance by expert
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Expert
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Bookings
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Sessions
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Avg Rating
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {expertRows.map((r) => (
                  <tr key={r.expertName}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-[var(--color-navy)]">{r.expertName}</p>
                      <p className="text-xs text-gray-400">{r.expertTitle}</p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-600">{r.total}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-600">
                      {r.sessionCount}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-600">
                      {r.avgRating > 0 ? r.avgRating.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Recent bookings ── */}
      {recentRows.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Recent bookings
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Investor
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Expert
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Date
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {recentRows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium text-[var(--color-navy)]">
                      {r.investorCompany ?? r.investorName ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{r.expertName}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {r.confirmedAt.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
