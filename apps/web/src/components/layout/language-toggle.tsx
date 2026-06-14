"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
] as const;

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleSwitch(next: string) {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-[var(--color-border)] bg-white p-0.5"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => handleSwitch(code)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
            code === locale
              ? "bg-[var(--color-navy)] text-white"
              : "text-gray-500 hover:text-[var(--color-navy)]",
          )}
          aria-pressed={code === locale}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
