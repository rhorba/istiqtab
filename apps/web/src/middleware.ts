import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";

// Edge-safe auth instance — reads JWT cookie only, no DB
const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATTERNS = [/^\/[a-z]{2}\/(investor|consultant|expert|partner|admin)(\/.*)?$/];

const ADMIN_ONLY = [/^\/[a-z]{2}\/admin(\/.*)?$/];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isProtected = PROTECTED_PATTERNS.some((p) => p.test(pathname));

  if (isProtected) {
    const session = await auth();

    if (!session?.user) {
      const locale = pathname.split("/")[1] ?? "en";
      const signInUrl = new URL(`/${locale}/auth/sign-in`, request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    const isAdminRoute = ADMIN_ONLY.some((p) => p.test(pathname));
    if (isAdminRoute && session.user.role !== "admin") {
      const locale = pathname.split("/")[1] ?? "en";
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
