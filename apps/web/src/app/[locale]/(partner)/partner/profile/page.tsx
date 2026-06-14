import { auth } from "@/auth";
import { PartnerProfileForm } from "@/components/partner/partner-profile-form";
import type { Locale } from "@istiqtab/core";
import { db, partnerProfiles } from "@istiqtab/db";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Partner profile" };

type Props = { params: Promise<{ locale: string }> };

export default async function PartnerProfilePage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/partner/profile`);
  }
  if (session.user.role !== "partner" && session.user.role !== "admin") {
    redirect(`/${locale}`);
  }

  const existing = await db.query.partnerProfiles.findFirst({
    where: eq(partnerProfiles.userId, session.user.id),
  });

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold font-serif text-[var(--color-navy)]">
            Your partner profile
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            This appears in the partner directory once verified by our team.
          </p>
        </header>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8 shadow-sm">
          <PartnerProfileForm
            locale={locale as Locale}
            defaults={
              existing
                ? {
                    companyName: existing.companyName,
                    ice: existing.ice ?? undefined,
                    partnerType: existing.partnerType,
                    sectors: existing.sectors,
                    regions: existing.regions,
                    languages: existing.languages,
                    description: existing.description,
                    internationalClients: existing.internationalClients ?? undefined,
                    websiteUrl: existing.websiteUrl ?? undefined,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </main>
  );
}
