"use server";

import { withRole } from "@/lib/with-role";
import {
  type AdvisorContext,
  type AdvisorTurn,
  INJECTION_REFUSAL,
  askAdvisor,
  detectInjection,
} from "@istiqtab/ai";
import { AIChatMessageSchema, ORIGIN_LABELS, label } from "@istiqtab/core";
import { aiChatMessages, db, investorProfiles, withUserContext } from "@istiqtab/db";
import { and, asc, eq } from "drizzle-orm";

export type AdvisorReply = { ok: true; reply: string } | { ok: false; error: string };

// Cap how much prior conversation we replay into the model (cost control); the
// full history is still persisted for the user. 2 messages per turn.
const HISTORY_TURNS = 12;

/**
 * Send a question to the AI advisor.
 *
 * Guardrails (CLAUDE.md §11, .claude #1/#5/#6):
 *  - INPUT: prompt-injection detection blocks the message before any API call.
 *  - CONTEXT: the investor's sector/region/bracket is injected into the system
 *    prompt (every call is profile-aware, never a generic chat).
 *  - The adapter enforces the mandatory disclaimer and the no-financial-advice
 *    boundary in the system prompt.
 *  - TOKENS: every stored message logs tokens_used for cost monitoring.
 */
export const sendAdvisorMessage = withRole(
  ["investor", "consultant", "admin"],
  async (session, sessionId: string, message: string): Promise<AdvisorReply> => {
    const parsed = AIChatMessageSchema.safeParse({ sessionId, message });
    if (!parsed.success) {
      return { ok: false, error: "Please enter a question (up to 2000 characters)." };
    }
    const userId = session.user.id;
    const text = parsed.data.message.trim();

    const [profile] = await db
      .select()
      .from(investorProfiles)
      .where(eq(investorProfiles.userId, userId))
      .limit(1);

    // ── Guardrail 1: block prompt-injection before spending a token ──
    const injection = detectInjection(text);
    if (injection.flagged) {
      await withUserContext(db, userId, session.user.role, async (tx) => {
        await tx.insert(aiChatMessages).values([
          { userId, investorId: profile?.id ?? null, sessionId, role: "user", content: text },
          {
            userId,
            investorId: profile?.id ?? null,
            sessionId,
            role: "assistant",
            content: INJECTION_REFUSAL,
            tokensUsed: 0,
          },
        ]);
      });
      return { ok: true, reply: INJECTION_REFUSAL };
    }

    // ── Prior turns for this session (oldest first), trimmed for cost ──
    const prior = await db
      .select({ role: aiChatMessages.role, content: aiChatMessages.content })
      .from(aiChatMessages)
      .where(and(eq(aiChatMessages.userId, userId), eq(aiChatMessages.sessionId, sessionId)))
      .orderBy(asc(aiChatMessages.createdAt));

    const history: AdvisorTurn[] = [
      ...prior.slice(-HISTORY_TURNS).map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: text },
    ];

    // ── Guardrail 2: context injection ──
    const context: AdvisorContext = profile
      ? {
          sector: profile.sector,
          investmentBracket: profile.investmentBracket,
          targetRegions: profile.targetRegions,
          jobsToCreate: profile.jobsToCreate ?? undefined,
          companyCountry: label(ORIGIN_LABELS, profile.companyCountry, "en"),
        }
      : {};

    let reply: string;
    let tokensUsed: number;
    try {
      const result = await askAdvisor(history, context);
      reply = result.text;
      tokensUsed = result.tokensUsed;
    } catch {
      return {
        ok: false,
        error: "The advisor is unavailable right now. Please try again in a moment.",
      };
    }

    // ── Persist both messages; log tokens on the assistant turn ──
    await withUserContext(db, userId, session.user.role, async (tx) => {
      await tx.insert(aiChatMessages).values([
        { userId, investorId: profile?.id ?? null, sessionId, role: "user", content: text },
        {
          userId,
          investorId: profile?.id ?? null,
          sessionId,
          role: "assistant",
          content: reply,
          tokensUsed,
        },
      ]);
    });

    return { ok: true, reply };
  },
);
