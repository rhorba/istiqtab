import { auth } from "@/auth";
import type { Role } from "@istiqtab/core";
import type { Session } from "next-auth";

export type AuthedSession = Session & {
  user: { id: string; role: Role; email: string; name?: string | null };
};

/**
 * Server action / route handler factory.
 * Checks session and role before calling handler.
 * Throws "UNAUTHENTICATED" or "FORBIDDEN" as Error — caller decides how to surface.
 *
 * Usage:
 *   export const myAction = withRole(["investor", "admin"], async (session, formData) => { ... });
 */
export function withRole<TArgs extends unknown[], TReturn>(
  allowedRoles: Role[],
  handler: (session: AuthedSession, ...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs): Promise<TReturn> => {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("UNAUTHENTICATED");
    }

    if (!allowedRoles.includes(session.user.role as Role)) {
      throw new Error("FORBIDDEN");
    }

    return handler(session as AuthedSession, ...args);
  };
}
