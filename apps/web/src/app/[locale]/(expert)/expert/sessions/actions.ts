"use server";

import type { FormState } from "@/lib/action-state";
import { withRole } from "@/lib/with-role";
import { db, expertProfiles, expertSlots, withUserContext } from "@istiqtab/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AddSlotSchema = z.object({
  // datetime-local value, interpreted as UTC.
  start: z.string().min(1),
  durationMinutes: z.coerce
    .number()
    .int()
    .refine((n) => n === 30 || n === 60, "Invalid duration"),
});

async function expertIdFor(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ id: expertProfiles.id })
    .from(expertProfiles)
    .where(eq(expertProfiles.userId, userId))
    .limit(1);
  return row?.id ?? null;
}

/** Expert adds an availability slot. Times are treated as UTC. */
export const addSlot = withRole(
  ["expert", "admin"],
  async (session, _prev: FormState, formData: FormData): Promise<FormState> => {
    const parsed = AddSlotSchema.safeParse({
      start: formData.get("start"),
      durationMinutes: formData.get("durationMinutes"),
    });
    if (!parsed.success) {
      return { ok: false, error: "Please provide a valid date, time and duration." };
    }

    const expertId = await expertIdFor(session.user.id);
    if (!expertId) {
      return { ok: false, error: "Create your expert profile before adding availability." };
    }

    // Parse the datetime-local string as UTC (no implicit server-tz shift).
    const startTime = new Date(`${parsed.data.start}:00Z`);
    if (Number.isNaN(startTime.getTime())) {
      return { ok: false, error: "Invalid date or time." };
    }
    if (startTime.getTime() <= Date.now()) {
      return { ok: false, error: "Slots must be in the future." };
    }
    const endTime = new Date(startTime.getTime() + parsed.data.durationMinutes * 60_000);

    await withUserContext(db, session.user.id, session.user.role, async (tx) => {
      await tx.insert(expertSlots).values({
        expertId,
        startTime,
        endTime,
        durationMinutes: parsed.data.durationMinutes as 30 | 60,
      });
    });

    revalidatePath("/expert/sessions");
    return { ok: true };
  },
);

/** Expert removes an unbooked slot they own. */
export async function removeSlot(slotId: string): Promise<{ ok: boolean; error?: string }> {
  const action = withRole(["expert", "admin"], async (session) => {
    const expertId = await expertIdFor(session.user.id);
    if (!expertId) return { ok: false, error: "No expert profile." };

    // Delete only if it belongs to this expert and is not already booked.
    const deleted = await withUserContext(
      db,
      session.user.id,
      session.user.role,
      async (tx) =>
        await tx
          .delete(expertSlots)
          .where(
            and(
              eq(expertSlots.id, slotId),
              eq(expertSlots.expertId, expertId),
              eq(expertSlots.booked, false),
            ),
          )
          .returning({ id: expertSlots.id }),
    );

    if (deleted.length === 0) {
      return { ok: false, error: "Slot is booked or no longer exists." };
    }
    revalidatePath("/expert/sessions");
    return { ok: true };
  });

  try {
    return await action();
  } catch {
    return { ok: false, error: "Not authorized." };
  }
}
