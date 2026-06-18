import { describe, expect, it, vi } from "vitest";

// Stub Resend before importing the module under test.
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null }),
    },
  })),
}));

// Set env var before the guarded import (window check runs at import time in
// the test environment where globalThis.window is undefined, so the guard passes).
process.env.RESEND_API_KEY = "re_test_key";

const { sendBookingConfirmation, sendIntroUpdate, sendWizardReminder } = await import(
  "../email.js"
);

describe("sendBookingConfirmation", () => {
  it("resolves without throwing for investor role", async () => {
    await expect(
      sendBookingConfirmation({
        to: "investor@test.com",
        recipientRole: "investor",
        expertName: "Amine Bennani",
        startTime: new Date("2026-09-01T10:00:00Z").toISOString(),
        durationMinutes: 60,
        meetingUrl: "https://meet.jit.si/test-slot",
      }),
    ).resolves.toBeUndefined();
  });

  it("resolves without throwing for expert role", async () => {
    await expect(
      sendBookingConfirmation({
        to: "expert@test.com",
        recipientRole: "expert",
        expertName: "Amine Bennani",
        startTime: new Date("2026-09-01T10:00:00Z").toISOString(),
        durationMinutes: 30,
        meetingUrl: "https://meet.jit.si/test-slot",
      }),
    ).resolves.toBeUndefined();
  });
});

describe("sendIntroUpdate", () => {
  it("resolves for investor — accepted", async () => {
    await expect(
      sendIntroUpdate({
        to: "investor@test.com",
        recipientRole: "investor",
        partnerName: "Bennani & Associés",
        status: "accepted",
        introUrl: "https://istiqtab.ma/en/investor/introductions",
      }),
    ).resolves.toBeUndefined();
  });

  it("resolves for partner — completed", async () => {
    await expect(
      sendIntroUpdate({
        to: "partner@test.com",
        recipientRole: "partner",
        partnerName: "Bennani & Associés",
        status: "completed",
        introUrl: "https://istiqtab.ma/en/partner/dashboard",
      }),
    ).resolves.toBeUndefined();
  });
});

describe("sendWizardReminder", () => {
  it("resolves without throwing", async () => {
    await expect(
      sendWizardReminder({
        to: "investor@test.com",
        investorName: "Hans Schmidt",
        pendingStepTitle: "Register with the Commercial Registry (RC)",
        wizardUrl: "https://istiqtab.ma/en/investor/wizard",
      }),
    ).resolves.toBeUndefined();
  });
});
