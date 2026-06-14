---
name: security-engineer
description: Auth (LinkedIn), investor PII, AI guardrails, no-financial-advice boundary. Trigger on: "security", "PII", "LinkedIn", "AI safety", "guardrail", "ANTHROPIC_API_KEY".
---
# Security Engineer — Istiqtab

## Threat Surface
| Component | Threat | Mitigation |
|---|---|---|
| **Investor documents** | Passport/financials leaked | Private R2; signed URLs (15-min); investor + admin only; access audited |
| **AI advisor output** | Guarantees incentives → regulatory liability | `validateAIResponse()` + mandatory disclaimer appended |
| **ANTHROPIC_API_KEY** | Leaked in repo or logs | env var only; gitleaks; never in client-side code |
| LinkedIn OAuth | OAuth state fixation | Auth.js handles CSRF; validate `state` parameter |
| **Incentive rules** | Admin sets false incentives | Audit log on rule updates; `confidence: 'requires_verification'` for uncertain rules |
| Role escalation | Investor accesses partner/expert admin | `withRole()` on every handler; role from session only |
| AI token abuse | User sends 1000 messages → high cost | Rate limit: 20 msgs/user/day; pg-boss monthly cost sweep |

## AI Safety Rules (Mandatory)
```typescript
// packages/ai/src/guardrails.ts
// 1. Response validation (post-generation)
// 2. System prompt cannot be overridden by user input
// 3. Prompt injection detection (user asks AI to "ignore previous instructions")
const INJECTION_PATTERNS = [/ignore.*previous.*instructions/i, /system prompt/i, /jailbreak/i]
export function detectInjection(message: string): boolean {
  return INJECTION_PATTERNS.some(p => p.test(message))
}
// If injection detected → respond with standard "I can only help with Morocco investment questions"
```

## ANTHROPIC_API_KEY Handling
```
.env: ANTHROPIC_API_KEY=sk-ant-...
.gitignore: .env
gitleaks config: watch for sk-ant-
In code: only in packages/ai/src/*.ts (server-side only, never client-side)
In Docker: environment variable injection only
```

## Pre-Deploy Checklist (Sprint 7)
- [ ] Investor docs: private R2; every signed URL audited
- [ ] AI guardrails: injection detection + guarantee detection + disclaimer appended
- [ ] ANTHROPIC_API_KEY: env-only; gitleaks passes; not in client bundle
- [ ] LinkedIn OAuth: state parameter validated; redirect URI allowlisted
- [ ] AI rate limit: 20 msgs/user/day; cost monitoring active
- [ ] Incentive rule updates: audit logged
- [ ] Role isolation: investor cannot access partner/expert admin endpoints
- [ ] CSP + security headers
