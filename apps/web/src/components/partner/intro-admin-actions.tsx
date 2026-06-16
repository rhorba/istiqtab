"use client";

import { updateIntroductionStatus } from "@/app/[locale]/(admin)/admin/introductions/actions";
import { type IntroStatus, nextIntroStatuses } from "@istiqtab/partners";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  requestId: string;
  status: IntroStatus;
  labels: Record<IntroStatus, string>;
};

const STYLES: Partial<Record<IntroStatus, string>> = {
  accepted: "bg-blue-600 text-white hover:bg-blue-700",
  completed: "bg-green-600 text-white hover:bg-green-700",
  declined: "border border-[var(--color-border)] text-gray-600 hover:bg-gray-50",
};

export function IntroAdminActions({ requestId, status, labels }: Props) {
  const options = nextIntroStatuses(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (options.length === 0) return null;

  function move(next: IntroStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateIntroductionStatus(requestId, next);
      if (res.ok) router.refresh();
      else setError(res.error ?? "Failed to update.");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        {options.map((next) => (
          <button
            key={next}
            type="button"
            disabled={isPending}
            onClick={() => move(next)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 transition-colors ${STYLES[next] ?? ""}`}
          >
            {labels[next]}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
