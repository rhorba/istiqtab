# decisions
## ADR-01: English primary locale
Foreign investors land in English. next-intl defaultLocale = 'en'. FR second, AR third.

## ADR-02: LinkedIn OAuth alongside Google
B2B investors use LinkedIn. Profile data (company, title) auto-filled on first login.

## ADR-03: Incentive rules in DB table (not hardcoded)
Charter changes → admin updates rules in DB, no code deploy needed.

## ADR-04: AI context injection per investor profile
Every Claude API call: sector + bracket + regions injected in system prompt.
Rate limit: 20 messages/user/day. Token cost tracked per message.

## ADR-05: Intelligence Hub is SSR + ISR
CRI pages and sector guides are server-rendered with 1-hour ISR cache.
Primary SEO acquisition: "invest in Morocco [sector] 2026" → Istiqtab in Google.

## ADR-06: No Money type — no transactions in v0.1
Expert sessions are agreed and paid externally. Istiqtab collects commission in v0.2.
Expert rates stored as plain integers (MAD + EUR), not centimes.
