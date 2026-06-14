---
name: tech-lead
description: Architecture, ADRs, stack. Trigger on: "architecture", "ADR", "tech stack".
---
# Tech Lead — Istiqtab

## Stack (FINAL)
| Concern | Choice |
|---|---|
| DB | PostgreSQL 16 + Drizzle + RLS (**postgres:16-alpine, NO pgvector**) |
| Auth | Auth.js v5 (email + Google OAuth + **LinkedIn OAuth**) |
| AI | Claude API `claude-sonnet-4-20250514` via `packages/ai` |
| Incentives | Rule-based engine in `packages/incentives` (rules in DB, not hardcoded) |
| Wizard | Checklist generator in `packages/wizard` (step templates per sector/form/region) |
| PDF | @react-pdf/renderer for incentives report |
| i18n | next-intl (en/fr/ar), **English primary** |
| Jobs | pg-boss (wizard step reminders, expert booking reminders, AI cost sweep) |
| Email | Resend |
| Storage | R2 private (investor docs), R2 public (expert/partner photos) |
| **No Money type** | Expert rates are plain integers (MAD/EUR display) — no transactions |

## Key ADRs

### ADR-01: English primary (not FR like all other platforms)
Target audience is foreign investors. next-intl default locale = `en`.
FR is second, AR third. All copy, errors, and content default to English.

### ADR-02: LinkedIn OAuth alongside Google
B2B investors prefer LinkedIn. Auth.js LinkedIn provider configured.
Profile data (company, title) auto-filled from LinkedIn on first login.

### ADR-03: Incentive rules stored in DB (not hardcoded TypeScript)
The Investment Charter changes. Rules must be updatable by admin without code deploy.
`incentive_rules` table: `{ id, type, condition_json, value, source_article, updated_at }`.
The `packages/incentives` engine reads from DB; `IncentivesEngine.compute()` evaluates
condition_json against investor profile.

### ADR-04: AI context injection per investor profile
Every Claude API call injects: sector, activityType, investmentBracket, targetRegions.
System prompt: "You are an investment advisor for Morocco. Context: [investor profile].
Answer factually, cite sources, always recommend CRI verification for binding info."
Never a context-free chat.

### ADR-05: Intelligence Hub is SSR + cached (SEO mission)
Sector guides and CRI pages are server-rendered and ISR-cached (1 hour).
Target keywords: "invest in Morocco [sector] 2026", "Morocco Investment Charter 2022",
"CRI [city] contact". This drives organic acquisition from foreign investors doing research.

## Data Flow
```
Anonymous user → Calculator (no auth) → results → CTA "Save & track" → signup
Logged-in investor → Wizard → step-by-step → document vault
AI advisor chat → Claude API (with investor context injected) → response + source citation
Expert booking → slot selection → confirmation email → video session
Admin → update incentive rules in DB → calculator auto-reflects changes
```
