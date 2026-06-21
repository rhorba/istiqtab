import { describe, expect, it } from "vitest";
import { toOptions } from "../options.js";

const MOCK_LABELS = {
  foo: { en: "Foo English", fr: "Foo Français", ar: "فو" },
  bar: { en: "Bar English", fr: "Bar Français", ar: "بار" },
  baz: { en: "Baz English", fr: "Baz Français", ar: "باز" },
} as const;

describe("toOptions", () => {
  it("returns one option per key", () => {
    const result = toOptions(MOCK_LABELS, "en");
    expect(result).toHaveLength(3);
  });

  it("uses the English label for locale=en", () => {
    const result = toOptions(MOCK_LABELS, "en");
    const foo = result.find((o) => o.value === "foo");
    expect(foo?.label).toBe("Foo English");
  });

  it("uses the French label for locale=fr", () => {
    const result = toOptions(MOCK_LABELS, "fr");
    const bar = result.find((o) => o.value === "bar");
    expect(bar?.label).toBe("Bar Français");
  });

  it("uses the Arabic label for locale=ar", () => {
    const result = toOptions(MOCK_LABELS, "ar");
    const baz = result.find((o) => o.value === "baz");
    expect(baz?.label).toBe("باز");
  });

  it("preserves the value field for every entry", () => {
    const result = toOptions(MOCK_LABELS, "en");
    expect(result.map((o) => o.value)).toEqual(expect.arrayContaining(["foo", "bar", "baz"]));
  });

  it("returns empty array for empty map", () => {
    const result = toOptions({} as never, "en");
    expect(result).toEqual([]);
  });
});
