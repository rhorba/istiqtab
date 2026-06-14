---
name: incentives-engine
description: Investment Charter rule engine, computation, PDF export. Trigger on: "incentive", "Charter", "IS", "TVA", "tax", "subsidy", "prime", "zone franche", "CRI".
---
# Incentives Engine — Istiqtab

## Role
Own `packages/incentives`. This is the intelligence that no website or consultant
offers in a usable, comparable, exportable form. Rules are stored in DB (not code)
so admin can update them without a deploy when the Charter changes.

## Rule Storage (DB-driven, not hardcoded)
```typescript
// incentive_rules table in DB:
// { id, type, label_en, label_fr, label_ar,
//   condition_json, value_template, source_article,
//   confidence, active, updated_at }

// Example rule:
{
  type: 'is_exemption',
  label_en: 'Corporate tax exemption',
  condition_json: {
    sectors: ['automotive', 'aerospace', 'renewables', 'pharma'],
    activityTypes: ['manufacturing', 'r_and_d'],
    bracketMin: '5m_to_25m'
  },
  value_template: '5-year IS exemption (Investment Charter 2022, Art. 7)',
  source_article: 'Charter 2022, Art. 7',
  confidence: 'confirmed'
}
```

## Computation Engine
```typescript
// packages/incentives/src/engine.ts
export async function computeIncentives(
  db: DB,
  profile: IncentiveInput
): Promise<IncentiveResult> {
  const rules = await db.select().from(incentiveRules).where(eq(incentiveRules.active, true))
  const applied: AppliedIncentive[] = []

  for (const rule of rules) {
    if (matchesCondition(profile, rule.conditionJson)) {
      applied.push({
        type: rule.type,
        label: rule.labelEn,   // or fr/ar based on user language
        value: interpolateTemplate(rule.valueTemplate, profile),
        condition: describeCondition(rule.conditionJson),
        sourceArticle: rule.sourceArticle,
        confidence: rule.confidence,
      })
    }
  }

  return {
    sector: profile.sector,
    region: profile.region,
    investmentBracket: profile.bracket,
    activityType: profile.activityType,
    jobsToCreate: profile.jobsToCreate,
    applicableIncentives: applied,
    computedAt: new Date(),
  }
}
```

## Comparison Mode
```typescript
// Compare 3 regions for the same investment profile
export async function compareRegions(
  db: DB,
  profile: IncentiveInput,
  regions: MoroccanRegion[]   // max 3
): Promise<RegionComparison[]> {
  return Promise.all(regions.map(r => computeIncentives(db, { ...profile, region: r })))
}
```

## PDF Report Export
```typescript
// packages/incentives/src/report.ts
// @react-pdf/renderer
// Template: investor profile → applicable incentives table →
// regional comparison if applicable → MANDATORY disclaimer page
// Disclaimer: "Based on publicly available data from the Investment Charter 2022
// and AMDIE documentation. For binding information, contact your CRI."
```

## Checklist
- [ ] Rules in DB table (updatable by admin without deploy)
- [ ] All 11 incentive types implemented
- [ ] Regional variations modeled (SEZ benefits only for specific regions)
- [ ] Comparison mode: 3 regions max side-by-side
- [ ] PDF includes mandatory disclaimer on every page
- [ ] Tests: known profile → expected incentives (golden file test)

## Handoff Points
- **← DBA**: incentive_rules table
- **← Tech Lead**: condition_json schema definition
- **→ Frontend Dev**: calculator UI + comparison display
- **→ Test Architect**: edge cases (unknown sector, missing jobs target, SEZ eligibility)
