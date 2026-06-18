import { aiChatMessages, db } from "@istiqtab/db";
import { count, eq, sql, sum } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI Advisor Usage — Admin" };

export default async function AdminAiPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const aiResults = await Promise.all([
    db.select({ c: count() }).from(aiChatMessages).where(eq(aiChatMessages.role, "user")),
    db.select({ c: count() }).from(aiChatMessages).where(eq(aiChatMessages.role, "assistant")),
    db.select({ total: sum(aiChatMessages.tokensUsed) }).from(aiChatMessages),
    db
      .select({ c: count() })
      .from(aiChatMessages)
      .where(
        sql`${aiChatMessages.role} = 'user' AND ${aiChatMessages.createdAt} >= ${thirtyDaysAgo}`,
      ),
    db
      .select({ c: count() })
      .from(aiChatMessages)
      .where(
        sql`${aiChatMessages.role} = 'user' AND ${aiChatMessages.createdAt} >= ${sevenDaysAgo}`,
      ),
    db.select({ c: sql<number>`count(distinct ${aiChatMessages.sessionId})` }).from(aiChatMessages),
  ]);

  const totalUserMessages = aiResults[0][0]?.c ?? 0;
  const totalAssistantMessages = aiResults[1][0]?.c ?? 0;
  const rawTokenTotal = aiResults[2][0]?.total ?? null;
  const last30dMessages = aiResults[3][0]?.c ?? 0;
  const last7dMessages = aiResults[4][0]?.c ?? 0;
  const uniqueSessions = aiResults[5][0]?.c ?? 0;

  // Daily message volume — last 14 days
  const dailyVolume = await db
    .select({
      day: sql<string>`date_trunc('day', ${aiChatMessages.createdAt})::date::text`,
      c: count(),
    })
    .from(aiChatMessages)
    .where(
      sql`${aiChatMessages.role} = 'user' AND ${aiChatMessages.createdAt} >= ${new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)}`,
    )
    .groupBy(sql`date_trunc('day', ${aiChatMessages.createdAt})`)
    .orderBy(sql`date_trunc('day', ${aiChatMessages.createdAt})`);

  // Recent questions (non-identifiable — content only, most recent 20 user messages)
  const recentQuestions = await db
    .select({ content: aiChatMessages.content, createdAt: aiChatMessages.createdAt })
    .from(aiChatMessages)
    .where(eq(aiChatMessages.role, "user"))
    .orderBy(sql`${aiChatMessages.createdAt} desc`)
    .limit(20);

  const estCostUSD =
    rawTokenTotal !== null ? ((Number(rawTokenTotal) * 3.0) / 1_000_000).toFixed(4) : "0.0000";

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold font-serif text-[var(--color-navy)]">AI Advisor Usage</h1>
        <p className="mt-1 text-sm text-gray-400">
          Question analytics — content is non-identifiable (no user linkage displayed)
        </p>
      </header>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Total questions", value: totalUserMessages },
          { label: "AI responses", value: totalAssistantMessages },
          { label: "Unique sessions", value: uniqueSessions },
          { label: "Questions (30d)", value: last30dMessages },
          { label: "Questions (7d)", value: last7dMessages },
          {
            label: "Est. cost (USD)",
            value: `$${estCostUSD}`,
            sub: `${Number(rawTokenTotal ?? 0).toLocaleString()} tokens`,
          },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
            <p className="mt-2 text-3xl font-bold font-serif text-[var(--color-navy)]">{value}</p>
            {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Daily volume table ── */}
      {dailyVolume.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Daily questions — last 14 days
          </h2>
          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Date
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Questions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {(dailyVolume as Array<{ day: string; c: number }>).map((r) => (
                  <tr key={r.day}>
                    <td className="px-5 py-3 font-medium text-[var(--color-navy)]">{r.day}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-600">{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Recent questions ── */}
      {recentQuestions.length > 0 && (
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Recent investor questions
          </h2>
          <div className="space-y-2">
            {recentQuestions.map((q, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: stable display list
                key={i}
                className="rounded-xl border border-[var(--color-border)] bg-white px-5 py-3"
              >
                <p className="text-sm text-gray-700 line-clamp-2">{q.content}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {q.createdAt.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
