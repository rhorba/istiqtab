import Anthropic from "@anthropic-ai/sdk";
import { ensureDisclaimer } from "./guardrails.js";
import { type AdvisorContext, buildSystemPrompt } from "./system-prompt.js";

// ─────────────────────────────────────────────────────────────────────────────
// Claude API adapter — the ONLY impure module in @istiqtab/ai.
//
// Server-only: ANTHROPIC_API_KEY must never reach the browser (CLAUDE.md §5,
// .claude #6). We read it from the environment at call time (not import) so the
// package never forces the key to exist at build time, and we hard-fail if the
// module is ever evaluated in a browser.
//
// The model defaults to the current Sonnet (`claude-sonnet-4-6`; the Charter
// named the now-deprecated `claude-sonnet-4-20250514`) and is overridable via
// ANTHROPIC_MODEL so admins can change it without a code deploy. Thinking is
// disabled and effort low — this is a cost-tracked Q&A advisor, not an agent.
// ─────────────────────────────────────────────────────────────────────────────

if (typeof (globalThis as { window?: unknown }).window !== "undefined") {
  throw new Error("@istiqtab/ai client must only be used on the server");
}

const DEFAULT_MODEL = "claude-sonnet-4-6";

export type AdvisorTurn = { role: "user" | "assistant"; content: string };

export type AdvisorResult = {
  /** Final answer, with the mandatory disclaimer guaranteed present. */
  text: string;
  /** Total tokens (input + output) — logged per message for cost monitoring. */
  tokensUsed: number;
};

/**
 * Ask the AI advisor a question. `history` is the prior conversation (oldest
 * first); the last entry must be the new user message. The investor context is
 * injected into the system prompt so the answer is profile-aware.
 */
export async function askAdvisor(
  history: AdvisorTurn[],
  context: AdvisorContext = {},
): Promise<AdvisorResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    // Thinking disabled — this is a cost-tracked Q&A advisor, not an agent;
    // it keeps latency and per-message token spend low.
    thinking: { type: "disabled" },
    system: buildSystemPrompt(context),
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const tokensUsed = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

  return { text: ensureDisclaimer(text), tokensUsed };
}
