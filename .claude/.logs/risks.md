# risks
## RISK-000 — AI advisor financial advice liability (standing, critical)
Risk: AI response promises specific incentive amounts → Istiqtab perceived as financial advisor.
Mitigation: `validateAIResponse()` guardrails + mandatory disclaimer on every incentive answer + "informational only" in system prompt. Cannot be switched off.

## RISK-001 — ANTHROPIC_API_KEY leaked
Risk: API key in client bundle or git repo → cost exposure + security breach.
Mitigation: env var only; never in client-side code; gitleaks in CI; separate secret for dev/prod.

## RISK-002 — Incentive data becomes outdated (Charter changes)
Risk: Rules hardcoded → stale after Charter update.
Mitigation: Rules in DB table; admin can update without code deploy; `updated_at` displayed on calculator; `confidence` field warns users when verification needed.

## RISK-003 — Investor documents exposed
Risk: Passport copies and financial statements accessed by unauthorized users.
Mitigation: Private R2; signed URLs (15-min); investor + admin only; every access audit-logged.
