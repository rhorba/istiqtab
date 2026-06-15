import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

// ─────────────────────────────────────────────────────────────────────────────
// Cloudflare R2 (S3-compatible) — server-only.
//
// Investor documents (passports, financial statements) are Category A PII
// (CLAUDE.md §11): they live ONLY in the PRIVATE bucket and are never served
// directly. Reads go through short-lived (15-min) presigned GET URLs, and every
// access is audit-logged by the calling server action.
// ─────────────────────────────────────────────────────────────────────────────

const SIGNED_URL_TTL_SECONDS = 15 * 60;

let client: S3Client | null = null;

function r2(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

/** Upload a private object (investor PII). Server-side only — keys are never client-controlled. */
export async function putPrivateObject(
  key: string,
  body: Uint8Array,
  contentType: string,
): Promise<void> {
  await r2().send(
    new PutObjectCommand({
      Bucket: env.R2_PRIVATE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

/** Generate a short-lived (15-min) presigned GET URL for a private object. */
export async function getPrivateDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(r2(), new GetObjectCommand({ Bucket: env.R2_PRIVATE_BUCKET, Key: key }), {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  });
}

/** Permanently delete a private object. */
export async function deletePrivateObject(key: string): Promise<void> {
  await r2().send(new DeleteObjectCommand({ Bucket: env.R2_PRIVATE_BUCKET, Key: key }));
}
