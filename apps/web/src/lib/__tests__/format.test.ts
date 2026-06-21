import { describe, expect, it } from "vitest";
import { formatRate, formatSlot } from "../format.js";

describe("formatRate", () => {
  it("uses EUR when hourlyRateEUR is set", () => {
    const result = formatRate({ hourlyRateMAD: 3000, hourlyRateEUR: 150 }, "en");
    expect(result).toMatch(/150/);
    expect(result).toContain("/hr");
  });

  it("uses MAD when hourlyRateEUR is null", () => {
    const result = formatRate({ hourlyRateMAD: 3000, hourlyRateEUR: null }, "en");
    expect(result).toContain("MAD/hr");
    expect(result).toMatch(/3[,.]?000|3000/);
  });

  it("uses MAD when hourlyRateEUR is undefined", () => {
    const result = formatRate({ hourlyRateMAD: 5000 }, "en");
    expect(result).toContain("MAD/hr");
  });

  it("formats EUR in French locale", () => {
    const result = formatRate({ hourlyRateMAD: 3000, hourlyRateEUR: 150 }, "fr");
    expect(result).toContain("/hr");
    expect(result).toMatch(/150/);
  });

  it("formats MAD in Arabic locale", () => {
    const result = formatRate({ hourlyRateMAD: 5000 }, "ar");
    expect(result).toContain("MAD/hr");
  });

  it("formats zero EUR correctly", () => {
    const result = formatRate({ hourlyRateMAD: 0, hourlyRateEUR: 0 }, "en");
    expect(result).toContain("/hr");
  });
});

describe("formatSlot", () => {
  const start = new Date("2026-07-15T10:00:00Z");
  const end = new Date("2026-07-15T11:00:00Z");

  it("includes date and time range with UTC label", () => {
    const result = formatSlot(start, end, "en");
    expect(result).toContain("UTC");
    expect(result).toContain("–");
    // date part
    expect(result).toMatch(/Jul|15/i);
  });

  it("formats correctly in French locale", () => {
    const result = formatSlot(start, end, "fr");
    expect(result).toContain("UTC");
    expect(result).toContain("–");
  });

  it("formats correctly in Arabic locale", () => {
    const result = formatSlot(start, end, "ar");
    expect(result).toContain("UTC");
  });

  it("shows a dot separator between date and time", () => {
    const result = formatSlot(start, end, "en");
    expect(result).toContain("·");
  });
});
