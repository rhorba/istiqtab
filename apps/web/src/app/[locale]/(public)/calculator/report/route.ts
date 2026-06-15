import { IncentivesInputSchema } from "@istiqtab/core";
import { db, incentiveRules } from "@istiqtab/db";
import { computeIncentives } from "@istiqtab/incentives";
import { renderIncentivesReport } from "@istiqtab/incentives/report";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

// @react-pdf/renderer needs the Node runtime (Buffer, fontkit) — not the edge.
export const runtime = "nodejs";

// ─────────────────────────────────────────────────────────────────────────────
// POST /[locale]/calculator/report
// Recomputes the incentives estimate from the submitted profile and streams back
// a branded PDF (DoD: "Incentives PDF export"). Public — anonymous investors can
// download a board-ready report. Recomputing here (rather than trusting a posted
// result) keeps the PDF authoritative against the live Charter rule set.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const parsed = IncentivesInputSchema.safeParse({
    sector: form.get("sector"),
    activityType: form.get("activityType"),
    investmentBracket: form.get("investmentBracket"),
    region: form.get("region"),
    jobsToCreate: form.get("jobsToCreate") ? Number(form.get("jobsToCreate")) : 0,
  });
  if (!parsed.success) {
    return new Response("Invalid project profile.", { status: 400 });
  }

  const rules = await db.select().from(incentiveRules).where(eq(incentiveRules.active, true));
  const result = computeIncentives(
    {
      sector: parsed.data.sector,
      region: parsed.data.region,
      activityType: parsed.data.activityType,
      investmentBracket: parsed.data.investmentBracket,
      jobsToCreate: parsed.data.jobsToCreate,
    },
    rules,
  );

  const companyName = (form.get("companyName") as string | null)?.trim() || undefined;
  const pdf = await renderIncentivesReport({ result, companyName });

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="istiqtab-incentives-estimate.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
