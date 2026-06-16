import { describe, expect, it } from "vitest";
import {
  ACTIVE_INTRO_STATUSES,
  type ExistingIntro,
  type IntroStatus,
  canRequestIntroduction,
  isValidIntroTransition,
  nextIntroStatuses,
} from "../intro.js";

describe("nextIntroStatuses", () => {
  it("allows admin to accept or decline a pending request", () => {
    expect(nextIntroStatuses("pending")).toEqual(["accepted", "declined"]);
  });

  it("allows an accepted request to be completed or declined", () => {
    expect(nextIntroStatuses("accepted")).toEqual(["completed", "declined"]);
  });

  it("treats declined and completed as terminal", () => {
    expect(nextIntroStatuses("declined")).toEqual([]);
    expect(nextIntroStatuses("completed")).toEqual([]);
  });
});

describe("isValidIntroTransition", () => {
  it("accepts the documented happy path", () => {
    expect(isValidIntroTransition("pending", "accepted")).toBe(true);
    expect(isValidIntroTransition("accepted", "completed")).toBe(true);
  });

  it("rejects illegal jumps and terminal moves", () => {
    expect(isValidIntroTransition("pending", "completed")).toBe(false);
    expect(isValidIntroTransition("declined", "accepted")).toBe(false);
    expect(isValidIntroTransition("completed", "pending")).toBe(false);
  });

  it("rejects a no-op transition to the same status", () => {
    for (const s of ["pending", "accepted", "declined", "completed"] as IntroStatus[]) {
      expect(isValidIntroTransition(s, s)).toBe(false);
    }
  });
});

describe("canRequestIntroduction", () => {
  const existing: ExistingIntro[] = [
    { partnerId: "p1", status: "pending" },
    { partnerId: "p2", status: "accepted" },
    { partnerId: "p3", status: "declined" },
    { partnerId: "p4", status: "completed" },
  ];

  it("allows a request to a brand-new partner", () => {
    expect(canRequestIntroduction(existing, "new")).toEqual({ ok: true });
  });

  it("blocks a duplicate while a prior request is active", () => {
    expect(canRequestIntroduction(existing, "p1")).toEqual({
      ok: false,
      reason: "duplicate_active",
    });
    expect(canRequestIntroduction(existing, "p2")).toEqual({
      ok: false,
      reason: "duplicate_active",
    });
  });

  it("re-allows after a declined or completed request", () => {
    expect(canRequestIntroduction(existing, "p3")).toEqual({ ok: true });
    expect(canRequestIntroduction(existing, "p4")).toEqual({ ok: true });
  });

  it("keeps ACTIVE_INTRO_STATUSES limited to pending + accepted", () => {
    expect([...ACTIVE_INTRO_STATUSES]).toEqual(["pending", "accepted"]);
  });
});
