---
name: partner-engine
description: Apply Naql/partner-engine patterns. Istiqtab-specific notes below.
---
# Partner Engine — Istiqtab

## Istiqtab Context
- DB: **postgres:16-alpine — NO pgvector, NO scraper**. Simplest DB stack of all 6 platforms.
- Auth: Auth.js v5 (email + Google OAuth + **LinkedIn OAuth**). LinkedIn is critical for B2B.
- 5 roles: investor / consultant / expert / partner / admin
- **No Money type** — no financial transactions. Expert rates = plain integers (MAD/EUR).
- **English primary** — next-intl default locale = 'en'. Not FR like all others.
- AI: ANTHROPIC_API_KEY in env only; never client-side; token usage logged per message
- Incentive rules: stored in DB table (updatable by admin), not hardcoded TypeScript
- Critical tests: incentive computation golden-file, AI guardrail (injection detection + disclaimer), wizard step generation per profile, investor doc 403 for other user

## Sprint Snapshot (project-monitor only)
```
### [date] SPRINT_SNAPSHOT — Sprint N
- Tests: unit / E2E
- Incentive engine tests: PASS/FAIL
- AI guardrail tests: PASS/FAIL
- Role isolation: PASS/FAIL
- DoD items: N/20
```
