import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Auth.js entrypoint so withRole can be tested without a DB/session.
const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: () => authMock() }));

import { withRole } from "../with-role";

describe("withRole — role isolation", () => {
  beforeEach(() => authMock.mockReset());

  it("throws UNAUTHENTICATED when there is no session", async () => {
    authMock.mockResolvedValue(null);
    const action = withRole(["investor"], async () => "ok");
    await expect(action()).rejects.toThrow("UNAUTHENTICATED");
  });

  it("throws UNAUTHENTICATED when the session has no user id", async () => {
    authMock.mockResolvedValue({ user: { role: "investor" } });
    const action = withRole(["investor"], async () => "ok");
    await expect(action()).rejects.toThrow("UNAUTHENTICATED");
  });

  it("throws FORBIDDEN when the role is not allowed", async () => {
    authMock.mockResolvedValue({ user: { id: "u1", role: "partner", email: "p@x.co" } });
    const action = withRole(["investor", "admin"], async () => "ok");
    await expect(action()).rejects.toThrow("FORBIDDEN");
  });

  it("invokes the handler with the session when the role is allowed", async () => {
    const session = { user: { id: "u1", role: "investor", email: "i@x.co" } };
    authMock.mockResolvedValue(session);
    const handler = vi.fn(async (_s: unknown, n: number) => n * 2);
    const action = withRole(["investor"], handler);

    await expect(action(21)).resolves.toBe(42);
    expect(handler).toHaveBeenCalledWith(session, 21);
  });
});
