"use server";

import { type FormState, zodFieldErrors } from "@/lib/action-state";
import { withRole } from "@/lib/with-role";
import { ExpertProfileCreateSchema } from "@istiqtab/core";
import { db, expertProfiles, withUserContext } from "@istiqtab/db";

/** Create or update the signed-in expert's public profile. */
export const upsertExpertProfile = withRole(
  ["expert", "admin"],
  async (session, _prev: FormState, formData: FormData): Promise<FormState> => {
    const parsed = ExpertProfileCreateSchema.safeParse({
      name: formData.get("name"),
      title: formData.get("title"),
      specializations: formData.getAll("specializations"),
      languages: formData.getAll("languages"),
      hourlyRateMAD: formData.get("hourlyRateMAD")
        ? Number(formData.get("hourlyRateMAD"))
        : undefined,
      hourlyRateEUR: formData.get("hourlyRateEUR")
        ? Number(formData.get("hourlyRateEUR"))
        : undefined,
      bio: formData.get("bio"),
      bioFr: (formData.get("bioFr") as string) || undefined,
      bioAr: (formData.get("bioAr") as string) || undefined,
      linkedinUrl: (formData.get("linkedinUrl") as string) || undefined,
    });

    if (!parsed.success) {
      return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
    }

    const userId = session.user.id;
    const data = parsed.data;
    const values = {
      name: data.name,
      title: data.title,
      specializations: data.specializations,
      languages: data.languages,
      hourlyRateMAD: data.hourlyRateMAD,
      hourlyRateEUR: data.hourlyRateEUR ?? null,
      bio: data.bio,
      bioFr: data.bioFr ?? null,
      bioAr: data.bioAr ?? null,
      linkedinUrl: data.linkedinUrl ?? null,
    };

    await withUserContext(db, userId, session.user.role, async (tx) => {
      await tx
        .insert(expertProfiles)
        .values({ userId, ...values })
        .onConflictDoUpdate({ target: expertProfiles.userId, set: values });
    });

    return { ok: true };
  },
);
