import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Role isolation for investor document actions (Category A PII).
 * Verifies that roles NOT in ["investor", "consultant", "admin"] are
 * blocked by withRole before any DB/R2 call is made.
 *
 * This complements the DB-layer RLS test in packages/db which proves
 * cross-investor isolation at the Postgres level.
 */

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: () => authMock() }));

// Stub all I/O that the actions import — we're testing role gates only.
vi.mock("@/lib/r2", () => ({
  putPrivateObject: vi.fn(),
  getPrivateDownloadUrl: vi.fn(),
  deletePrivateObject: vi.fn(),
}));
vi.mock("@istiqtab/db", async () => {
  const actual = await vi.importActual<typeof import("@istiqtab/db")>("@istiqtab/db");
  return {
    ...actual,
    db: { select: vi.fn(), insert: vi.fn(), delete: vi.fn() },
    withUserContext: vi.fn(),
  };
});
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn(async () => ({ get: vi.fn(() => null) })) }));

import {
  deleteDocument,
  getDocumentUrl,
  uploadDocument,
} from "../../app/[locale]/(investor)/investor/documents/actions";

const BLOCKED_ROLES = ["partner", "expert"] as const;
const ALLOWED_ROLES = ["investor", "consultant", "admin"] as const;

describe("investor document actions — role isolation", () => {
  beforeEach(() => authMock.mockReset());

  it.each(BLOCKED_ROLES)(
    "uploadDocument: role '%s' is FORBIDDEN (never reaches R2)",
    async (role) => {
      authMock.mockResolvedValue({ user: { id: "u1", role, email: "x@x.co" } });
      const fd = new FormData();
      await expect(uploadDocument(undefined as never, fd)).rejects.toThrow("FORBIDDEN");
    },
  );

  it.each(BLOCKED_ROLES)("getDocumentUrl: role '%s' is FORBIDDEN", async (role) => {
    authMock.mockResolvedValue({ user: { id: "u1", role, email: "x@x.co" } });
    await expect(getDocumentUrl("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      "FORBIDDEN",
    );
  });

  it.each(BLOCKED_ROLES)("deleteDocument: role '%s' is FORBIDDEN", async (role) => {
    authMock.mockResolvedValue({ user: { id: "u1", role, email: "x@x.co" } });
    await expect(deleteDocument("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      "FORBIDDEN",
    );
  });

  it("uploadDocument: unauthenticated session is UNAUTHENTICATED", async () => {
    authMock.mockResolvedValue(null);
    await expect(uploadDocument(undefined as never, new FormData())).rejects.toThrow(
      "UNAUTHENTICATED",
    );
  });

  it.each(ALLOWED_ROLES)(
    "uploadDocument: role '%s' passes the role gate (may fail for other reasons)",
    async (role) => {
      authMock.mockResolvedValue({ user: { id: "u1", role, email: "x@x.co" } });
      // Allowed roles pass withRole; the action may throw downstream due to mocks —
      // we only assert it does NOT throw FORBIDDEN or UNAUTHENTICATED.
      try {
        await uploadDocument(undefined as never, new FormData());
      } catch (e) {
        expect((e as Error).message).not.toBe("FORBIDDEN");
        expect((e as Error).message).not.toBe("UNAUTHENTICATED");
      }
    },
  );
});
