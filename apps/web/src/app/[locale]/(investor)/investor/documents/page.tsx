import { auth } from "@/auth";
import { DocumentVault } from "@/components/investor/document-vault";
import type { Locale } from "@istiqtab/core";
import { db, investorDocuments, withUserContext } from "@istiqtab/db";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Document vault" };

type Props = { params: Promise<{ locale: string }> };

export default async function DocumentsPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/investor/documents`);
  }
  if (!["investor", "consultant", "admin"].includes(session.user.role)) {
    redirect(`/${locale}`);
  }

  const docs = await withUserContext(db, session.user.id, session.user.role, async (tx) =>
    tx
      .select({
        id: investorDocuments.id,
        type: investorDocuments.type,
        uploadedAt: investorDocuments.uploadedAt,
      })
      .from(investorDocuments)
      .where(eq(investorDocuments.userId, session.user.id))
      .orderBy(desc(investorDocuments.uploadedAt)),
  );

  return (
    <main className="min-h-screen bg-[var(--color-surface-muted)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-gold-600)]">
            Private &amp; encrypted
          </p>
          <h1 className="mt-1 text-2xl font-semibold font-serif text-[var(--color-navy)]">
            Document vault
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Store your setup documents securely. Files are private to you, accessed via short-lived
            links, and every view is logged. Only you and our compliance team can access them.
          </p>
        </header>

        <DocumentVault
          locale={locale as Locale}
          documents={docs.map((d) => ({
            id: d.id,
            type: d.type,
            uploadedAt: d.uploadedAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}
