import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Security guardrail (CLAUDE.md §5 / .claude non-negotiable #6):
 * ANTHROPIC_API_KEY is server-side only. It must never be:
 *   - exposed via a NEXT_PUBLIC_ env var (those are inlined into the client bundle)
 *   - referenced from any "use client" component
 */
const SRC = resolve(__dirname, "../../");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(SRC).filter((f) => !f.includes("__tests__"));

describe("AI key is server-side only", () => {
  it("never exposes the Anthropic key through a NEXT_PUBLIC_ var", () => {
    const offenders = files.filter((f) =>
      /NEXT_PUBLIC_[A-Z_]*ANTHROPIC|NEXT_PUBLIC_[A-Z_]*API_KEY/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("never references ANTHROPIC_API_KEY from a client component", () => {
    const offenders = files.filter((f) => {
      const src = readFileSync(f, "utf8");
      const isClient = /^\s*["']use client["']/m.test(src);
      return isClient && src.includes("ANTHROPIC_API_KEY");
    });
    expect(offenders).toEqual([]);
  });
});
