import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-surface-subtle)] text-[var(--color-navy)] border border-[var(--color-border)]",
        navy: "bg-[var(--color-navy)] text-white",
        gold: "bg-[var(--color-gold-100)] text-[var(--color-navy)] border border-[var(--color-gold)]",
        confirmed: "bg-green-50 text-green-700 border border-green-200",
        indicative: "bg-amber-50 text-amber-700 border border-amber-200",
        verify: "bg-red-50 text-red-700 border border-red-200",
        sector: "bg-blue-50 text-blue-700 border border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
