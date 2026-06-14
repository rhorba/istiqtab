import { auth } from "@/auth";
import { ExpertProfileForm } from "@/components/expert/expert-profile-form";
import type { Locale } from "@istiqtab/core";
import { db, expertProfiles } from "@istiqtab/db";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Expert profile" };

type Props = { params: Promise<{ locale: string }> };

export default async function ExpertProfilePage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in?callbackUrl=/${locale}/expert/profile`);
  }
  if (session.user.role !== "expert" && session.user.role !== "admin") {
    redirect(`/${locale}`);
  }

  const existing = await db.query.expertProfiles.findFirst({
    where: eq(expertProfiles.userId, session.user.id),
  });

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold font-serif text-[var(--color-navy)]">
            Your expert profile
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            This appears in the expert directory once verified by our team.
          </p>
        </header>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 sm:p-8 shadow-sm">
          <ExpertProfileForm
            locale={locale as Locale}
            defaults={
              existing
                ? {
                    name: existing.name,
                    title: existing.title,
                    specializations: existing.specializations,
                    languages: existing.languages,
                    hourlyRateMAD: existing.hourlyRateMAD,
                    hourlyRateEUR: existing.hourlyRateEUR ?? undefined,
                    bio: existing.bio,
                    bioFr: existing.bioFr ?? undefined,
                    bioAr: existing.bioAr ?? undefined,
                    linkedinUrl: existing.linkedinUrl ?? undefined,
                  }
                : undefined
            }
          />
        </div>
      </div>
    </main>
  );
}
