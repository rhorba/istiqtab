import { describe, expect, it } from "vitest";
import { cn } from "../utils.js";

describe("cn", () => {
  it("merges Tailwind class names without duplicates", () => {
    const result = cn("px-4 py-2", "text-sm");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
    expect(result).toContain("text-sm");
  });

  it("resolves conflicting Tailwind classes in favour of the last one", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("handles conditional classes (truthy)", () => {
    const result = cn("base", true && "active");
    expect(result).toContain("active");
  });

  it("handles conditional classes (falsy)", () => {
    const result = cn("base", false && "hidden");
    expect(result).not.toContain("hidden");
    expect(result).toBe("base");
  });

  it("handles undefined and null gracefully", () => {
    const result = cn("base", undefined, null);
    expect(result).toBe("base");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });

  it("handles object syntax", () => {
    const result = cn({ "text-red-500": true, "text-blue-500": false });
    expect(result).toContain("text-red-500");
    expect(result).not.toContain("text-blue-500");
  });
});
