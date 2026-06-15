"use server";

import { randomUUID } from "node:crypto";
import type { FormState } from "@/lib/action-state";
import { deletePrivateObject, getPrivateDownloadUrl, putPrivateObject } from "@/lib/r2";
import { withRole } from "@/lib/with-role";
import {
  accessAuditLogs,
  db,
  investorDocuments,
  investorProfiles,
  withUserContext,
} from "@istiqtab/db";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Investor document vault — Category A PII (CLAUDE.md §11).
// Private R2, server-side upload (keys never client-controlled), 15-min signed
// download URLs, investor+admin only (enforced by RLS via withUserContext), and
// every upload/download/delete written to access_audit_logs.
// ─────────────────────────────────────────────────────────────────────────────

const DOC_TYPES = [
  "passport",
  "company_reg",
  "financial_statement",
  "project_memo",
  "other",
] as const;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set(["application/pdf", "image/jpeg", "image/png"]);
const MIME_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const UploadSchema = z.object({ type: z.enum(DOC_TYPES) });

async function clientIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
}

/** Upload a private investor document. Owner-scoped; audit-logged. */
export const uploadDocument = withRole(
  ["investor", "consultant", "admin"],
  async (session, _prev: FormState, formData: FormData): Promise<FormState> => {
    const parsed = UploadSchema.safeParse({ type: formData.get("type") });
    if (!parsed.success) return { ok: false, error: "Select a valid document type." };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Choose a file to upload." };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, error: "File exceeds the 10 MB limit." };
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return { ok: false, error: "Only PDF, JPEG, or PNG files are allowed." };
    }

    const userId = session.user.id;
    const role = session.user.role;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = MIME_EXT[file.type] ?? "bin";
    const ip = await clientIp();

    const result = await withUserContext(db, userId, role, async (tx) => {
      const [profile] = await tx
        .select({ id: investorProfiles.id })
        .from(investorProfiles)
        .where(eq(investorProfiles.userId, userId))
        .limit(1);
      if (!profile) return "no_profile" as const;

      // Key is server-derived and namespaced by owner — never trust client input.
      const fileKey = `investors/${profile.id}/${parsed.data.type}/${randomUUID()}.${ext}`;
      await putPrivateObject(fileKey, bytes, file.type);

      const [doc] = await tx
        .insert(investorDocuments)
        .values({ investorId: profile.id, userId, type: parsed.data.type, fileKey })
        .returning({ id: investorDocuments.id });
      if (!doc) return "no_profile" as const;

      await tx.insert(accessAuditLogs).values({ userId, documentId: doc.id, action: "upload", ip });

      return "ok" as const;
    });

    if (result === "no_profile") return { ok: false, error: "Complete your profile first." };

    revalidatePath("/[locale]/investor/documents", "page");
    return { ok: true };
  },
);

const IdSchema = z.string().uuid();

/**
 * Issue a 15-minute signed download URL for one document. RLS guarantees the
 * row is only visible to its owner (or an admin) — a different investor gets
 * "not found", the application-layer 403. The access is audit-logged.
 */
export const getDocumentUrl = withRole(
  ["investor", "consultant", "admin"],
  async (
    session,
    documentId: string,
  ): Promise<{ ok: true; url: string } | { ok: false; error: string }> => {
    if (!IdSchema.safeParse(documentId).success) return { ok: false, error: "Invalid document." };

    const userId = session.user.id;
    const role = session.user.role;
    const ip = await clientIp();

    return withUserContext(db, userId, role, async (tx) => {
      const [doc] = await tx
        .select({ fileKey: investorDocuments.fileKey })
        .from(investorDocuments)
        .where(eq(investorDocuments.id, documentId))
        .limit(1);
      if (!doc) return { ok: false as const, error: "Document not found." };

      const url = await getPrivateDownloadUrl(doc.fileKey);
      await tx.insert(accessAuditLogs).values({ userId, documentId, action: "download", ip });

      return { ok: true as const, url };
    });
  },
);

/** Delete a document (R2 object + row). Owner-scoped by RLS; audit-logged. */
export const deleteDocument = withRole(
  ["investor", "consultant", "admin"],
  async (session, documentId: string): Promise<FormState> => {
    if (!IdSchema.safeParse(documentId).success) {
      return { ok: false, error: "Invalid document." };
    }

    const userId = session.user.id;
    const role = session.user.role;
    const ip = await clientIp();

    const result = await withUserContext(db, userId, role, async (tx) => {
      const [doc] = await tx
        .select({ fileKey: investorDocuments.fileKey })
        .from(investorDocuments)
        .where(and(eq(investorDocuments.id, documentId), eq(investorDocuments.userId, userId)))
        .limit(1);
      if (!doc) return "not_found" as const;

      await deletePrivateObject(doc.fileKey);
      await tx.delete(investorDocuments).where(eq(investorDocuments.id, documentId));
      await tx.insert(accessAuditLogs).values({ userId, documentId, action: "delete", ip });
      return "ok" as const;
    });

    if (result === "not_found") return { ok: false, error: "Document not found." };

    revalidatePath("/[locale]/investor/documents", "page");
    return { ok: true };
  },
);
