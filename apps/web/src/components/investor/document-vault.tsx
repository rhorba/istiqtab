"use client";

import {
  deleteDocument,
  getDocumentUrl,
  uploadDocument,
} from "@/app/[locale]/(investor)/investor/documents/actions";
import { Badge } from "@/components/ui/badge";
import type { FormState } from "@/lib/action-state";
import type { Locale } from "@istiqtab/core";
import { Download, FileText, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

type DocItem = { id: string; type: string; uploadedAt: string };

type Props = { locale: Locale; documents: DocItem[] };

const DOC_TYPES: { value: string; label: string }[] = [
  { value: "passport", label: "Passport" },
  { value: "company_reg", label: "Company registration" },
  { value: "financial_statement", label: "Financial statement" },
  { value: "project_memo", label: "Project memo" },
  { value: "other", label: "Other" },
];

const TYPE_LABEL = Object.fromEntries(DOC_TYPES.map((t) => [t.value, t.label]));

const initialState: FormState = {};

export function DocumentVault({ documents }: Props) {
  const router = useRouter();
  const [state, action, isUploading] = useActionState(uploadDocument, initialState);
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Refresh the server list after a successful upload.
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  function onDownload(id: string) {
    setBusyId(id);
    startTransition(async () => {
      const res = await getDocumentUrl(id);
      setBusyId(null);
      if (res.ok) window.open(res.url, "_blank", "noopener,noreferrer");
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this document permanently?")) return;
    setBusyId(id);
    startTransition(async () => {
      await deleteDocument(id);
      setBusyId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <form
        action={action}
        className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
      >
        {state.error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[var(--color-navy)]">Document type</span>
            <select
              name="type"
              required
              defaultValue="passport"
              className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[var(--color-navy)]">
              File (PDF, JPEG, PNG · ≤10 MB)
            </span>
            <input
              type="file"
              name="file"
              required
              accept="application/pdf,image/jpeg,image/png"
              className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-surface-subtle)] file:px-3 file:py-1.5 file:text-sm file:text-[var(--color-navy)]"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-navy-light)] disabled:opacity-60 transition-colors"
        >
          <UploadCloud className="h-4 w-4" aria-hidden />
          {isUploading ? "Uploading…" : "Upload document"}
        </button>
      </form>

      {/* List */}
      {documents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-gray-500">
          No documents yet. Upload your passport, company registration, or project memo to keep your
          setup file in one place.
        </p>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
            >
              <FileText className="h-5 w-5 shrink-0 text-[var(--color-navy)]" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[var(--color-navy)]">
                    {TYPE_LABEL[doc.type] ?? doc.type}
                  </span>
                  <Badge variant="default">{new Date(doc.uploadedAt).toLocaleDateString()}</Badge>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDownload(doc.id)}
                disabled={isPending && busyId === doc.id}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-navy)] hover:bg-[var(--color-surface-subtle)] disabled:opacity-60 transition-colors"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                Download
              </button>
              <button
                type="button"
                onClick={() => onDelete(doc.id)}
                disabled={isPending && busyId === doc.id}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
