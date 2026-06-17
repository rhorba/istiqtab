// ─────────────────────────────────────────────────────────────────────────────
// AI advisor guardrails — PURE functions (no I/O) so they are fully unit
// testable. Three layers, all non-negotiable (CLAUDE.md §11, .claude #1/#5):
//   1. INPUT  — prompt-injection detection (block before any API call).
//   2. OUTPUT — a mandatory legal disclaimer on every assistant answer.
//   3. OUTPUT — detect absolute-guarantee phrasing ("you WILL receive X"),
//               which the no-financial-advice boundary forbids.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The disclaimer appended to every AI advisor answer. Istiqtab is an
 * information tool, never financial/legal/tax advice (CLAUDE.md §11).
 */
export const ADVISOR_DISCLAIMER =
  "This is general information based on publicly available Investment Charter 2022 data — not financial, legal, or tax advice. Verify any incentive eligibility with your CRI or a qualified advisor before acting.";

/** Shown to the user instead of an answer when the input is blocked. */
export const INJECTION_REFUSAL =
  "I can only help with questions about investing and setting up a company in Morocco. Please rephrase your question about your project.";

// Prompt-injection / jailbreak patterns. Case-insensitive. Kept deliberately
// narrow — instruction-override and system-prompt-extraction attempts — so
// legitimate questions ("act as my guide to…") are not falsely blocked.
const INJECTION_PATTERNS: { re: RegExp; reason: string }[] = [
  {
    re: /ignore\s+(all\s+|the\s+|your\s+)?(previous|prior|above)\s+(instructions|prompts?)/i,
    reason: "instruction override",
  },
  {
    re: /disregard\s+(all\s+|the\s+|your\s+|previous\s+|above\s+)*(instructions|rules|prompt)/i,
    reason: "instruction override",
  },
  { re: /forget\s+(everything|all|your|previous|the above)/i, reason: "instruction override" },
  {
    re: /(reveal|show|print|repeat|expose|leak)\s+(me\s+)?(your\s+|the\s+)?(system\s+)?(prompt|instructions)/i,
    reason: "system-prompt extraction",
  },
  {
    re: /what\s+(is|are)\s+your\s+(system\s+)?(prompt|instructions)/i,
    reason: "system-prompt extraction",
  },
  { re: /you\s+are\s+now\s+(a|an|the)\b/i, reason: "role reassignment" },
  { re: /\b(developer|debug|god)\s+mode\b/i, reason: "mode jailbreak" },
  { re: /\bjailbreak\b/i, reason: "jailbreak" },
  { re: /\bD\.?A\.?N\.?\b.*\b(mode|prompt)\b/i, reason: "jailbreak" },
  { re: /new\s+instructions?\s*[:：]/i, reason: "instruction injection" },
  {
    re: /override\s+(your\s+)?(system\s+|safety\s+)?(prompt|instructions|rules|guardrails)/i,
    reason: "instruction override",
  },
];

export type InjectionResult = { flagged: boolean; reason?: string };

/** Detect prompt-injection / jailbreak attempts in user input. */
export function detectInjection(input: string): InjectionResult {
  for (const { re, reason } of INJECTION_PATTERNS) {
    if (re.test(input)) return { flagged: true, reason };
  }
  return { flagged: false };
}

// Normalized marker so we never double-append the disclaimer.
const DISCLAIMER_MARKER = "not financial, legal, or tax advice";

/** True if the text already carries the disclaimer (or its marker). */
export function hasDisclaimer(text: string): boolean {
  return text.toLowerCase().includes(DISCLAIMER_MARKER.toLowerCase());
}

/** Append the mandatory disclaimer unless the answer already includes it. */
export function ensureDisclaimer(text: string): string {
  const trimmed = text.trimEnd();
  if (hasDisclaimer(trimmed)) return trimmed;
  return `${trimmed}\n\n— ${ADVISOR_DISCLAIMER}`;
}

// Absolute-guarantee phrasing the no-financial-advice boundary forbids: the
// advisor must say "you may be eligible, subject to CRI confirmation", never
// "you will receive X". Used to validate model output (Test Architect).
const GUARANTEE_PATTERNS: RegExp[] = [
  /you\s+will\s+(receive|get|be\s+granted|be\s+awarded|obtain)\b/i,
  /you\s+(are|will\s+be)\s+guaranteed\b/i,
  /\bguarantee(s|d)?\s+(you|that\s+you|your)\b/i,
  /\bdefinitely\s+(qualify|receive|get|be\s+eligible)\b/i,
  /\b(is|are)\s+guaranteed\s+to\s+(receive|get|qualify)\b/i,
];

/** True if model output makes a forbidden absolute eligibility guarantee. */
export function containsGuarantee(text: string): boolean {
  return GUARANTEE_PATTERNS.some((re) => re.test(text));
}
