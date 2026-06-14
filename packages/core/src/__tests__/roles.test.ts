import { describe, expect, it } from "vitest";
import {
  ALL_ROLES,
  type Permission,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "../roles.js";

describe("RBAC permission matrix (CLAUDE.md §7)", () => {
  it("exposes exactly the five Istiqtab roles", () => {
    expect(ALL_ROLES).toEqual(["investor", "consultant", "expert", "partner", "admin"]);
  });

  it("investor can use the AI advisor, calculator, wizard, and own documents", () => {
    expect(hasPermission("investor", "ai_advisor:use_full")).toBe(true);
    expect(hasPermission("investor", "calculator:save")).toBe(true);
    expect(hasPermission("investor", "wizard:save")).toBe(true);
    expect(hasPermission("investor", "documents:view_own")).toBe(true);
  });

  it("partner is restricted to browsing and editing its own profile", () => {
    expect(hasPermission("partner", "partners:browse")).toBe(true);
    expect(hasPermission("partner", "partner_profile:edit_own")).toBe(true);
    // Partner must NOT have investor/admin capabilities.
    expect(hasPermission("partner", "experts:book")).toBe(false);
    expect(hasPermission("partner", "wizard:save")).toBe(false);
    expect(hasPermission("partner", "admin:view_kpis")).toBe(false);
  });

  it("expert manages its own profile and slots but cannot book or save wizard", () => {
    expect(hasPermission("expert", "expert_profile:edit_own")).toBe(true);
    expect(hasPermission("expert", "expert_slots:manage")).toBe(true);
    expect(hasPermission("expert", "experts:book")).toBe(false);
    expect(hasPermission("expert", "wizard:save")).toBe(false);
  });

  it("only admin holds admin capabilities", () => {
    const adminPerms: Permission[] = [
      "admin:view_analytics",
      "admin:manage_incentive_rules",
      "admin:verify_partners",
      "admin:view_kpis",
      "admin:view_all_documents",
    ];
    for (const role of ALL_ROLES) {
      const expected = role === "admin";
      for (const perm of adminPerms) {
        expect(hasPermission(role, perm)).toBe(expected);
      }
    }
  });

  it("consultant mirrors investor tooling but cannot upload documents", () => {
    expect(hasPermission("consultant", "calculator:save")).toBe(true);
    expect(hasPermission("consultant", "experts:book")).toBe(true);
    expect(hasPermission("consultant", "documents:upload")).toBe(false);
  });

  it("profile-edit isolation: only the owning role can edit its profile", () => {
    // Partner can edit partner profile, never an expert profile (and vice versa).
    expect(hasPermission("partner", "partner_profile:edit_own")).toBe(true);
    expect(hasPermission("partner", "expert_profile:edit_own")).toBe(false);
    expect(hasPermission("expert", "expert_profile:edit_own")).toBe(true);
    expect(hasPermission("expert", "partner_profile:edit_own")).toBe(false);
    // Investors/consultants edit neither.
    expect(hasPermission("investor", "expert_profile:edit_own")).toBe(false);
    expect(hasPermission("investor", "partner_profile:edit_own")).toBe(false);
    expect(hasPermission("consultant", "expert_profile:edit_own")).toBe(false);
  });

  it("hasAnyPermission / hasAllPermissions compose correctly", () => {
    expect(hasAnyPermission("partner", ["partners:browse", "admin:view_kpis"])).toBe(true);
    expect(hasAllPermissions("partner", ["partners:browse", "admin:view_kpis"])).toBe(false);
    expect(hasAllPermissions("investor", ["calculator:run", "calculator:save"])).toBe(true);
  });
});
