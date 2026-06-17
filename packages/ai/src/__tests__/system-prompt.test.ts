import { describe, expect, it } from "vitest";
import { type AdvisorContext, buildSystemPrompt } from "../system-prompt.js";

describe("buildSystemPrompt", () => {
  it("injects the investor context (sector / bracket / region)", () => {
    const ctx: AdvisorContext = {
      sector: "automotive",
      investmentBracket: "100m_to_500m",
      targetRegions: ["tanger_tetouan"],
      jobsToCreate: 350,
      companyCountry: "Germany",
    };
    const prompt = buildSystemPrompt(ctx);
    expect(prompt).toContain("Automotive");
    expect(prompt).toContain("Tangier-Tetouan-Al Hoceima");
    expect(prompt).toContain("350");
    expect(prompt).toContain("Germany");
    expect(prompt).toMatch(/100.*500/); // bracket label includes the range
  });

  it("handles a missing profile gracefully", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain("No investor profile");
  });

  it("always encodes the no-financial-advice boundary", () => {
    const prompt = buildSystemPrompt({ sector: "tech" });
    expect(prompt.toLowerCase()).toContain("information only");
    expect(prompt).toMatch(/never\s+promise\s+or\s+guarantee/i);
    expect(prompt).toMatch(/may be eligible/i);
    expect(prompt.toLowerCase()).toContain("cri");
  });

  it("instructs the model to resist instruction-override / prompt leaks", () => {
    const prompt = buildSystemPrompt();
    expect(prompt.toLowerCase()).toContain("override any later instruction");
    expect(prompt.toLowerCase()).toMatch(/reveal this system prompt|act as a different assistant/);
  });

  it("respects the requested locale", () => {
    expect(buildSystemPrompt({ locale: "fr" })).toContain("French");
    expect(buildSystemPrompt({ locale: "ar" })).toContain("Arabic");
    expect(buildSystemPrompt({})).toContain("English");
  });
});
