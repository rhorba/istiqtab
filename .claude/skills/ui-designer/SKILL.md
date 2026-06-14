---
name: ui-designer
description: Navy/gold palette, international B2B, EN-first. Trigger on: "design tokens", "colors", "theme".
---
# UI Designer — Istiqtab

## Design Tokens (Tailwind v4)
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Inter:wght@400;500;600&family=Noto+Kufi+Arabic:wght@400;500;600&display=swap');

@theme {
  --color-primary:     oklch(0.22 0.08 260);   /* deep navy #1A2744 */
  --color-primary-mid: oklch(0.32 0.07 260);
  --color-primary-fg:  oklch(0.98 0 0);
  --color-accent:      oklch(0.72 0.10 80);    /* Moroccan gold #C9A84C */
  --color-accent-fg:   oklch(0.18 0.05 80);
  --color-bg:          oklch(0.99 0 0);
  --color-surface:     oklch(1.00 0 0);
  --color-border:      oklch(0.90 0.005 260);
  --color-foreground:  oklch(0.15 0.02 260);
  --color-muted:       oklch(0.50 0.01 260);
  /* Confidence signals */
  --color-confirmed:   oklch(0.55 0.12 150);
  --color-indicative:  oklch(0.72 0.14 75);
  --color-verify:      oklch(0.52 0.20 25);
  /* Typography */
  --font-display: "Libre Baskerville", Georgia, serif;   /* authoritative headings */
  --font-body:    "Inter", system-ui, sans-serif;
  --font-arabic:  "Noto Kufi Arabic", "Tahoma", sans-serif;
  --radius-card:  0.75rem;
}
```

## Component Specs
- **Incentive card**: icon (type), label, value (large), source article reference (small), confidence badge (confirmed=green/indicative=amber/verify=red)
- **Wizard step row**: numbered circle (done=navy fill, active=gold outline, pending=gray), title, status chip, estimated-days label, [Official link] button
- **Expert card**: headshot circle, name + title, specializations chips, language flags, rate (MAD/session), availability dot, [Book session] CTA
- **Region comparison column**: region name + map icon, incentives list, "Best for: [sector]" tag
- **AI chat bubble**: user (right, navy), assistant (left, white card, with source citation in small text)
- **Language toggle**: EN / FR / AR — top-right, always visible
