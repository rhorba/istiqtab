import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Anthropic SDK before importing our module
vi.mock("@anthropic-ai/sdk", () => {
  const create = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: { create },
    })),
    __create: create, // expose for per-test configuration
  };
});

// Delay the import so the mock is set up first
const { askAdvisor } = await import("../client.js");
import Anthropic from "@anthropic-ai/sdk";

function getMockCreate() {
  // biome-ignore lint: test helper
  return new (Anthropic as any)().messages.create as ReturnType<typeof vi.fn>;
}

describe("askAdvisor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = "sk-ant-test-key";
    process.env.ANTHROPIC_MODEL = undefined;
  });

  it("returns text and token count from a successful API response", async () => {
    getMockCreate().mockResolvedValueOnce({
      content: [{ type: "text", text: "Morocco offers competitive incentives." }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });

    const result = await askAdvisor([{ role: "user", content: "What incentives are available?" }]);

    expect(result.text).toContain("Morocco offers competitive incentives.");
    expect(result.tokensUsed).toBe(150);
  });

  it("appends the mandatory disclaimer if missing from the response", async () => {
    getMockCreate().mockResolvedValueOnce({
      content: [{ type: "text", text: "You will receive the full incentive package." }],
      usage: { input_tokens: 80, output_tokens: 40 },
    });

    const result = await askAdvisor([{ role: "user", content: "Will I get incentives?" }]);

    // ensureDisclaimer must add the indicative disclaimer
    expect(result.text).toMatch(/indicative|verify|disclaimer/i);
  });

  it("combines multiple text blocks from the response", async () => {
    getMockCreate().mockResolvedValueOnce({
      content: [
        { type: "text", text: "Part one." },
        { type: "thinking", thinking: "internal reasoning" }, // non-text block — should be filtered
        { type: "text", text: "Part two." },
      ],
      usage: { input_tokens: 60, output_tokens: 30 },
    });

    const result = await askAdvisor([{ role: "user", content: "Question" }]);

    expect(result.text).toContain("Part one.");
    expect(result.text).toContain("Part two.");
    expect(result.text).not.toContain("internal reasoning");
  });

  it("uses a custom model from ANTHROPIC_MODEL env var", async () => {
    process.env.ANTHROPIC_MODEL = "claude-opus-4-8";
    getMockCreate().mockResolvedValueOnce({
      content: [{ type: "text", text: "Answer." }],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    await askAdvisor([{ role: "user", content: "Test" }]);

    expect(getMockCreate()).toHaveBeenCalledWith(
      expect.objectContaining({ model: "claude-opus-4-8" }),
    );
  });

  it("injects conversation history into the API call", async () => {
    getMockCreate().mockResolvedValueOnce({
      content: [{ type: "text", text: "Follow-up answer." }],
      usage: { input_tokens: 200, output_tokens: 80 },
    });

    const history = [
      { role: "user" as const, content: "First question?" },
      { role: "assistant" as const, content: "First answer." },
      { role: "user" as const, content: "Follow-up question?" },
    ];
    await askAdvisor(history);

    const call = getMockCreate().mock.calls[0][0];
    expect(call.messages).toHaveLength(3);
    expect(call.messages[0]).toEqual({ role: "user", content: "First question?" });
    expect(call.messages[1]).toEqual({ role: "assistant", content: "First answer." });
  });

  it("injects investor context into the system prompt", async () => {
    getMockCreate().mockResolvedValueOnce({
      content: [{ type: "text", text: "Context-aware answer." }],
      usage: { input_tokens: 50, output_tokens: 20 },
    });

    await askAdvisor([{ role: "user", content: "Test" }], {
      sector: "automotive",
      targetRegions: ["tanger_tetouan"],
    });

    const call = getMockCreate().mock.calls[0][0];
    expect(call.system).toMatch(/automotive/i);
    expect(call.system).toMatch(/Tangier/i);
  });

  it("handles zero usage tokens gracefully", async () => {
    getMockCreate().mockResolvedValueOnce({
      content: [{ type: "text", text: "Answer with no usage." }],
      usage: undefined,
    });

    const result = await askAdvisor([{ role: "user", content: "Test" }]);

    expect(result.tokensUsed).toBe(0);
  });

  it("throws if ANTHROPIC_API_KEY is not set", async () => {
    process.env.ANTHROPIC_API_KEY = undefined;

    await expect(askAdvisor([{ role: "user", content: "Test" }])).rejects.toThrow(
      "ANTHROPIC_API_KEY is not configured",
    );
  });
});
