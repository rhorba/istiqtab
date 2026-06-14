"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOutAction } from "@/lib/auth-actions";
import { LogOut, Settings, User } from "lucide-react";
import type { Role } from "@istiqtab/core";

type Props = {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  role: Role;
  locale: string;
};

const ROLE_LABELS: Record<Role, string> = {
  investor: "Investor",
  consultant: "Consultant",
  expert: "Expert",
  partner: "Partner",
  admin: "Admin",
};

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function UserMenu({ name, email, image, role, locale }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg p-1 hover:bg-[var(--color-surface-muted)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <span className="hidden lg:block text-sm font-medium text-[var(--color-navy)] max-w-[120px] truncate">
            {name ?? email}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium text-[var(--color-navy)] truncate">{name ?? "Account"}</p>
          <p className="text-xs text-gray-400 font-normal truncate">{email}</p>
          <p className="text-xs text-[var(--color-gold)] font-medium mt-0.5">
            {ROLE_LABELS[role]}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href={`/${locale}/${role}/profile`} className="cursor-pointer">
            <User className="h-4 w-4" />
            My Profile
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href={`/${locale}/${role}/settings`} className="cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </a>
        </DropdownMenuItem>

        {role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={`/${locale}/admin`} className="cursor-pointer">
                Admin Dashboard
              </a>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
