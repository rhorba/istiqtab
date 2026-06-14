"use server";

import { type FormState, zodFieldErrors } from "@/lib/action-state";
import { withRole } from "@/lib/with-role";
import { PartnerProfileCreateSchema } from "@istiqtab/core";
import { db, partnerProfiles, withUserContext } from "@istiqtab/db";

/** Create or update the signed-in partner's public profile. */
export const upsertPartnerProfile = withRole(
  ["partner", "admin"],
  async (session, _prev: FormState, formData: FormData): Promise<FormState> => {
    // Accept either multiple inputs or one comma/newline-separated field.
    const clients = formData
      .getAll("internationalClients")
      .flatMap((c) => String(c).split(/[,\n]/))
      .map((c) => c.trim())
      .filter(Boolean);

    const parsed = PartnerProfileCreateSchema.safeParse({
      companyName: formData.get("companyName"),
      ice: (formData.get("ice") as string) || undefined,
      partnerType: formData.get("partnerType"),
      sectors: formData.getAll("sectors"),
      regions: formData.getAll("regions"),
      languages: formData.getAll("languages"),
      description: formData.get("description"),
      internationalClients: clients.length ? clients : undefined,
      websiteUrl: (formData.get("websiteUrl") as string) || undefined,
    });

    if (!parsed.success) {
      return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
    }

    const userId = session.user.id;
    const data = parsed.data;
    const values = {
      companyName: data.companyName,
      ice: data.ice ?? null,
      partnerType: data.partnerType,
      sectors: data.sectors,
      regions: data.regions,
      languages: data.languages,
      description: data.description,
      internationalClients: data.internationalClients ?? null,
      websiteUrl: data.websiteUrl ?? null,
    };

    await withUserContext(db, userId, session.user.role, async (tx) => {
      await tx
        .insert(partnerProfiles)
        .values({ userId, ...values })
        .onConflictDoUpdate({ target: partnerProfiles.userId, set: values });
    });

    return { ok: true };
  },
);
