import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Istiqtab — Set up in Morocco. Fast, clear, confident.",
};

// Sprint 6 builds the full landing page.
// Sprint 0 placeholder — confirms routing works.
export default function PublicHomePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-serif text-4xl font-bold text-[var(--color-navy)]">Set up in Morocco.</h1>
      <p className="mt-2 text-lg text-[var(--color-gold)] font-medium">Fast, clear, confident.</p>
      <p className="mt-4 max-w-md text-sm text-gray-500">
        Full landing page coming in Sprint 6. Auth, wizard, calculator, and partner matching are
        being built now.
      </p>
    </main>
  );
}
