import { Resend } from "resend";

// Server-only: RESEND_API_KEY must never reach the browser.
if (typeof (globalThis as { window?: unknown }).window !== "undefined") {
  throw new Error("@istiqtab/notifications must only be used on the server");
}

const FROM = "Istiqtab <noreply@istiqtab.ma>";

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  return new Resend(key);
}

// ── Template helpers ──────────────────────────────────────────────────────────

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Istiqtab</title>
<style>
  body{margin:0;padding:0;background:#f4f5f7;font-family:Inter,Arial,sans-serif;color:#1a2744}
  .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
  .header{background:#1a2744;padding:24px 32px;text-align:center}
  .header h1{margin:0;color:#c9a84c;font-size:22px;letter-spacing:.5px}
  .body{padding:32px}
  .body p{margin:0 0 16px;line-height:1.6;font-size:15px;color:#333}
  .btn{display:inline-block;margin:8px 0 16px;padding:12px 24px;background:#1a2744;color:#c9a84c;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600}
  .footer{padding:16px 32px;background:#f4f5f7;text-align:center;font-size:12px;color:#888}
</style>
</head>
<body>
<div class="wrap">
  <div class="header"><h1>Istiqtab — استقطاب</h1></div>
  <div class="body">${body}</div>
  <div class="footer">Istiqtab · istiqtab.ma · This is an automated message.</div>
</div>
</body>
</html>`;
}

// ── Booking confirmation ──────────────────────────────────────────────────────

export type BookingConfirmationPayload = {
  /** Recipient email */
  to: string;
  /** Recipient role (determines copy) */
  recipientRole: "investor" | "expert";
  expertName: string;
  /** UTC ISO string */
  startTime: string;
  durationMinutes: number;
  meetingUrl: string;
};

export async function sendBookingConfirmation(
  payload: BookingConfirmationPayload,
): Promise<void> {
  const { to, recipientRole, expertName, startTime, durationMinutes, meetingUrl } = payload;
  const when = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(startTime));

  const subject =
    recipientRole === "investor"
      ? `Session confirmed — ${expertName} · ${when} UTC`
      : `New session booked — ${when} UTC`;

  const body =
    recipientRole === "investor"
      ? `<p>Your expert consultation is confirmed.</p>
         <p><strong>Expert:</strong> ${expertName}<br>
         <strong>Time:</strong> ${when} UTC (${durationMinutes} min)</p>
         <p><a class="btn" href="${meetingUrl}">Join meeting</a></p>
         <p style="font-size:13px;color:#888">No payment is taken on Istiqtab — the expert invoices you directly after the session.</p>`
      : `<p>An investor has booked a session with you.</p>
         <p><strong>Time:</strong> ${when} UTC (${durationMinutes} min)</p>
         <p><a class="btn" href="${meetingUrl}">Join meeting</a></p>
         <p style="font-size:13px;color:#888">Log in to Istiqtab to view session details and manage your availability.</p>`;

  await getResend().emails.send({ from: FROM, to, subject, html: layout(body) });
}

// ── Introduction status update ────────────────────────────────────────────────

export type IntroUpdatePayload = {
  to: string;
  recipientRole: "investor" | "partner";
  partnerName: string;
  status: "accepted" | "declined" | "completed";
  /** Absolute URL to the introductions page */
  introUrl: string;
};

export async function sendIntroUpdate(payload: IntroUpdatePayload): Promise<void> {
  const { to, recipientRole, partnerName, status, introUrl } = payload;

  const statusLabel: Record<typeof status, string> = {
    accepted: "Accepted",
    declined: "Declined",
    completed: "Completed",
  };

  const subject =
    recipientRole === "investor"
      ? `Introduction update: ${partnerName} — ${statusLabel[status]}`
      : `New investor introduction — Istiqtab`;

  const body =
    recipientRole === "investor"
      ? `<p>Your introduction request to <strong>${partnerName}</strong> has been updated.</p>
         <p><strong>New status:</strong> ${statusLabel[status]}</p>
         <p><a class="btn" href="${introUrl}">View my introductions</a></p>
         <p style="font-size:13px;color:#888">All introductions are reviewed by the Istiqtab team before contact is brokered.</p>`
      : `<p>Istiqtab has brokered an introduction between you and a new investor.</p>
         <p>Our team will be in touch shortly with next steps.</p>
         <p><a class="btn" href="${introUrl}">View on Istiqtab</a></p>`;

  await getResend().emails.send({ from: FROM, to, subject, html: layout(body) });
}

// ── Wizard step reminder ──────────────────────────────────────────────────────

export type WizardReminderPayload = {
  to: string;
  investorName: string;
  pendingStepTitle: string;
  wizardUrl: string;
};

export async function sendWizardReminder(payload: WizardReminderPayload): Promise<void> {
  const { to, investorName, pendingStepTitle, wizardUrl } = payload;

  const subject = `Your Morocco setup has a pending step — ${pendingStepTitle}`;

  const body = `<p>Hi ${investorName},</p>
    <p>Your Morocco investment setup wizard has a pending step:</p>
    <p><strong>${pendingStepTitle}</strong></p>
    <p><a class="btn" href="${wizardUrl}">Continue your setup</a></p>
    <p style="font-size:13px;color:#888">Typical company setup in Morocco takes 6–10 weeks. Completing each step on time keeps your project on track.</p>`;

  await getResend().emails.send({ from: FROM, to, subject, html: layout(body) });
}
