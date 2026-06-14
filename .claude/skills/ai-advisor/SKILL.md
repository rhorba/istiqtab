---
name: ai-advisor
description: Claude API integration, context injection, guardrails, token tracking. Trigger on: "AI", "Claude API", "chat", "advisor", "question", "tokens".
---
# AI Advisor — Istiqtab

## Role
Own `packages/ai`. The AI advisor is what makes Istiqtab sticky — a 24/7 expert
that knows the investor's profile and can answer Morocco investment questions instantly.
It MUST be safe (no financial advice), accurate (source citations), and cost-controlled
(token tracking).

## Claude API Integration

```typescript
// packages/ai/src/advisor.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function askAdvisor(
  question: string,
  investorContext: InvestorContext,
  chatHistory: AIChatMessage[]
): Promise<AdvisorResponse> {

  const systemPrompt = buildSystemPrompt(investorContext)
  const messages = buildMessages(chatHistory, question)

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  const content = response.content[0].type === 'text' ? response.content[0].text : ''
  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens

  return { content, tokensUsed, model: response.model }
}

function buildSystemPrompt(ctx: InvestorContext): string {
  return `You are an expert investment advisor for Morocco, assisting a foreign investor.

INVESTOR PROFILE:
- Sector: ${ctx.sector}
- Activity: ${ctx.activityType}
- Investment bracket: ${ctx.investmentBracket}
- Target regions: ${ctx.targetRegions.join(', ')}
- Origin country: ${ctx.companyCountry}

YOUR RULES:
1. Answer factually about Moroccan investment regulations, procedures, and incentives.
2. Cite your sources (Investment Charter 2022, CRI guides, AMDIE publications, HCP data).
3. ALWAYS include this disclaimer on investment-specific answers:
   "This is informational only. Please verify with your CRI or a qualified advisor for binding confirmation."
4. Never promise or guarantee specific incentive amounts.
5. When uncertain, say so and recommend expert consultation.
6. Respond in ${ctx.preferredLanguage === 'ar' ? 'Arabic' : ctx.preferredLanguage === 'fr' ? 'French' : 'English'}.
7. Keep responses concise (3–5 paragraphs max for complex questions).`
}
```

## Safety Guardrails

```typescript
// packages/ai/src/guardrails.ts
const BLOCKED_PATTERNS = [
  /guarantee.*incentive/i,
  /you will receive/i,
  /certif[yi].*compli/i,
  /legal advice/i,
]

export function validateAIResponse(response: string): boolean {
  // Flag if response contains guaranteed promises
  return !BLOCKED_PATTERNS.some(p => p.test(response))
}

// If validation fails → append standard disclaimer
export function ensureDisclaimer(response: string): string {
  const disclaimer = '\n\n*This is informational only and does not constitute legal or financial advice. Please consult your CRI or a qualified Moroccan legal advisor for binding guidance.*'
  if (!response.includes('informational only')) return response + disclaimer
  return response
}
```

## Token Cost Tracking
- Every response: `ai_chat_messages.tokens_used` stored
- pg-boss monthly sweep: aggregate tokens by user → flag heavy users
- Admin dashboard: "AI advisor: X tokens this month ≈ $Y cost"
- Rate limit: 20 messages per user per day (soft limit, notification at 15)

## Checklist
- [ ] Every API call injects investor profile context
- [ ] Every response validated against safety guardrails
- [ ] Disclaimer appended on investment-specific answers
- [ ] Token usage logged per message
- [ ] Chat history: last 50 messages stored per investor (not full history)
- [ ] Rate limit: 20 messages/user/day soft limit
- [ ] ANTHROPIC_API_KEY is an env var — never hardcoded, gitleaks watches

## Handoff Points
- **← DBA**: ai_chat_messages table
- **← Security Engineer**: ANTHROPIC_API_KEY handling
- **→ Frontend Dev**: chat UI contract (streaming optional in v0.1, polling is fine)
- **→ Tester**: guardrail tests, token tracking, context injection fixture tests
