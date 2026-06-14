# Istiqtab — استقطاب

**Set up in Morocco. Fast, clear, confident.**
*Investissez au Maroc. Vite, clairement, en confiance.*

Istiqtab is Morocco's first AI-powered FDI facilitation platform — helping foreign
investors navigate company setup, calculate incentives, and find verified local partners.

Built on 2024/2025/2026 FDI data: MAD 43.195B revenues (+24.7%), net flows +55.4%.

---

## The Problem We Solve

- FDI into Morocco is booming — but onboarding foreign investors takes 6–18 months
- 12 CRIs, 8+ administrations, a 2022 Investment Charter with complex eligibility rules
- No single platform exists to guide investors from "interested" to "operational"
- Istiqtab does what AMDIE's website, expensive law firms, and scattered PDFs try to do —
  in one place, in English, with an AI advisor available 24/7

---

## What Makes Istiqtab Different from the Other 5 Platforms

| Feature | All others | **Istiqtab** |
|---|---|---|
| Primary language | French | **English** |
| Auth | Email + Google | **+ LinkedIn OAuth** |
| Database extra | pgvector or none | **None (postgres:16-alpine)** |
| Transactions | Yes (all others) | **None (SaaS only)** |
| Money type | Yes (all others) | **None** |
| AI integration | None | **Claude API advisor** |
| Primary product | Marketplace/tool | **Information + Navigation + Expert** |
| SEO mission | No | **Heavy SSR + ISR (Intel Hub)** |

---

## Quick Start

```bash
git clone https://github.com/your-org/istiqtab.git && cd istiqtab
cp .env.example .env   # add AUTH_SECRET, ANTHROPIC_API_KEY, LINKEDIN_CLIENT_ID/SECRET
pnpm install
docker compose up -d postgres   # postgres:16-alpine — simple, no pgvector
pnpm db:migrate
pnpm db:seed
pnpm dev   # http://localhost:3000/en
```

**Demo investor**: hans.schmidt@demo.istiqtab.ma / demo1234 (German automotive, 100–500M MAD)

---

## Architecture

```
istiqtab/
├── apps/web/
│   ├── (public)/       Calculator + Intel Hub + CRI profiles (SSR, no auth)
│   ├── (investor)/     Wizard + saved results + partner/expert search
│   ├── (expert)/       Expert availability + session management
│   ├── (partner)/      Partner profile management
│   └── (admin)/        Admin dashboard + rule editor + KPIs
└── packages/
    ├── core/           Role, RBAC (no Money type)
    ├── db/             Drizzle + RLS (postgres:16-alpine)
    ├── wizard/         Setup checklist generator per profile
    ├── incentives/     Charter 2022 rule engine (DB-driven)
    ├── partners/       Partner matching + intro request flow
    ├── ai/             Claude API adapter + guardrails + token tracking
    └── notifications/  In-app + Resend email
```

---

## Key Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres (RLS-bound app role) |
| `AUTH_SECRET` | 32-byte random |
| `GOOGLE_CLIENT_ID` / `_SECRET` | Google OAuth |
| `LINKEDIN_CLIENT_ID` / `_SECRET` | LinkedIn OAuth (**required**) |
| `ANTHROPIC_API_KEY` | Claude API for AI advisor (**server-side only**) |
| `RESEND_API_KEY` | Transactional email |
| `R2_PRIVATE_*` | Cloudflare R2 private (investor docs) |
| `R2_PUBLIC_*` | Cloudflare R2 public (expert/partner photos) |

---

## Legal Disclaimers (Non-Negotiable)

All incentive outputs and AI advisor responses include:
> "This is informational only and does not constitute legal or financial advice.
> Please verify with your CRI or a qualified Moroccan legal advisor for binding guidance."

The AI advisor cannot be configured to remove this disclaimer.

---

v0.1 — Built with Claude Code
Data sources: Office des Changes Morocco, HCP BEP 2026, AMDIE, Investment Charter 2022, State Dept. 2025 ICS Morocco
