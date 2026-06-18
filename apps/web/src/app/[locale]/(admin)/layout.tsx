import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const NAV_ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/wizard", label: "Wizard Analytics" },
  { href: "/admin/ai", label: "AI Advisor Usage" },
  { href: "/admin/bookings", label: "Expert Bookings" },
  { href: "/admin/introductions", label: "Introductions" },
] as const;

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/auth/sign-in`);
  }
  if (session.user.role !== "admin") {
    redirect(`/${locale}`);
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* ── Sidebar ── */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Admin
            </p>
            <nav className="flex flex-col gap-0.5">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  locale={locale as "en" | "fr" | "ar"}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-[var(--color-navy)] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
