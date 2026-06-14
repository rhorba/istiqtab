import type { Role } from "./types.js";

export const ROLES = {
  INVESTOR: "investor",
  CONSULTANT: "consultant",
  EXPERT: "expert",
  PARTNER: "partner",
  ADMIN: "admin",
} as const satisfies Record<string, Role>;

export const ALL_ROLES: Role[] = ["investor", "consultant", "expert", "partner", "admin"];

type Permission =
  | "ai_advisor:use_anonymous"
  | "ai_advisor:use_full"
  | "calculator:run"
  | "calculator:save"
  | "wizard:save"
  | "partners:browse"
  | "partners:request_intro"
  | "experts:browse"
  | "experts:book"
  | "expert_profile:edit_own"
  | "partner_profile:edit_own"
  | "admin:view_analytics"
  | "admin:manage_incentive_rules"
  | "admin:verify_partners"
  | "admin:view_kpis"
  | "expert_slots:manage"
  | "documents:upload"
  | "documents:view_own"
  | "admin:view_all_documents";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  investor: [
    "ai_advisor:use_anonymous",
    "ai_advisor:use_full",
    "calculator:run",
    "calculator:save",
    "wizard:save",
    "partners:browse",
    "partners:request_intro",
    "experts:browse",
    "experts:book",
    "documents:upload",
    "documents:view_own",
  ],
  consultant: [
    "ai_advisor:use_anonymous",
    "ai_advisor:use_full",
    "calculator:run",
    "calculator:save",
    "wizard:save",
    "partners:browse",
    "partners:request_intro",
    "experts:browse",
    "experts:book",
  ],
  expert: [
    "ai_advisor:use_anonymous",
    "ai_advisor:use_full",
    "calculator:run",
    "partners:browse",
    "experts:browse",
    "expert_profile:edit_own",
    "expert_slots:manage",
  ],
  partner: ["partners:browse", "partner_profile:edit_own"],
  admin: [
    "ai_advisor:use_anonymous",
    "ai_advisor:use_full",
    "calculator:run",
    "calculator:save",
    "wizard:save",
    "partners:browse",
    "partners:request_intro",
    "experts:browse",
    "experts:book",
    "admin:view_analytics",
    "admin:manage_incentive_rules",
    "admin:verify_partners",
    "admin:view_kpis",
    "admin:view_all_documents",
    "documents:upload",
    "documents:view_own",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export type { Permission };
