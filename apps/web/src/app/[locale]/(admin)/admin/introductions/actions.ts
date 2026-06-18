"use server";

import { withRole } from "@/lib/with-role";
import {
  db,
  introductionRequests,
  investorProfiles,
  notifications,
  partnerProfiles,
  users,
} from "@istiqtab/db";
import { sendIntroUpdate } from "@istiqtab/notifications";
import { type IntroStatus, isValidIntroTransition } from "@istiqtab/partners";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type Result = { ok: boolean; error?: string };

/**
 * Admin moves an introduction request along its lifecycle and notifies the
 * relevant parties. On accept/complete the partner is notified (the moment
 * contact is brokered); the investor is always notified of the outcome.
 */
export const updateIntroductionStatus = withRole(
  ["admin"],
  async (_session, requestId: string, nextStatus: IntroStatus): Promise<Result> => {
    const [row] = await db
      .select({
        id: introductionRequests.id,
        status: introductionRequests.status,
        investorUserId: investorProfiles.userId,
        partnerUserId: partnerProfiles.userId,
        partnerName: partnerProfiles.companyName,
      })
      .from(introductionRequests)
      .innerJoin(investorProfiles, eq(introductionRequests.investorId, investorProfiles.id))
      .innerJoin(partnerProfiles, eq(introductionRequests.partnerId, partnerProfiles.id))
      .where(eq(introductionRequests.id, requestId))
      .limit(1);

    if (!row) return { ok: false, error: "Request not found." };

    if (!isValidIntroTransition(row.status, nextStatus)) {
      return { ok: false, error: `Cannot move request from ${row.status} to ${nextStatus}.` };
    }

    await db
      .update(introductionRequests)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(introductionRequests.id, requestId));

    // Notify investor of every outcome.
    const news: (typeof notifications.$inferInsert)[] = [
      {
        userId: row.investorUserId,
        type: "intro_request_update" as const,
        title: "Introduction update",
        body: `Your introduction request to ${row.partnerName} is now "${nextStatus}".`,
        linkUrl: "/investor/introductions",
      },
    ];
    // Notify the partner once contact is actually brokered.
    if (nextStatus === "accepted" || nextStatus === "completed") {
      news.push({
        userId: row.partnerUserId,
        type: "intro_request_update" as const,
        title: "New investor introduction",
        body: "An investor has been introduced to you via Istiqtab. Our team will be in touch.",
        linkUrl: "/partner/dashboard",
      });
    }
    await db.insert(notifications).values(news);

    // Fetch emails for Resend — separate query to avoid complicating the join above.
    const [investorUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, row.investorUserId))
      .limit(1);
    const [partnerUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, row.partnerUserId))
      .limit(1);

    const validStatuses = ["accepted", "declined", "completed"] as const;
    type EmailStatus = (typeof validStatuses)[number];
    if (validStatuses.includes(nextStatus as EmailStatus)) {
      const emailStatus = nextStatus as EmailStatus;
      const baseUrl = process.env.NEXTAUTH_URL ?? "https://istiqtab.ma";
      if (investorUser?.email) {
        sendIntroUpdate({
          to: investorUser.email,
          recipientRole: "investor",
          partnerName: row.partnerName,
          status: emailStatus,
          introUrl: `${baseUrl}/en/investor/introductions`,
        }).catch(() => {});
      }
      if (partnerUser?.email && (nextStatus === "accepted" || nextStatus === "completed")) {
        sendIntroUpdate({
          to: partnerUser.email,
          recipientRole: "partner",
          partnerName: row.partnerName,
          status: emailStatus,
          introUrl: `${baseUrl}/en/partner/dashboard`,
        }).catch(() => {});
      }
    }

    revalidatePath("/admin/introductions");
    return { ok: true };
  },
);
