import {
  ACTIVITY_LABELS,
  BRACKET_LABELS,
  INCENTIVE_TYPE_LABELS,
  REGION_LABELS,
  SECTOR_LABELS,
  label,
} from "@istiqtab/core";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { ComputedIncentives } from "./engine.js";
import { DISCLAIMER } from "./engine.js";

// ─────────────────────────────────────────────────────────────────────────────
// Incentives PDF report (@react-pdf/renderer). EN-primary, navy/gold branding.
// The mandatory not-financial-advice disclaimer (§11, #1) is fixed to EVERY page.
// ─────────────────────────────────────────────────────────────────────────────

const NAVY = "#1A2744";
const GOLD = "#C9A84C";
const GRAY = "#6B7280";
const BORDER = "#E2E6EF";

const CONFIDENCE_LABEL: Record<
  ComputedIncentives["applicableIncentives"][number]["confidence"],
  string
> = {
  confirmed: "Confirmed",
  indicative: "Indicative",
  requires_verification: "Verify with CRI",
};

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingHorizontal: 40, paddingBottom: 72, fontSize: 10, color: NAVY },
  brand: { fontSize: 9, letterSpacing: 2, color: GOLD, textTransform: "uppercase" },
  title: { fontSize: 20, marginTop: 6, marginBottom: 2 },
  subtitle: { fontSize: 10, color: GRAY, marginBottom: 18 },
  sectionTitle: { fontSize: 12, marginBottom: 8, color: NAVY },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  summaryCell: { width: "50%", marginBottom: 8 },
  summaryLabel: { fontSize: 8, color: GRAY, textTransform: "uppercase", letterSpacing: 1 },
  summaryValue: { fontSize: 11, marginTop: 2 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 8,
  },
  headRow: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 6,
  },
  colIncentive: { width: "34%", paddingRight: 8 },
  colValue: { width: "34%", paddingRight: 8 },
  colSource: { width: "20%", paddingRight: 8 },
  colConf: { width: "12%" },
  th: { fontSize: 8, color: GRAY, textTransform: "uppercase", letterSpacing: 1 },
  incentiveName: { fontSize: 10 },
  small: { fontSize: 9, color: GRAY },
  empty: { fontSize: 10, color: GRAY, marginTop: 12 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  disclaimer: { fontSize: 7.5, color: GRAY, lineHeight: 1.4 },
});

export type IncentivesReportInput = {
  result: ComputedIncentives;
  companyName?: string;
};

function Summary({ result, companyName }: IncentivesReportInput) {
  const cells: [string, string][] = [
    ["Company", companyName ?? "—"],
    ["Sector", label(SECTOR_LABELS, result.sector, "en")],
    ["Region", label(REGION_LABELS, result.region, "en")],
    ["Activity", label(ACTIVITY_LABELS, result.activityType, "en")],
    ["Investment size", label(BRACKET_LABELS, result.investmentBracket, "en")],
    ["Jobs to create", String(result.jobsToCreate)],
  ];
  return (
    <View style={styles.summaryGrid}>
      {cells.map(([k, v]) => (
        <View key={k} style={styles.summaryCell}>
          <Text style={styles.summaryLabel}>{k}</Text>
          <Text style={styles.summaryValue}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

function ReportDocument({ result, companyName }: IncentivesReportInput) {
  const incentives = result.applicableIncentives;
  return (
    <Document title="Istiqtab — Investment Incentives Estimate">
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>Istiqtab · استقطاب</Text>
        <Text style={styles.title}>Investment Incentives Estimate</Text>
        <Text style={styles.subtitle}>
          Investment Charter 2022 · Generated {result.computedAt.toISOString().slice(0, 10)}
        </Text>

        <Text style={styles.sectionTitle}>Project profile</Text>
        <Summary result={result} companyName={companyName} />

        <Text style={styles.sectionTitle}>Applicable incentives ({incentives.length})</Text>

        {incentives.length === 0 ? (
          <Text style={styles.empty}>
            No incentives matched this profile in the published Charter data. Contact your CRI to
            explore project-specific support.
          </Text>
        ) : (
          <View>
            <View style={styles.headRow}>
              <Text style={[styles.th, styles.colIncentive]}>Incentive</Text>
              <Text style={[styles.th, styles.colValue]}>Indicative benefit</Text>
              <Text style={[styles.th, styles.colSource]}>Source</Text>
              <Text style={[styles.th, styles.colConf]}>Status</Text>
            </View>
            {incentives.map((inc, i) => (
              <View key={`${inc.type}-${i}`} style={styles.row} wrap={false}>
                <View style={styles.colIncentive}>
                  <Text style={styles.incentiveName}>
                    {label(INCENTIVE_TYPE_LABELS, inc.type, "en")}
                  </Text>
                  <Text style={styles.small}>{inc.condition}</Text>
                </View>
                <Text style={[styles.colValue, styles.incentiveName]}>{inc.value}</Text>
                <Text style={[styles.colSource, styles.small]}>{inc.sourceArticle ?? "—"}</Text>
                <Text style={[styles.colConf, styles.small]}>
                  {CONFIDENCE_LABEL[inc.confidence]}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Fixed on every page. */}
        <View style={styles.footer} fixed>
          <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
        </View>
      </Page>
    </Document>
  );
}

/** Render the incentives estimate to a PDF Buffer (server-side only). */
export function renderIncentivesReport(input: IncentivesReportInput): Promise<Buffer> {
  return renderToBuffer(<ReportDocument {...input} />);
}
