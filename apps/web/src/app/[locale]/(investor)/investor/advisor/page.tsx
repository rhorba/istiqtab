import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { AdvisorChat } from "@/components/advisor/advisor-chat";
import { aiChatMessages, db } from "@istiqtab/db";
import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Ask Istiqtab" };

type Props = { params: Promise<{ locale: string }> };

export default async function AdvisorPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/advisor`);
  }
  const role = session.user.role;
  if (role !== "investor" && role !== "consultant" && role !== "admin") {
    redirect(`/${locale}`);
  }

  const t = await getTranslations({ locale, namespace: "Advisor" });

  // Resume the most recent conversation; start a fresh session if none.
  const rows = await db
    .select({
      role: aiChatMessages.role,
      content: aiChatMessages.content,
      sessionId: aiChatMessages.sessionId,
    })
    .from(aiChatMessages)
    .where(eq(aiChatMessages.userId, session.user.id))
    .orderBy(asc(aiChatMessages.createdAt));

  const last = rows.at(-1);
  const sessionId = last?.sessionId ?? randomUUID();
  const initialMessages = last
    ? rows
        .filter((r) => r.sessionId === sessionId)
        .map((r) => ({ role: r.role, content: r.content }))
    : [];

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold font-serif text-[var(--color-navy)]">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-gray-500">{t("subtitle")}</p>
        </header>

        <AdvisorChat
          sessionId={sessionId}
          initialMessages={initialMessages}
          labels={{
            placeholder: t("placeholder"),
            send: t("send"),
            sending: t("sending"),
            empty: t("empty"),
            you: t("you"),
            advisor: t("advisor"),
            disclaimer: t("disclaimer"),
          }}
        />
      </div>
    </main>
  );
}
