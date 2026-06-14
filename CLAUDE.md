# Istiqtab — استقطاب — Claude Code Project Bible

> This is the root business document. All specialists read this first.
> `.claude/CLAUDE.md` governs HOW the team works.
>
> **Istiqtab** (استقطاب — "attraction / talent acquisition") is Morocco's first
> AI-powered FDI facilitation platform — helping foreign investors navigate company
> setup, calculate incentives, and find verified local partners.
>
> **Structurally different from all 5 previous platforms in this portfolio**:
> No marketplace transactions. No escrow. No scraping.
> The product is information, navigation, and expert connection — pure SaaS.

---

## §1 — The Problem (grounded in 2024/2025/2026 data)

Morocco is a top African investment destination — but the onboarding experience is broken:

- FDI revenues reached MAD 43.195 billion in 2024 (+24.7% YoY) with net flows of MAD 17.237 billion (+55.4%)
- HCP 2026 projection: **56.1 billion MAD** FDI in 2025, +22% from the previous peak — across 18 sectors
- Morocco is increasingly used as a **nearshoring, manufacturing, export, and regional HQ** base
- **France** accounts for 61.4% of net FDI; Gulf, US, and China are fast-rising sources
- Government target: **550 billion MAD** in private investment by 2026, raising FDI to 4%+ of GDP
- Investment Charter 2022: offers tax breaks, subsidies, grants — but the rules are complex and poorly documented
- **12 Regional Investment Centres (CRI)** — each with different processes, incentives, and contacts
- **AMDIE** (national agency) + **Commission Interministérielle** for investments > 200M MAD

**The investor's journey today**:
A German autopart manufacturer wants to set up a production plant near Tangier. They:
1. Spend 3–6 months researching across 15+ disconnected government websites
2. Hire an expensive Moroccan law firm to navigate RC + ICE + CNSS + DGI + ANAPEC
3. Fail to understand which Charter incentives apply to their sector + investment size + region
4. Can't find vetted local suppliers/distributors without warm introductions
5. Miss optimal CRI region because incentive comparison doesn't exist in one place

**The result**: Deals that should close in 3 months take 18 months. Some never close.

**Istiqtab solves this** — the first platform that takes a foreign investor from
"interested in Morocco" to "company registered + local partners identified" in weeks, not months.

---

## §2 — Project Identity

**Name**: Istiqtab
**Domain**: istiqtab.ma
**Tagline (EN)**: "Set up in Morocco. Fast, clear, confident."
**Tagline (FR)**: "Investissez au Maroc. Vite, clairement, en confiance."
**Tagline (AR)**: "استثمر في المغرب. بسرعة، بوضوح، بثقة."
**Type**: B2B SaaS + marketplace (information product + expert connection + partner matching).
**Audience**:
  - **Foreign investors** (primary):
    - European nearshoring (manufacturing, BPO, R&D centers, tech)
    - Gulf investors (real estate, tourism, renewables, food processing)
    - US / Asian companies (renewables, automotive supply chain, pharma)
    - Decision-makers: CFO, Head of Strategy, Legal Counsel — not retail investors
  - **Investment consultants & law firms** (secondary):
    - Moroccan and international advisory firms who guide foreign clients
    - Use Istiqtab to accelerate their due diligence and client onboarding
  - **CRI/AMDIE** (partner channel — v0.2):
    - White-label or data-sharing partnerships with government investment agencies
  - **Platform Admin**: Internal — expert management, partner verification, KPIs
**Language**: **English primary** (foreign investors), French secondary (`fr`), Arabic tertiary (`ar`).
**Tone**: Professional, confident, expert. Like a trusted advisor, not a government portal.
  Clear, jargon-free, with actionable next steps. This platform competes with McKinsey
  investment reports and expensive law firms.

### Positioning
> "AMDIE tells you Morocco is open for business.
> Istiqtab tells you exactly how to open yours — and who to call."

---

## §3 — Core Features (v0.1 scope)

### Module A — Investment Wizard (Parcours d'implantation)
The core product. A guided, adaptive setup journey.

- **Sector & profile intake**: investor selects sector (automotive, renewables, BPO, pharma,
  agri-food, tourism, tech, real estate, other), investment size bracket, source country,
  intended activities (manufacturing / services / R&D / distribution / HQ)
- **Legal form recommendation**: based on profile → recommend SARL / SA / Succursale / Bureau
  de liaison + explain differences (liability, capital requirements, foreign ownership %)
- **CRI region comparison**: for their sector + activities → ranked comparison of the
  12 regions with relevant data (proximity to port, available industrial zones, land prices,
  talent pool, existing cluster peers)
- **Step-by-step setup checklist**: personalized to their profile:
  - RC (Registre de Commerce) via tribunal de commerce
  - ICE (Identifiant Commun de l'Entreprise) via DGI
  - CNSS registration
  - Bank account opening (with recommended banks for international transfers)
  - Sector-specific licenses (ONSSA for agri-food, ANRT for telecoms, AMEE for energy...)
  - Work permits for foreign staff (ANAPEC)
- **Document vault**: upload + store setup documents as they progress
- **Progress tracker**: dashboard showing current step, completed, pending, blocked
- **CRI contact directory**: direct contacts at each CRI with their email + phone
- **Timeline estimate**: "With your profile, typical setup takes 6–10 weeks"

### Module B — Incentives Calculator (Calculateur d'incitations)
The intelligence layer. No equivalent exists publicly.

- **Input**: sector + investment amount + region + job creation target + activity type
- **Output**: compute eligible incentives from the Investment Charter 2022 + regional schemes:
  - IS (corporate tax) exemption period (5 years standard; extended for strategic sectors)
  - IS rate post-exemption (10% vs 20% vs standard)
  - TVA exoneration on equipment imports
  - Customs duty exemption on production equipment
  - Land subsidy (prime foncière): % of land value covered by state
  - Employment premium (prime à l'emploi): per job created (varies by region)
  - Training subsidy (OFPPT programs)
  - Energy subsidy (priority access to green energy + tariff reduction)
  - Export incentives (AMDIE export programs)
  - Special economic zone benefits (Tanger Free Zone, Casablanca Finance City...)
- **Comparison mode**: compare 3 regions side-by-side for the same project
- **Exportable report**: PDF summary of applicable incentives for investor's board/investors
- **Disclaimer**: "Based on publicly available Charter data. Verify with your CRI for final confirmation."

### Module C — Local Partner Finder (Annuaire des partenaires)
The network unlock. The most relationship-sensitive module.

- **Partner types**: local distributors, industrial subcontractors, talent recruitment agencies,
  logistics providers, accounting firms, legal firms, real estate agents
- **Verified profiles**: partner company + sector specialization + regions covered + references
  + language capability (English / French / Arabic)
- **Search + filter**: by sector, region, partner type, language
- **Public profile**: company overview, specialties, past international clients (if shared)
- **Contact request**: investor can request introduction → admin mediates → partner notified
  (not direct email to protect partner privacy + quality control)
- **Premium lead**: if partner accepts introduction, Istiqtab earns a referral fee (v0.2)

### Module D — AI Investment Advisor (Ask Istiqtab)
The 24/7 expert layer. Built on the Claude API.

- **Chat interface**: investor asks questions like:
  - "What's the minimum capital to set up a SARL in Morocco?"
  - "Can I own 100% of a Moroccan company in the automotive sector?"
  - "What are the work permit requirements for 3 French engineers?"
  - "Is Tanger or Kenitra better for my automotive plant?"
- **Context-aware**: chat knows the investor's sector + profile (if logged in)
- **Source citations**: answers reference Charter 2022, CRI guides, AMDIE publications
- **Escalation**: "For your specific situation, we recommend booking a session with an expert"
- **Conversation history**: saved for logged-in users

### Module E — Expert Booking
- **Expert directory**: vetted Moroccan investment lawyers, tax advisors, sector specialists
- **Booking**: 30/60-minute video consultation via calendar link (Calendly-style)
- **Pricing**: expert sets their rate (MAD or EUR); Istiqtab takes 15% commission
- **Focus areas**: legal setup, tax optimization, sector licensing, real estate acquisition
- **Post-session**: investor reviews expert → feeds expert rating

### Module F — Intelligence Hub (public, no auth required)
- **Investment guides**: "How to invest in Morocco's automotive sector in 2026" (SEO content)
- **CRI profiles**: one page per region with key data (industrial zones, incentives, contacts)
- **Sector snapshots**: 10 sectors with key investment data, major players, growth numbers
- **Regulatory tracker**: "Investment Charter 2022 — last updated: [date]" — signals freshness
- **News feed**: major FDI announcements in Morocco (curated, not scraped)

### Module G — Admin Dashboard
- Wizard completion rates by sector + source country
- Expert booking performance
- Partner introduction requests + conversion
- AI advisor question analytics (what are investors asking most?)
- Incentives calculator usage by sector
- Platform KPIs: sessions, conversions to expert booking, partner matches

---

## §4 — Out of Scope (v0.1)

| Deferred | Feature |
|---|---|
| **v0.2** | White-label for CRI/AMDIE integration |
| **v0.2** | Partner referral fee processing (payment rails for introductions) |
| **v0.2** | Document translation service (Arabic ↔ French ↔ English) |
| **v0.2** | Investment project tracking (post-setup CRM for investor) |
| **v0.2** | Investor community / forum |
| **v0.2** | Mobile app |
| **v0.3** | Real-time CRI/DGI API integration for live process status |
| **v0.3** | African market expansion (Tunisia, Senegal, Ivory Coast) |
| **out** | Financial advice, securities, investment fund management |

---

## §5 — Tech Stack (FINAL)

| Concern | Choice | Why |
|---|---|---|
| Web | Next.js 15 App Router, TypeScript strict | SSR for investment guides (heavy SEO) |
| Styling | Tailwind v4 + shadcn/ui | |
| DB | PostgreSQL 16 + Drizzle ORM + RLS | Standard; no pgvector, no scraping |
| Auth | Auth.js v5 (email+password + Google OAuth + LinkedIn OAuth) | LinkedIn is important for B2B investor persona |
| AI Advisor | Claude API (`claude-sonnet-4-20250514`) via `packages/ai` | In-product AI Q&A built on Claude |
| Incentives engine | `packages/incentives` — rule-based computation from a structured Charter data model | Transparent, updatable, no ML |
| Partner matching | SQL full-text search + structured filters | Simple filtering sufficient |
| Expert booking | DB-backed slots + Resend confirmation | No external calendar service in v0.1 |
| PDF export | @react-pdf/renderer (incentives report) | |
| Email | Resend (booking confirmations, lead alerts, welcome) | |
| Storage | Cloudflare R2 (private for uploaded docs, public for expert photos) | |
| i18n | next-intl (en/fr/ar) — English primary | |
| Testing | Vitest + Playwright | |
| Container | Docker Compose (postgres + web + worker + caddy) | Standard postgres:16-alpine |
| PM | pnpm workspaces | |
| Linting | Biome | |
| CI | GitHub Actions (postgres:16-alpine) | |

> **AI NOTE**: The Claude API integration in `packages/ai` uses the standard
> Anthropic `/v1/messages` endpoint. The AI advisor is context-aware (investor profile
> injected into system prompt). Answers must cite sources. Billing is per-token —
> log token usage per user to monitor costs.

> **NO pgvector, NO scraper, NO escrow, NO payment processing** in v0.1.
> This is the simplest technical stack of all 6 platforms.

---

## §6 — Data Model (core entities)

```typescript
// packages/core/src/types.ts

type Role = 'investor' | 'consultant' | 'expert' | 'partner' | 'admin'

type InvestorOrigin =
  | 'france' | 'spain' | 'germany' | 'other_europe'
  | 'uae' | 'saudi' | 'other_gulf'
  | 'usa' | 'china' | 'other_asia' | 'africa' | 'other'

type InvestmentSector =
  | 'automotive'       // Automobile & équipements
  | 'aerospace'        // Aéronautique
  | 'renewables'       // Énergies renouvelables
  | 'bpo_ites'         // BPO / Offshoring / IT
  | 'pharma'           // Industrie pharmaceutique
  | 'agrifood'         // Agroalimentaire
  | 'tourism'          // Tourisme / Hôtellerie
  | 'real_estate'      // Immobilier
  | 'finance'          // Services financiers
  | 'logistics'        // Logistique / Transport
  | 'tech'             // Tech / Digital
  | 'textile'          // Textile / Habillement
  | 'mining'           // Mines / Extraction
  | 'other'

type ActivityType = 'manufacturing' | 'services' | 'r_and_d' | 'distribution' | 'headquarters' | 'mixed'

type LegalForm = 'sarl' | 'sa' | 'sas' | 'succursale' | 'bureau_de_liaison' | 'sarlau'

type InvestmentBracket =
  | 'under_5m'         // < 5M MAD
  | '5m_to_25m'        // 5–25M MAD
  | '25m_to_100m'      // 25–100M MAD
  | '100m_to_500m'     // 100–500M MAD
  | 'over_500m'        // > 500M MAD (Commission Interministérielle)

type MoroccanRegion =
  | 'tanger_tetouan'
  | 'oriental'
  | 'fes_meknes'
  | 'rabat_sale'
  | 'beni_mellal'
  | 'casablanca_settat'
  | 'marrakech_safi'
  | 'draa_tafilalet'
  | 'souss_massa'
  | 'guelmim_oued_noun'
  | 'laayoune_sakia'
  | 'dakhla_oued_dahab'

type WizardStep = {
  id: string
  title: string
  titleFr: string; titleAr: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped'
  requiredDocuments?: string[]
  officialLink?: string         // link to relevant government portal
  estimatedDays?: number        // typical processing time
  completedAt?: Date
  notes?: string                // investor's notes on this step
}

type User = {
  id: string; email: string; name: string; role: Role
  company?: string; country?: string; linkedinUrl?: string
  preferredLanguage: 'en' | 'fr' | 'ar'
  isActive: boolean; emailVerified: boolean; createdAt: Date
}

type InvestorProfile = {
  id: string; userId: string
  companyName?: string; companyCountry: InvestorOrigin
  sector: InvestmentSector; activityType: ActivityType
  investmentBracket: InvestmentBracket
  targetRegions: MoroccanRegion[]
  jobsToCreate?: number
  currentStep: string           // active wizard step ID
  wizardSteps: WizardStep[]     // full personalized checklist
  preferredLegalForm?: LegalForm
  documents: InvestorDocument[]
  aiChatHistory: AIChatMessage[] // last 50 messages stored
  createdAt: Date; updatedAt: Date
}

type InvestorDocument = {
  id: string; investorId: string
  type: 'passport' | 'company_reg' | 'financial_statement' | 'project_memo' | 'other'
  fileKey: string               // R2 private
  uploadedAt: Date
}

type IncentiveResult = {
  id: string; investorId?: string
  sector: InvestmentSector; region: MoroccanRegion
  investmentBracket: InvestmentBracket
  activityType: ActivityType; jobsToCreate: number
  applicableIncentives: AppliedIncentive[]
  totalEstimatedBenefit?: string  // rough indicative range
  computedAt: Date
  reportKey?: string            // R2 key for exported PDF
}

type AppliedIncentive = {
  type: IncentiveType
  label: string; labelFr: string; labelAr: string
  value: string                 // e.g. "5 ans d'exonération IS" or "15% du prix du terrain"
  condition: string             // condition that triggered this incentive
  sourceArticle?: string        // reference to Charter article
  confidence: 'confirmed' | 'indicative' | 'requires_verification'
}

type IncentiveType =
  | 'is_exemption'              // Exonération IS
  | 'is_reduced_rate'           // Taux IS réduit
  | 'tva_exemption'             // Exonération TVA
  | 'customs_exemption'         // Exonération droits de douane
  | 'land_subsidy'              // Prime foncière
  | 'employment_premium'        // Prime à l'emploi
  | 'training_subsidy'          // Subvention formation
  | 'energy_benefit'            // Avantage énergie
  | 'export_support'            // Soutien export AMDIE
  | 'sez_benefit'               // Zone économique spéciale
  | 'r_and_d_credit'            // Crédit impôt R&D

type PartnerProfile = {
  id: string; userId: string
  companyName: string; ice?: string
  partnerType: PartnerType
  sectors: InvestmentSector[]
  regions: MoroccanRegion[]
  languages: string[]           // ['en', 'fr', 'ar']
  description: string
  internationalClients?: string[]  // past international client names (optional)
  websiteUrl?: string
  photoKey?: string             // R2 public
  verified: boolean
  avgRating: number; reviewCount: number
  createdAt: Date
}

type PartnerType =
  | 'law_firm'                  // Cabinet d'avocats / conseil juridique
  | 'tax_advisor'               // Cabinet fiscal / comptable
  | 'real_estate'               // Immobilier industriel / commercial
  | 'industrial_zone'           // Gestionnaire de zone industrielle
  | 'recruitment'               // Cabinet de recrutement
  | 'logistics'                 // Opérateur logistique
  | 'distributor'               // Distributeur local
  | 'supplier'                  // Fournisseur industriel
  | 'it_provider'               // Prestataire IT / intégration
  | 'other'

type Expert = {
  id: string; userId: string
  name: string; title: string; photoKey?: string
  specializations: InvestmentSector[]
  languages: string[]
  hourlyRateMAD: number         // plain number, not Money type (not in centimes for display)
  hourlyRateEUR?: number        // for international display
  bio: string; biofr?: string; bioAr?: string
  linkedinUrl?: string
  availableSlots: ExpertSlot[]
  avgRating: number; sessionCount: number
  verified: boolean
  createdAt: Date
}

type ExpertSlot = {
  id: string; expertId: string
  startTime: Date; endTime: Date
  durationMinutes: 30 | 60
  booked: boolean; bookedByUserId?: string
  createdAt: Date
}

type ExpertBooking = {
  id: string; slotId: string
  investorId: string; expertId: string
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  meetingUrl?: string           // video call link
  invoiceKey?: string           // R2 private invoice PDF
  confirmedAt: Date
}

type IntroductionRequest = {
  id: string; investorId: string; partnerId: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  adminNote?: string
  createdAt: Date; updatedAt: Date
}

type AIChatMessage = {
  id: string; investorId?: string; sessionId: string
  role: 'user' | 'assistant'
  content: string
  tokensUsed?: number
  createdAt: Date
}
```

---

## §7 — Roles & Permissions

| Capability | investor | consultant | expert | partner | admin |
|---|---|---|---|---|---|
| Use AI advisor (limited) | ✅ (anon) | ✅ | ✅ | — | ✅ |
| Use AI advisor (full/saved) | ✅ (logged in) | ✅ | ✅ | — | ✅ |
| Run incentives calculator | ✅ (anon) | ✅ | ✅ | — | ✅ |
| Save wizard progress | ✅ | ✅ | — | — | ✅ |
| Browse partners | ✅ | ✅ | — | ✅ | ✅ |
| Request partner intro | ✅ | ✅ | — | — | ✅ |
| Book expert | ✅ | ✅ | — | — | ✅ |
| Edit own expert profile | — | — | ✅ | — | — |
| Edit own partner profile | — | — | — | ✅ | — |
| View AI advisor analytics | — | — | — | — | ✅ |
| Manage incentive rules | — | — | — | — | ✅ |
| Verify partners | — | — | — | — | ✅ |
| Manage expert slots | — | — | ✅ | — | — |
| View platform KPIs | — | — | — | — | ✅ |

---

## §8 — Seed / Demo Data

- 6 expert profiles (2 investment lawyers, 1 tax advisor, 1 real estate specialist, 1 AMDIE ex-official, 1 sector specialist automotive)
- 12 partner profiles (3 law firms, 2 tax advisors, 2 real estate firms, 2 recruiters, 2 distributors, 1 logistics)
- 5 investor profiles (German automotive, French BPO, UAE real estate, US renewables, Spanish tourism)
- 5 saved incentive calculations (one per investor profile)
- CRI data: 12 regions with industrial zones, key contacts, sector specializations
- Investment sector guides: 5 sectors with data, incentives summary, key players
- Demo: hans.schmidt@demo.istiqtab.ma / demo1234 (German automotive investor, manufacturing, 100–500M MAD)

---

## §9 — Design Identity

- **Aesthetic**: Premium, international B2B. Dark navy + gold accents + clean white.
  Think Deloitte Morocco / McKinsey meets a modern SaaS. Serious money flows through here.
- **Colors**: Deep navy primary (#1A2744) — trust, gravitas, finance.
  Gold accent (#C9A84C) — Morocco's symbolic color, premium, investment.
  White surfaces, very light gray data areas.
- **Typography**: "Libre Baskerville" for headings (editorial, authoritative, international).
  "Inter" for body and data. "Noto Kufi Arabic" for AR.
- **Language toggle**: EN / FR / AR prominently in nav — the first signal that this is
  built for international users, not domestic-only.
- **Data credibility signals**: every statistic has a source label. Every incentive has
  a Charter article reference. Every expert has their bar number or CNSS registration.
- **No consumer-app vibes**: this is a tool for CFOs and legal counsels — not a colorful startup.

---

## §10 — UX Principles

1. **First 30 seconds sell Morocco** — landing page is a confident country case (FDI numbers, key sectors, top incentive headlines)
2. **The calculator is the hook** — anonymous users can run the incentive calculator before creating an account
3. **AI advisor is the retention layer** — once investors start chatting, they're engaged
4. **Wizard progress creates commitment** — every completed step = sunk cost = retention
5. **Expert booking is the monetization** — free tools lead to paid expert sessions
6. **Trust signals everywhere** — Charter article citations, CRI official contacts, expert credentials
7. **English first, then FR, then AR** — international investors land in English
8. **Mobile-friendly** (not mobile-first) — decision-makers use desktop; site visit use mobile

---

## §11 — Legal & Financial Integrity

1. **Not financial advice**: Istiqtab is an information tool. Every incentive output carries:
   "This is indicative only based on published Charter data. For binding advice, consult your CRI or a qualified advisor."
2. **Not a licensed investment intermediary**: Istiqtab facilitates introductions but does not arrange investments or financial products.
3. **Investor documents are private PII**: passport copies, financial statements — private R2, investor + admin only, access audit-logged.
4. **CNDP compliance**: investor PII encrypted at rest, deletion on request.
5. **Expert invoicing**: expert issues invoice to investor directly; Istiqtab collects 15% commission (v0.2 — no payment processing in v0.1).
6. **AI advisor disclaimer**: responses are informational, not legal advice. Cited sources must be publicly available.

---

## §12 — Definition of Done (v0.1 — 20 items)

- [ ] Auth: signup/login (email + Google + LinkedIn); email verification; role-based session
- [ ] Investor profile: sector, activity, bracket, region preferences, wizard steps
- [ ] Setup wizard: personalized checklist generated from profile; step-by-step with official links + document vault
- [ ] Incentives calculator: rule-based computation for Investment Charter 2022; all 11 incentive types
- [ ] Incentives comparison: side-by-side 3-region comparison for same project
- [ ] Incentives PDF export (with disclaimer)
- [ ] Partner directory: browse + filter (type / sector / region / language)
- [ ] Partner introduction request flow (investor → admin mediates → partner notified)
- [ ] Expert directory: browse by specialization + language + rate
- [ ] Expert slot booking: book a session; confirmation email; calendar link
- [ ] AI advisor: Claude API chat with investor profile context; conversation history saved
- [ ] Intelligence Hub: 10 sector guides + 12 CRI profiles (static/semi-static content)
- [ ] Public incentives calculator (anonymous, no account required)
- [ ] Language toggle: EN / FR / AR with complete translations
- [ ] Admin dashboard: wizard completions, AI usage, expert bookings, partner requests, KPIs
- [ ] Investor document vault (private R2 + access audit log)
- [ ] Email: wizard step reminders, booking confirmation, partner intro status
- [ ] EN + FR + AR translations; RTL correct
- [ ] `pnpm build` 0 errors; `pnpm test` green; `pnpm lint` clean; demo seed loads
- [ ] Deploy: Vercel + managed Postgres OR `docker compose up -d`

---

## §13 — Sprint Roadmap

| Sprint | Goal |
|---|---|
| **Sprint 0** | Scaffold + Auth (email + Google + LinkedIn) + RBAC + RLS + Docker |
| **Sprint 1** | Data model + Investor & Partner profiles + Expert profiles + demo seed |
| **Sprint 2** | Setup wizard (personalized checklist generator + progress tracker + document vault) |
| **Sprint 3** | Incentives calculator (rule engine + comparison + PDF export) |
| **Sprint 4** | Partner directory + introduction request flow |
| **Sprint 5** | Expert booking system + AI advisor (Claude API) |
| **Sprint 6** | Intelligence Hub (sector guides + CRI profiles) + notifications + email |
| **Sprint 7** | Admin dashboard + i18n EN/FR/AR + RTL + security + deploy → v0.1 ship |

---

## §14 — Repository Structure

```
istiqtab/
├── CLAUDE.md
├── .claude/
├── apps/
│   └── web/
│       └── src/app/
│           ├── [locale]/(public)/     ← Landing + Intel Hub + Calculator (no auth)
│           ├── [locale]/(investor)/   ← Wizard + saved calculator + partner/expert search
│           ├── [locale]/(expert)/     ← Expert dashboard
│           ├── [locale]/(partner)/    ← Partner dashboard
│           └── [locale]/(admin)/      ← Admin dashboard
└── packages/
    ├── core/        ← Role, RBAC, Zod schemas (no Money type — no transactions)
    ├── db/          ← Drizzle schema, migrations, RLS
    ├── wizard/      ← Checklist generator, step logic per sector/form/region
    ├── incentives/  ← Rule engine for Investment Charter 2022 incentive computation
    ├── partners/    ← Partner matching, introduction request logic
    ├── ai/          ← Claude API adapter, context injection, token tracking
    └── notifications/ ← In-app + Resend email
```

---

## §15 — Auth & Access Model

- **Auth.js v5**: email+Argon2id + Google OAuth + LinkedIn OAuth (B2B context)
- Session: `{ userId, role }` — role server-side only
- Five roles: investor / consultant / expert / partner / admin
- `withRole(session, allowedRoles, handler)` factory
- Investor documents: private R2; signed URLs (15-min); investor + admin only; access audited
- AI chat: stored per user; never included in logs or analytics in identifiable form
- Admin provisioned via seed or direct DB only
