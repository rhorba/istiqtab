"use server";

import { type FormState, zodFieldErrors } from "@/lib/action-state";
import { withRole } from "@/lib/with-role";
import { IntroductionRequestSchema } from "@istiqtab/core";
import {
  db,
  introductionRequests,
  investorProfiles,
  notifications,
  partnerProfiles,
  users,
  withUserContext,
} from "@istiqtab/db";
import { canRequestIntroduction } from "@istiqtab/partners";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Investor requests an admin-mediated introduction to a partner.
 * Flow: create request (pending) → notify admins. Partner is notified only
 * once an admin accepts (see admin updateIntroductionStatus). Direct contact
 * details are never exposed to the investor.
 */
export const requestIntroduction = withRole(
  ["investor", "consultant", "admin"],
  async (session, _prev: FormState, formData: FormData): Promise<FormState> => {
    const parsed = IntroductionRequestSchema.safeParse({
      partnerId: formData.get("partnerId"),
      message: formData.get("message"),
    });
    if (!parsed.success) {
      return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
    }

    const { partnerId, message } = parsed.data;

    // Requester must have an investor profile (the FK owner of the request).
    const [profile] = await db
      .select({ id: investorProfiles.id })
      .from(investorProfiles)
      .where(eq(investorProfiles.userId, session.user.id))
      .limit(1);
    if (!profile) {
      return {
        ok: false,
        error: "Complete your investor profile before requesting an introduction.",
      };
    }

    // Partner must exist and be verified (cannot intro to an unlisted partner).
    const [partner] = await db
      .select({
        id: partnerProfiles.id,
        verified: partnerProfiles.verified,
        name: partnerProfiles.companyName,
      })
      .from(partnerProfiles)
      .where(eq(partnerProfiles.id, partnerId))
      .limit(1);
    if (!partner || !partner.verified) {
      return { ok: false, error: "This partner is not available for introductions." };
    }

    // No duplicate request while a prior one is still active.
    const existing = await db
      .select({ partnerId: introductionRequests.partnerId, status: introductionRequests.status })
      .from(introductionRequests)
      .where(eq(introductionRequests.investorId, profile.id));
    const eligibility = canRequestIntroduction(existing, partnerId);
    if (!eligibility.ok) {
      return {
        ok: false,
        error: "You already have an open introduction request with this partner.",
      };
    }

    // Create the request under the investor's RLS context.
    await withUserContext(db, session.user.id, session.user.role, async (tx) => {
      await tx.insert(introductionRequests).values({
        investorId: profile.id,
        partnerId,
        message,
        status: "pending",
      });
    });

    // Notify all admins (system notification → not subject to investor RLS).
    const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
    if (admins.length > 0) {
      await db.insert(notifications).values(
        admins.map((a) => ({
          userId: a.id,
          type: "intro_request_update" as const,
          title: "New introduction request",
          body: `An investor requested an introduction to ${partner.name}.`,
          linkUrl: "/admin/introductions",
        })),
      );
    }

    revalidatePath("/investor/partners");
    revalidatePath("/investor/introductions");
    return { ok: true };
  },
);
