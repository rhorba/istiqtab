// ─────────────────────────────────────────────────────────────────────────────
// Introduction request lifecycle — PURE logic. The flow is admin-mediated:
//   investor requests  →  status: pending   (admins notified)
//   admin accepts      →  status: accepted  (partner + investor notified)
//   admin declines     →  status: declined  (investor notified)
//   admin completes    →  status: completed (terminal)
// Direct investor↔partner email is never exposed; the admin is the gate.
// ─────────────────────────────────────────────────────────────────────────────

export type IntroStatus = "pending" | "accepted" | "declined" | "completed";

export const INTRO_STATUSES: readonly IntroStatus[] = [
  "pending",
  "accepted",
  "declined",
  "completed",
] as const;

/** A request is "active" while it still occupies the investor↔partner slot. */
export const ACTIVE_INTRO_STATUSES: readonly IntroStatus[] = ["pending", "accepted"] as const;

/** Allowed admin status transitions. Declined/completed are terminal. */
const INTRO_TRANSITIONS: Record<IntroStatus, readonly IntroStatus[]> = {
  pending: ["accepted", "declined"],
  accepted: ["completed", "declined"],
  declined: [],
  completed: [],
};

/** Statuses an admin may move a request to from its current status. */
export function nextIntroStatuses(current: IntroStatus): readonly IntroStatus[] {
  return INTRO_TRANSITIONS[current] ?? [];
}

/** True if `from → to` is a permitted transition. */
export function isValidIntroTransition(from: IntroStatus, to: IntroStatus): boolean {
  return nextIntroStatuses(from).includes(to);
}

/** Minimal shape needed to check for a duplicate request. */
export type ExistingIntro = { partnerId: string; status: IntroStatus };

export type IntroEligibility = { ok: true } | { ok: false; reason: "duplicate_active" };

/**
 * An investor may not open a second request to a partner while a prior request
 * is still active (pending or accepted). Declined/completed requests may be
 * re-opened.
 */
export function canRequestIntroduction(
  existing: ExistingIntro[],
  partnerId: string,
): IntroEligibility {
  const hasActive = existing.some(
    (e) => e.partnerId === partnerId && ACTIVE_INTRO_STATUSES.includes(e.status),
  );
  return hasActive ? { ok: false, reason: "duplicate_active" } : { ok: true };
}
