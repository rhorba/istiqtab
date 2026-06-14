import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth configuration — no DB imports, no argon2.
 * Used by middleware (edge runtime) and extended by auth.ts (Node.js).
 */
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/en/auth/sign-in",
    error: "/en/auth/error",
  },
  session: { strategy: "jwt" as const },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // role comes from the DB user record on first sign-in
        token.role = (user as { role?: string }).role ?? "investor";
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
