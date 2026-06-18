"use server";

import type { FormState } from "@/lib/action-state";
import { withRole } from "@/lib/with-role";
import {
  db,
  expertBookings,
  expertProfiles,
  expertSlots,
  investorProfiles,
  notifications,
  users,
  withUserContext,
} from "@istiqtab/db";
import { sendBookingConfirmation } from "@istiqtab/notifications";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const BookSlotSchema = z.object({ slotId: z.string().uuid() });

/**
 * Investor books an open expert slot.
 *
 * Double-booking is prevented atomically: we flip the slot to booked with a
 * conditional UPDATE (`WHERE booked = false`) and only proceed if exactly one
 * row was claimed. A losing concurrent request claims zero rows and is told the
 * slot is no longer available. No payment in v0.1 — a meeting link is issued and
 * the booking is confirmed immediately (Resend email deferred to Sprint 6; an
 * in-app confirmation notification is created now).
 */
export const bookSlot = withRole(
  ["investor", "consultant", "admin"],
  async (session, _prev: FormState, formData: FormData): Promise<FormState> => {
    const parsed = BookSlotSchema.safeParse({ slotId: formData.get("slotId") });
    if (!parsed.success) {
      return { ok: false, error: "Invalid slot." };
    }
    const { slotId } = parsed.data;

    // Requester must have an investor profile (the FK owner of the booking).
    const [profile] = await db
      .select({ id: investorProfiles.id })
      .from(investorProfiles)
      .where(eq(investorProfiles.userId, session.user.id))
      .limit(1);
    if (!profile) {
      return { ok: false, error: "Complete your investor profile before booking a session." };
    }

    // Slot must exist and start in the future.
    const [slot] = await db
      .select({
        id: expertSlots.id,
        expertId: expertSlots.expertId,
        startTime: expertSlots.startTime,
        endTime: expertSlots.endTime,
        booked: expertSlots.booked,
      })
      .from(expertSlots)
      .where(eq(expertSlots.id, slotId))
      .limit(1);
    if (!slot) {
      return { ok: false, error: "This slot no longer exists." };
    }
    if (slot.booked) {
      return { ok: false, error: "This slot has just been booked. Please pick another." };
    }
    if (slot.startTime.getTime() <= Date.now()) {
      return { ok: false, error: "This slot is in the past." };
    }

    const [expert] = await db
      .select({ id: expertProfiles.id, name: expertProfiles.name, userId: expertProfiles.userId })
      .from(expertProfiles)
      .where(eq(expertProfiles.id, slot.expertId))
      .limit(1);
    if (!expert) {
      return { ok: false, error: "This expert is no longer available." };
    }

    // Fetch the expert's email for the confirmation email.
    const [expertUser] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, expert.userId))
      .limit(1);

    // Atomic claim + booking insert under the investor's RLS context.
    let bookedOk = false;
    await withUserContext(db, session.user.id, session.user.role, async (tx) => {
      const claimed = await tx
        .update(expertSlots)
        .set({ booked: true, bookedByUserId: session.user.id })
        .where(and(eq(expertSlots.id, slotId), eq(expertSlots.booked, false)))
        .returning({ id: expertSlots.id });

      if (claimed.length === 0) return; // lost the race — another investor won

      const meetingUrl = `https://meet.jit.si/istiqtab-${slotId}`;
      await tx.insert(expertBookings).values({
        slotId,
        investorId: profile.id,
        expertId: expert.id,
        status: "confirmed",
        meetingUrl,
      });
      bookedOk = true;
    });

    if (!bookedOk) {
      return { ok: false, error: "This slot has just been booked. Please pick another." };
    }

    // In-app confirmation for the investor + alert for the expert.
    const when = new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(slot.startTime);
    await db.insert(notifications).values([
      {
        userId: session.user.id,
        type: "booking_confirmation" as const,
        title: "Session confirmed",
        body: `Your session with ${expert.name} is confirmed for ${when} UTC.`,
        linkUrl: "/investor/bookings",
      },
      {
        userId: expert.userId,
        type: "booking_confirmation" as const,
        title: "New session booked",
        body: `An investor booked a session with you for ${when} UTC.`,
        linkUrl: "/expert/sessions",
      },
    ]);

    // Resend confirmation emails (fire-and-forget — email failure never rolls back the booking).
    const investorEmail = session.user.email;
    const expertEmail = expertUser?.email;
    const slotStart = slot.startTime.toISOString();
    const slotDuration = Math.round(
      (slot.endTime.getTime() - slot.startTime.getTime()) / 60_000,
    ) as 30 | 60;
    const meetingLink = `https://meet.jit.si/istiqtab-${slotId}`;
    if (investorEmail) {
      sendBookingConfirmation({
        to: investorEmail,
        recipientRole: "investor",
        expertName: expert.name,
        startTime: slotStart,
        durationMinutes: slotDuration,
        meetingUrl: meetingLink,
      }).catch(() => {});
    }
    if (expertEmail) {
      sendBookingConfirmation({
        to: expertEmail,
        recipientRole: "expert",
        expertName: expert.name,
        startTime: slotStart,
        durationMinutes: slotDuration,
        meetingUrl: meetingLink,
      }).catch(() => {});
    }

    revalidatePath(`/investor/experts/${expert.id}`);
    revalidatePath("/investor/bookings");
    return { ok: true };
  },
);
