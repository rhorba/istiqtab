import { describe, expect, it } from "vitest";
import {
  ACTIVE_BOOKING_STATUSES,
  type BookableSlot,
  type BookingStatus,
  availableSlots,
  canCancelBooking,
  isSlotBookable,
  isTerminalBookingStatus,
  isValidBookingTransition,
  nextBookingStatuses,
} from "../booking.js";

const NOW = new Date("2026-06-17T10:00:00Z");
const future = (h: number) => new Date(NOW.getTime() + h * 3_600_000);
const past = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

function slot(over: Partial<BookableSlot> = {}): BookableSlot {
  return { id: "s1", startTime: future(24), booked: false, ...over };
}

describe("isSlotBookable", () => {
  it("is bookable when open and in the future", () => {
    expect(isSlotBookable(slot(), NOW)).toBe(true);
  });

  it("is not bookable when already booked", () => {
    expect(isSlotBookable(slot({ booked: true }), NOW)).toBe(false);
  });

  it("is not bookable when in the past", () => {
    expect(isSlotBookable(slot({ startTime: past(1) }), NOW)).toBe(false);
  });
});

describe("availableSlots", () => {
  it("returns open future slots sorted ascending; pure", () => {
    const a = slot({ id: "a", startTime: future(48) });
    const b = slot({ id: "b", startTime: future(2) });
    const c = slot({ id: "c", startTime: future(10), booked: true });
    const d = slot({ id: "d", startTime: past(2) });
    const input = [a, b, c, d];
    const out = availableSlots(input, NOW);
    expect(out.map((s) => s.id)).toEqual(["b", "a"]);
    expect(input.map((s) => s.id)).toEqual(["a", "b", "c", "d"]); // not mutated
  });
});

describe("booking status machine", () => {
  it("allows confirmed → completed/cancelled/no_show", () => {
    for (const next of ["completed", "cancelled", "no_show"] as BookingStatus[]) {
      expect(isValidBookingTransition("confirmed", next)).toBe(true);
    }
  });

  it("rejects illegal and self transitions", () => {
    expect(isValidBookingTransition("confirmed", "confirmed")).toBe(false);
    expect(isValidBookingTransition("completed", "cancelled")).toBe(false);
    expect(isValidBookingTransition("cancelled", "completed")).toBe(false);
  });

  it("marks completed/cancelled/no_show as terminal", () => {
    expect(isTerminalBookingStatus("confirmed")).toBe(false);
    for (const s of ["completed", "cancelled", "no_show"] as BookingStatus[]) {
      expect(isTerminalBookingStatus(s)).toBe(true);
      expect(nextBookingStatuses(s)).toEqual([]);
    }
  });

  it("only confirmed bookings can be cancelled", () => {
    expect(canCancelBooking("confirmed")).toBe(true);
    expect(canCancelBooking("completed")).toBe(false);
  });

  it("counts only confirmed as active (slot-occupying)", () => {
    expect(ACTIVE_BOOKING_STATUSES).toEqual(["confirmed"]);
  });
});
