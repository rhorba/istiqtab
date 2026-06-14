# Sprint 0 — Scaffold + Auth (Email + Google + LinkedIn) + RBAC + RLS

**Goal**: `pnpm dev` works. Auth with 3 providers (email, Google, LinkedIn). 5 roles. Role isolation proven.
postgres:16-alpine — NO pgvector, NO scraper.

**Duration**: 1–2 sessions | **Auto-handoff**: ENABLED

## Must
- [ ] S0-01 — pnpm workspace: `apps/web`, `packages/core|db|wizard|incentives|partners|ai|notifications` — **Tech Lead**
- [ ] S0-02 — `apps/web` Next.js 15 App Router + TypeScript strict + Biome — **Tech Lead**
- [ ] S0-03 — `packages/core`: `Role` enum (investor/consultant/expert/partner/admin), RBAC, Zod schemas (no Money type) — **Tech Lead**
- [ ] S0-04 — `packages/db`: Drizzle config + `users` table — **DBA**
- [ ] S0-05 — RLS: `withUserContext` helper; policies on users — **DBA** → Security
- [ ] S0-06 — DB init: RLS-bound app role (postgres:16-alpine) — **DBA** → DevOps
- [ ] S0-07 — Auth.js v5: email+Argon2id + Google OAuth + **LinkedIn OAuth**; session `{ userId, role }`; auto-fill company/title from LinkedIn — **Security**
- [ ] S0-08 — `withRole()` server action factory — **Backend Dev**
- [ ] S0-09 — Signup: choose role (investor/consultant/expert/partner) → create user; login page with 3 auth options — **Backend Dev**
- [ ] S0-10 — next-intl **en/fr/ar** — **English primary** (`defaultLocale: 'en'`) + `[locale]` layout + `dir` switch — **Frontend Dev**
- [ ] S0-11 — Tailwind v4 + navy/gold tokens + shadcn/ui + EN-first copy — **UI Designer**
- [ ] S0-12 — App shell: role-aware nav (5 roles), language toggle (EN/FR/AR), top bar — **Frontend Dev**
- [ ] S0-13 — Docker Compose (**postgres:16-alpine** + web + worker + caddy) + .env.example (include ANTHROPIC_API_KEY) — **DevOps**
- [ ] S0-14 — pg-boss worker: queues (wizard.reminders, ai.cost.sweep, booking.reminders, expert.slots.cleanup) — **DevOps**
- [ ] S0-15 — GitHub Actions CI: **postgres:16-alpine** (standard — no pgvector) + ANTHROPIC_API_KEY as GitHub secret — **DevOps**
- [ ] S0-16 — Tester: role isolation; investor doc 403 for other investor; AI API key not in client bundle test — **Tester**
- [ ] S0-17 — Sprint 0 snapshot → ask for Sprint 1 approval

## DoD — Sprint 0
- [ ] Auth works: email, Google, LinkedIn — 3 providers; session carries role
- [ ] English default locale; FR/AR routing; `dir=rtl` on `/ar`
- [ ] Role isolation test passes; `pnpm test`/`lint` clean; `pnpm build` passes
