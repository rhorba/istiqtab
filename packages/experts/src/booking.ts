// ─────────────────────────────────────────────────────────────────────────────
// Expert booking lifecycle — PURE functions (no DB, no I/O).
//
// Booking an open slot is RACE-SENSITIVE: two investors may try the same slot
// at once. The atomic guarantee lives in the server action as a conditional
// UPDATE (`SET booked = true WHERE id = ? AND booked = false RETURNING id`) —
// only one writer wins. This module decides *eligibility* (is the slot open and
// in the future?) and the *valid status transitions* of a booking.
// ─────────────────────────────────────────────────────────────────────────────

export type BookingStatus = "confirmed" | "completed" | "cancelled" | "no_show";

/** Minimal structural shape a slot needs for availability checks. */
export type BookableSlot = {
  id: string;
  startTime: Date;
  booked: boolean;
};

/**
 * A slot can be booked only if it is not already taken and starts in the
 * future. `now` is injected so the logic stays pure and testable.
 */
export function isSlotBookable(slot: BookableSlot, now: Date = new Date()): boolean {
  return !slot.booked && slot.startTime.getTime() > now.getTime();
}

/** Open, future slots sorted by start time ascending. Input is not mutated. */
export function availableSlots<S extends BookableSlot>(slots: S[], now: Date = new Date()): S[] {
  return [...slots]
    .filter((s) => isSlotBookable(s, now))
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

// ─── Booking status machine ──────────────────────────────────────────────────
// confirmed → completed | cancelled | no_show ; the latter three are terminal.

const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

/** Statuses in which a booking still occupies its slot. */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["confirmed"];

/** Terminal statuses — no further transition allowed. */
export function isTerminalBookingStatus(status: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[status].length === 0;
}

/** Valid next statuses from the current one (empty if terminal). */
export function nextBookingStatuses(current: BookingStatus): BookingStatus[] {
  return BOOKING_TRANSITIONS[current];
}

/** True if `next` is a legal transition from `current`. */
export function isValidBookingTransition(current: BookingStatus, next: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[current].includes(next);
}

/**
 * Cancelling a booking frees its slot again. Only an active (confirmed)
 * booking can be cancelled.
 */
export function canCancelBooking(status: BookingStatus): boolean {
  return isValidBookingTransition(status, "cancelled");
}
