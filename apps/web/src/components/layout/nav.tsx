import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./language-toggle";
import { UserMenu } from "./user-menu";
import type { Role } from "@istiqtab/core";

// ─── Role-based nav links ──────────────────────────────────────────────────

type NavLink = { href: string; label: string };

function getNavLinks(role: Role | null, locale: string): NavLink[] {
  const base = `/${locale}`;

  if (!role) {
    return [
      { href: `${base}/calculator`, label: "Incentives Calculator" },
      { href: `${base}/hub`, label: "Investment Hub" },
    ];
  }

  switch (role) {
    case "investor":
    case "consultant":
      return [
        { href: `${base}/investor/wizard`, label: "Setup Wizard" },
        { href: `${base}/calculator`, label: "Calculator" },
        { href: `${base}/investor/partners`, label: "Find Partners" },
        { href: `${base}/investor/experts`, label: "Book Expert" },
        { href: `${base}/investor/advisor`, label: "Ask Istiqtab" },
      ];
    case "expert":
      return [
        { href: `${base}/expert/sessions`, label: "My Sessions" },
        { href: `${base}/expert/dashboard`, label: "Dashboard" },
      ];
    case "partner":
      return [
        { href: `${base}/partner/profile`, label: "My Profile" },
        { href: `${base}/partner/dashboard`, label: "Dashboard" },
      ];
    case "admin":
      return [
        { href: `${base}/admin`, label: "Admin" },
        { href: `${base}/calculator`, label: "Calculator" },
      ];
  }
}

// ─── Server component ──────────────────────────────────────────────────────

type Props = { locale: string };

export async function Nav({ locale }: Props) {
  const session = await auth();
  const user = session?.user;
  const role = (user?.role as Role | undefined) ?? null;
  const navLinks = getNavLinks(role, locale);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          locale={locale as "en" | "fr" | "ar"}
          className="flex items-center gap-2.5 shrink-0"
          aria-label="Istiqtab home"
        >
          <span className="text-xl font-bold text-[var(--color-navy)] font-serif leading-none">
            استقطاب
          </span>
          <span className="hidden sm:block h-5 w-px bg-[var(--color-border)]" />
          <span className="hidden sm:block text-xs font-semibold tracking-widest text-[var(--color-gold)] uppercase">
            Istiqtab
          </span>
        </Link>

        {/* ── Desktop links ── */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[var(--color-navy)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageToggle />

          {user ? (
            <UserMenu
              name={user.name}
              email={user.email}
              image={user.image}
              role={role!}
              locale={locale}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/auth/sign-in`}>Sign In</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href={`/${locale}/auth/sign-up`}>Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
