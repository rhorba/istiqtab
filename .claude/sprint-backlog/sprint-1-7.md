# Sprint 1 — Data Model + Profiles + Demo Seed

**Duration**: 1–2 sessions | **Depends on**: Sprint 0

## Must
- [ ] S1-01 — DBA: full schema — `investor_profiles`, `investor_documents`, `partner_profiles`, `expert_profiles`, `expert_slots`, `expert_bookings`, `introduction_requests`, `incentive_rules` (DB-driven, not hardcoded), `incentive_results`, `ai_chat_messages`, `wizard_step_templates`, `notifications`, `audit_logs`, `access_audit_logs` — all with RLS — **DBA** → Security
- [ ] S1-02 — Security: review RLS — investor docs: investor + admin only; AI chat: investor + admin only — **Security**
- [ ] S1-03 — Backend: investor profile CRUD (sector, bracket, regions, wizard state) — **Backend Dev**
- [ ] S1-04 — Backend: partner profile CRUD + expert profile CRUD — **Backend Dev**
- [ ] S1-05 — Frontend: investor onboarding (sector → bracket → activity → regions → done) — **Frontend Dev**
- [ ] S1-06 — Frontend: partner + expert profile create/edit — **Frontend Dev**
- [ ] S1-07 — DBA + Backend: demo seed (5 investors, 6 experts, 12 partners, 12 CRI region records, incentive rules for Charter 2022) — **DBA**
- [ ] S1-08 — Content Editor: EN/FR/AR for all sector labels, region names, incentive types, partner types — **Content Editor**
- [ ] S1-09 — Tester: role isolation; investor doc 403; partner cannot edit expert profile — **Tester**
- [ ] S1-10 — Sprint 1 snapshot → ask for Sprint 2

---

# Sprint 2 — Setup Wizard

**Duration**: 2 sessions | **Depends on**: Sprint 1

## Must
- [ ] S2-01 — UX: wizard flow wireframes (step list + current step + progress bar) — **UX Designer**
- [ ] S2-02 — packages/wizard: `generateWizardSteps(profile)` — returns personalized checklist based on sector + legal form + region + activity — **Backend Dev**
- [ ] S2-03 — packages/wizard: step templates seeded per scenario (SARL manufacturing, SA services, Succursale, etc.) — **Backend Dev**
- [ ] S2-04 — Backend: wizard step status update (complete/block/note) — **Backend Dev**
- [ ] S2-05 — Backend: investor document vault upload (private R2 + audit log) — **Backend Dev** → Security
- [ ] S2-06 — Frontend: wizard dashboard (step list + progress tracker + doc vault) — **Frontend Dev**
- [ ] S2-07 — Frontend: individual step page (requirements + official link + doc upload + mark complete) — **Frontend Dev**
- [ ] S2-08 — Backend: `wizard.reminders` pg-boss job (email if no progress in 7 days) — **Backend Dev**
- [ ] S2-09 — Tester: wizard step generation for all sector+form combos, doc 403 — **Tester**
- [ ] S2-10 — Sprint 2 snapshot → ask for Sprint 3

---

# Sprint 3 — Incentives Calculator (Rule Engine + PDF)

**Duration**: 2 sessions | **Depends on**: Sprint 2

## Must
- [ ] S3-01 — Incentives Engine: `computeIncentives(db, profile)` — reads rules from DB, evaluates conditions — **Incentives Engine**
- [ ] S3-02 — Incentives Engine: `compareRegions(db, profile, regions)` — 3-region comparison — **Incentives Engine**
- [ ] S3-03 — Incentives Engine: PDF report export with mandatory disclaimer — **Incentives Engine**
- [ ] S3-04 — Backend: incentives calculator API (anonymous + authenticated) — **Backend Dev**
- [ ] S3-05 — Backend: admin incentive rule CRUD (update Charter rules in DB without code deploy) — **Backend Dev**
- [ ] S3-06 — Frontend: **public** incentive calculator (5-step form, no login required) — **Frontend Dev**
- [ ] S3-07 — Frontend: results page (incentive cards + comparison table + export PDF CTA + "Save & explore wizard" CTA) — **Frontend Dev**
- [ ] S3-08 — Frontend: 3-region comparison view — **Frontend Dev**
- [ ] S3-09 — Tester: golden-file test (known profile → expected incentives), PDF disclaimer present, anonymous access works — **Tester**
- [ ] S3-10 — Sprint 3 snapshot → ask for Sprint 4

---

# Sprint 4 — Partner Directory + Introduction Requests

**Duration**: 1–2 sessions | **Depends on**: Sprint 3

## Must
- [ ] S4-01 — Backend: partner directory list (public browse) + filter (type/sector/region/language) — **Backend Dev**
- [ ] S4-02 — Frontend: partner directory with filters + partner profile cards — **Frontend Dev**
- [ ] S4-03 — Frontend: partner detail page (specialties, regions, language flags, past international clients) — **Frontend Dev**
- [ ] S4-04 — Backend: introduction request (investor → admin notified → admin forwards to partner) — **Backend Dev**
- [ ] S4-05 — Frontend: introduction request form + status tracker — **Frontend Dev**
- [ ] S4-06 — Tester: intro request flow, partner visibility (public profile vs private details) — **Tester**
- [ ] S4-07 — Sprint 4 snapshot → ask for Sprint 5

---

# Sprint 5 — Expert Booking + AI Advisor

**Duration**: 2 sessions | **Depends on**: Sprint 4

## Must
- [ ] S5-01 — Backend: expert slot management (expert creates availability slots) — **Backend Dev**
- [ ] S5-02 — Backend: expert booking (investor picks slot → confirmed → Resend email + calendar link) — **Backend Dev**
- [ ] S5-03 — Frontend: expert directory + filter + booking calendar UI — **Frontend Dev**
- [ ] S5-04 — AI Advisor: `packages/ai` — Claude API integration, context injection, guardrails, token tracking — **AI Advisor**
- [ ] S5-05 — Backend: AI chat endpoint (authenticated; context-aware; rate-limited 20/day; tokens logged) — **Backend Dev** → Security
- [ ] S5-06 — Frontend: AI chat UI (bubbles + source citations + disclaimer header + "Book expert" CTA after 3 exchanges) — **Frontend Dev**
- [ ] S5-07 — Security: `ANTHROPIC_API_KEY` env only; injection detection; guardrail validation — **Security**
- [ ] S5-08 — Tester: AI guardrail (injection, guarantee, disclaimer), token tracking, rate limit, booking confirmation email — **Tester**
- [ ] S5-09 — Sprint 5 snapshot → ask for Sprint 6

---

# Sprint 6 — Intelligence Hub + Notifications + Email

**Duration**: 1–2 sessions | **Depends on**: Sprint 5

## Must
- [ ] S6-01 — Backend + Frontend: CRI profiles page (12 regions, SSR, SEO-optimized, public) — **Frontend Dev**
- [ ] S6-02 — Backend + Frontend: sector guides (10 sectors, SSR, public, structured investment data) — **Frontend Dev**
- [ ] S6-03 — Backend: in-app notifications (wizard reminder, booking confirmation, intro request status, AI rate limit) — **Backend Dev**
- [ ] S6-04 — Backend: Resend emails (welcome, wizard step reminder, booking confirmation, intro request update) — **Backend Dev**
- [ ] S6-05 — Content Editor: complete en.json + fr.json + ar.json sweep — zero gaps — **Content Editor**
- [ ] S6-06 — Frontend: i18n audit + RTL audit — **Frontend Dev**
- [ ] S6-07 — Frontend: a11y — focus, labels, contrast — **Frontend Dev**
- [ ] S6-08 — Tester: i18n parity (all EN keys in FR + AR), CRI page SSR, sector guide SEO tags — **Tester**
- [ ] S6-09 — Sprint 6 snapshot → ask for Sprint 7

---

# Sprint 7 — Admin Dashboard + Security + Deploy → v0.1 SHIP

**Duration**: 1–2 sessions | **Depends on**: Sprint 6

## Must
- [ ] S7-01 — Frontend: admin dashboard — KPIs (calculator uses, wizard completions, AI sessions, expert bookings, partner intros, token cost) — **Frontend Dev**
- [ ] S7-02 — Frontend: admin incentive rule editor (update Charter rules in DB) — **Frontend Dev**
- [ ] S7-03 — Frontend: admin expert/partner verification queue — **Frontend Dev**
- [ ] S7-04 — Security: adversarial tests — investor doc 403, AI API key not in client bundle, AI injection test, role escalation — **Security**
- [ ] S7-05 — Security: LinkedIn OAuth redirect URI locked; auth hardening — **Security**
- [ ] S7-06 — Tech Lead: SEO — Intelligence Hub pages have meta tags, OG, structured data; SSR confirmed — **Tech Lead**
- [ ] S7-07 — DevOps: deploy path A (Vercel + Neon postgres) + B (`docker compose up -d`) — **DevOps**
- [ ] S7-08 — Deployment: verify both paths; calculator works anonymous; AI chat works logged in — **Deployment**
- [ ] S7-09 — Tester: full regression + incentive golden-file + AI guardrail + E2E critical paths — **Tester**
- [ ] S7-10 — README + .env.example complete — **Project Manager**
- [ ] S7-11 — Final DoD: all 20 items ✅ — **Project Monitor** → v0.1 SHIPPED

## DoD — Sprint 7 (= v0.1 SHIPPED)
- [ ] Calculator: public, anonymous, all 11 incentive types, disclaimer on every output
- [ ] AI advisor: context-aware, guardrails active, ANTHROPIC_API_KEY server-side only
- [ ] Wizard: personalized steps, progress tracker, document vault
- [ ] Expert booking: slots, confirmation email, video link
- [ ] Partner intro: request → admin mediation → partner notification
- [ ] Intelligence Hub: 12 CRI pages + 10 sector guides SSR + SEO
- [ ] EN/FR/AR complete; RTL correct; LinkedIn OAuth working
- [ ] `pnpm build` 0 errors; `pnpm test` green; `pnpm lint` clean; gitleaks passes
