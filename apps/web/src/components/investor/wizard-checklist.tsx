"use client";

import {
  changeStepStatus,
  regenerateWizard,
} from "@/app/[locale]/(investor)/investor/wizard/actions";
import { Badge } from "@/components/ui/badge";
import type { Locale, WizardStep, WizardStepStatus } from "@istiqtab/core";
import {
  CheckCircle2,
  Circle,
  CircleDot,
  CircleSlash,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Progress = { completed: number; total: number; percent: number };

type Props = {
  locale: Locale;
  steps: WizardStep[];
  progress: Progress;
};

const STATUS_LABELS: Record<WizardStepStatus, { en: string; fr: string; ar: string }> = {
  pending: { en: "Not started", fr: "À faire", ar: "لم يبدأ" },
  in_progress: { en: "In progress", fr: "En cours", ar: "قيد التنفيذ" },
  completed: { en: "Completed", fr: "Terminé", ar: "منجز" },
  blocked: { en: "Blocked", fr: "Bloqué", ar: "محظور" },
  skipped: { en: "Skipped", fr: "Ignoré", ar: "تم تخطيه" },
};

const DOC_LABELS: Record<string, string> = {
  passport: "Passport",
  company_reg: "Company registration",
  financial_statement: "Financial statement",
  project_memo: "Project memo",
  other: "Other",
};

const SELECTABLE: WizardStepStatus[] = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
  "skipped",
];

function localizedTitle(step: WizardStep, locale: Locale): string {
  if (locale === "fr") return step.titleFr;
  if (locale === "ar") return step.titleAr;
  return step.title;
}

function StatusIcon({ status }: { status: WizardStepStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden />;
    case "in_progress":
      return <CircleDot className="h-5 w-5 text-[var(--color-gold-600)]" aria-hidden />;
    case "blocked":
      return <CircleSlash className="h-5 w-5 text-red-600" aria-hidden />;
    case "skipped":
      return <CircleSlash className="h-5 w-5 text-gray-300" aria-hidden />;
    default:
      return <Circle className="h-5 w-5 text-gray-300" aria-hidden />;
  }
}

export function WizardChecklist({ locale, steps, progress }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setStatus(stepId: string, status: WizardStepStatus) {
    startTransition(async () => {
      await changeStepStatus({ stepId, status });
      router.refresh();
    });
  }

  function onRegenerate() {
    startTransition(async () => {
      await regenerateWizard();
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--color-navy)]">
              {progress.completed} of {progress.total} steps completed
            </p>
            <p className="text-xs text-gray-500">{progress.percent}% of your setup is done</p>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-navy)] hover:bg-[var(--color-surface-subtle)] disabled:opacity-60 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} aria-hidden />
            Regenerate
          </button>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-subtle)]">
          <div
            className="h-full rounded-full bg-[var(--color-gold)] transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors ${
              step.status === "completed"
                ? "border-green-200"
                : step.status === "blocked"
                  ? "border-red-200"
                  : "border-[var(--color-border)]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex flex-col items-center">
                <StatusIcon status={step.status} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">Step {index + 1}</span>
                  {step.estimatedDays !== undefined && (
                    <Badge variant="default">~{step.estimatedDays} days</Badge>
                  )}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-[var(--color-navy)]">
                  {localizedTitle(step, locale)}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{step.description}</p>

                {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {step.requiredDocuments.map((doc) => (
                      <Badge key={doc} variant="gold">
                        {DOC_LABELS[doc] ?? doc}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {step.officialLink && (
                    <a
                      href={step.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-navy)] underline-offset-2 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      Official portal
                    </a>
                  )}
                  <label className="ms-auto flex items-center gap-2 text-xs text-gray-500">
                    <span>Status</span>
                    <select
                      value={step.status}
                      disabled={isPending}
                      onChange={(e) => setStatus(step.id, e.target.value as WizardStepStatus)}
                      className="rounded-md border border-[var(--color-border)] bg-white px-2 py-1 text-xs text-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] disabled:opacity-60"
                    >
                      {SELECTABLE.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s][locale]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="px-1 text-xs text-gray-400">
        Processing times are indicative. The CRI single window remains the authoritative source for
        your specific file.
      </p>
    </div>
  );
}
