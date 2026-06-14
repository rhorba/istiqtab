# sessions
## SESSION_START — PROJECT INITIALIZED
Sprint: 0 — Ready to start
Status: Fresh project. Framework scaffolded. All S0 tasks pending.
Goal: `pnpm dev`, Auth (email + Google + LinkedIn), postgres:16-alpine + RLS, role isolation proven.
**KEY DIFFERENCES from all other platforms**:
- English is primary locale (not FR)
- LinkedIn OAuth required (alongside Google)
- No pgvector, no scraper — simplest DB stack of all 6 platforms
- No Money type — no financial transactions
- ANTHROPIC_API_KEY needed for AI advisor (Sprint 5)
Next: S0-01 (workspace) → S0-07 (Auth.js with LinkedIn) → S0-10 (EN default locale)

### 2026-06-14 SPRINT_SNAPSHOT — Sprint 0 (COMPLETE)
- Tests: 13 unit (core RBAC 7, web withRole 4, web ai-key guardrail 2) / E2E: none yet (Playwright wired, specs deferred)
- Incentive engine tests: N/A (Sprint 3)
- AI guardrail tests: PASS (ANTHROPIC_API_KEY server-only: no NEXT_PUBLIC exposure, no client-component reference)
- Role isolation: PASS (RBAC matrix per §7; withRole throws UNAUTHENTICATED/FORBIDDEN)
- Gates: `pnpm typecheck` ✓ · `pnpm test` ✓ · `pnpm lint` ✓ (0 errors, 7 noNonNullAssertion warnings) · `pnpm build` ✓ (en/fr/ar routes)
- Infra: docker-compose (postgres:16-alpine + web + worker + caddy) validated; web/worker Dockerfiles; GitHub Actions CI on postgres:16-alpine.
- DoD items: Sprint 0 DoD met. Overall v0.1 DoD §12: ~1/20 (auth scaffold).
- Pushed: github.com/rhorba/istiqtab @ main (commit d4198e9)
- Carry-over to Sprint 2: S0-16's "investor doc 403 for other investor" test deferred — document vault (and its RLS) doesn't exist until Sprint 2; will add the 403 isolation test then.
- Repo note: standalone Next output gated behind NEXT_OUTPUT_STANDALONE=1 (Windows/OneDrive can't symlink during build trace); Dockerfile sets it.
