---
name: content-editor
description: EN/FR/AR investment terminology, legal disclaimers. Trigger on: "translation", "i18n", "copy", "label".
---
# Content Editor — Istiqtab

## Voice
- **English primary**: clear, confident, expert. "Set up in Morocco" not "Invest in Morocco" (action-oriented)
- **No jargon without explanation**: "ICE (Identifiant Commun de l'Entreprise — your Moroccan tax ID)"
- **Legal disclaimers are mandatory**: every incentive output, every AI response

## Key strings (en.json)
```json
{
  "nav": { "calculator": "Incentives Calculator", "wizard": "Setup Wizard",
    "partners": "Find Partners", "experts": "Book an Expert",
    "hub": "Morocco Intel Hub", "dashboard": "My Dashboard" },
  "sector": {
    "automotive": "Automotive & Equipment", "aerospace": "Aerospace",
    "renewables": "Renewable Energy", "bpo_ites": "BPO / IT Services",
    "pharma": "Pharmaceuticals", "agrifood": "Agri-food", "tourism": "Tourism & Hotels",
    "real_estate": "Real Estate", "finance": "Financial Services",
    "logistics": "Logistics & Transport", "tech": "Tech & Digital",
    "textile": "Textile & Apparel"
  },
  "incentive": {
    "types": {
      "is_exemption": "Corporate Tax (IS) Exemption",
      "is_reduced_rate": "Reduced IS Rate",
      "tva_exemption": "VAT Exemption on Equipment",
      "customs_exemption": "Customs Duty Exemption",
      "land_subsidy": "Land Price Subsidy",
      "employment_premium": "Employment Premium",
      "training_subsidy": "Training Support (OFPPT)",
      "energy_benefit": "Renewable Energy Benefits",
      "export_support": "AMDIE Export Support",
      "sez_benefit": "Special Economic Zone Benefits",
      "r_and_d_credit": "R&D Tax Credit"
    },
    "confidence": {
      "confirmed": "Confirmed ✓", "indicative": "Indicative ⚡", "requires_verification": "Verify with CRI !"
    },
    "disclaimer": "Based on publicly available Investment Charter 2022 data. This is indicative only. Verify with your CRI or a qualified advisor for binding confirmation."
  },
  "wizard": {
    "steps": { "rc": "Registre de Commerce", "ice": "ICE Registration (DGI)",
      "cnss": "CNSS Registration", "bank": "Business Bank Account",
      "sector_license": "Sector-Specific License", "work_permit": "Work Permits" },
    "status": { "pending": "To do", "in_progress": "In progress",
      "completed": "Completed ✓", "blocked": "Blocked — action needed" }
  },
  "region": {
    "tanger_tetouan": "Tanger-Tétouan-Al Hoceima",
    "casablanca_settat": "Casablanca-Settat",
    "rabat_sale": "Rabat-Salé-Kénitra",
    "fes_meknes": "Fès-Meknès",
    "marrakech_safi": "Marrakech-Safi",
    "souss_massa": "Souss-Massa",
    "oriental": "Oriental"
  },
  "ai": {
    "placeholder": "Ask anything about investing in Morocco...",
    "disclaimer": "AI responses are informational only, not legal or financial advice.",
    "rateLimitWarning": "You've used {n}/20 questions today."
  },
  "legal": {
    "notFinancialAdvice": "Not financial advice. For binding guidance, consult a licensed advisor or your CRI.",
    "sourceInvestmentCharter": "Source: Morocco Investment Charter 2022",
    "criVerification": "Verify with your regional CRI for final confirmation."
  }
}
```

## Legal Disclaimer Rules
1. Incentive outputs MUST include `incentive.disclaimer` (verbatim, every export)
2. AI chat responses MUST include `ai.disclaimer` in the chat UI header
3. Calculator results page: disclaimer in footer + on every PDF page
4. Expert profiles: "Not legal advice — this is an independent expert"
