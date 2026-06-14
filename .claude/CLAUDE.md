# Istiqtab — Claude Code Team Framework

> Read `../CLAUDE.md` for full business rules, data model, and tech stack.
> This file governs HOW the AI team works.

---

## Autonomous Mode (default)

- **Design choices**: Always pick 🟡 **BALANCED**.
- **Specialist handoffs**: Proceed automatically.
- **Testing**: After ANY code task, auto-invoke Tester.

### Stop only for
1. Blocker (Claude API key missing, LinkedIn OAuth not configured, broken dep)
2. Scope gap not in `../CLAUDE.md`
3. DB schema breaking change
4. Security risk (investor PII, AI outputs, no-financial-advice boundary)
5. Sprint boundary

---

## Sprint System

| Sprint | Goal |
|---|---|
| **Sprint 0** | Scaffold + Auth (email + Google + LinkedIn OAuth) + RBAC + RLS |
| **Sprint 1** | Data model + profiles (investor/partner/expert) + demo seed |
| **Sprint 2** | Setup wizard (personalized checklist + progress tracker + document vault) |
| **Sprint 3** | Incentives calculator (rule engine + comparison + PDF export) |
| **Sprint 4** | Partner directory + introduction request flow |
| **Sprint 5** | Expert booking + AI advisor (Claude API) |
| **Sprint 6** | Intelligence Hub + notifications + email |
| **Sprint 7** | Admin dashboard + EN/FR/AR i18n + RTL + security + deploy → v0.1 |

---

## Auto-Handoff Protocol

| When | Auto-trigger |
|---|---|
| Backend/Frontend DONE | → Tester |
| Incentives rule engine | → Incentives Engine + Test Architect |
| AI advisor / Claude API | → AI Advisor specialist + Security |
| Wizard checklist logic | → Wizard specialist + Frontend Dev |
| Expert booking slots | → Backend Dev + Tester |
| Investor documents (PII) | → Security Engineer immediately |
| Sprint all-green | → Project Monitor: snapshot |

---

## Specialist Skills

| Specialist | Trigger |
|---|---|
| Orchestrator | Session start, routing |
| Project Manager | Scope, risks |
| Scrum Master | Sprint planning |
| Tech Lead | ADRs, stack |
| DBA | Schema, RLS (postgres:16-alpine, no pgvector) |
| Backend Dev | Server actions, API routes |
| Frontend Dev | All web pages, RTL, EN primary |
| AI Advisor | Claude API integration, context injection, token tracking, safety guardrails |
| Incentives Engine | Investment Charter rule model, computation, PDF export |
| Partner Engine | Partner matching, intro request flow |
| Tester | Vitest, Playwright |
| Test Architect | Adversarial, incentive edge cases, AI output validation |
| Security Engineer | Auth (LinkedIn), investor PII, AI guardrails |
| DevOps/DevSecOps | Docker (postgres:16-alpine), CI, CLAUDE_API_KEY secret |
| Deployment | Vercel + Docker verify |
| UX Designer | Wizard flows, calculator UI, EN-first design |
| UI Designer | Navy/gold palette, data tables, international B2B |
| Content Editor | EN/FR/AR, investment terminology, legal disclaimers |
| Project Monitor | Logs, KPIs, snapshots |

---

## Istiqtab-Specific Non-Negotiables

1. **Not financial advice, never** — every incentive output carries a legal disclaimer. The AI advisor must never say "you will receive X incentive" — always "you may be eligible, subject to CRI confirmation." This is a regulatory boundary.
2. **No Money type** — Istiqtab has no financial transactions in v0.1. Expert session rates are stored as plain integers (MAD/EUR), not as the Money branded type from the other platforms.
3. **English is primary language** — unlike all other platforms (FR/AR). next-intl default locale = `en`. UI copy, content, and error messages default to English.
4. **LinkedIn OAuth is required** — B2B investors strongly prefer LinkedIn login. Configure Auth.js LinkedIn provider alongside Google.
5. **AI advisor context injection** — every Claude API call includes the investor's sector + region + bracket in the system prompt. Never a context-free generic chat.
6. **Token usage is tracked** — every AI response logs token count to `ai_chat_messages.tokens_used`. Monthly cost monitoring for AI advisor is a requirement.
7. **Incentive rules are data, not code** — the Investment Charter rules are stored in a structured DB table (updated by admin without code deploy) NOT hardcoded in TypeScript.
8. **Investor documents private R2** — passport copies and financial statements are Category A PII. Private R2 bucket. Signed URLs. Access audit-logged.
9. **No platform revenue in v0.1** — no payment processing. Expert session fees are paid externally. Partner intros are free. Revenue model is deferred to v0.2.
10. **Intelligence Hub is SSR + SEO** — the sector guides and CRI profiles must be server-rendered and heavily optimized for search ("invest in Morocco automotive 2026").

---

## YAGNI Gate
```
"Does Istiqtab v0.1 need this for the DoD (../CLAUDE.md §12)?"
  YES → Build it   |   NO → v0.2 backlog only
```

## 3-Option Pattern (always pick 🟡 BALANCED)
```
🟢 SIMPLE | 🟡 BALANCED ← SELECTED | 🔴 COMPREHENSIVE
```
