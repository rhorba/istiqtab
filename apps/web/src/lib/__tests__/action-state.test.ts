import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodFieldErrors } from "../action-state.js";

describe("zodFieldErrors", () => {
  const schema = z.object({
    email: z.string().email("Invalid email"),
    name: z.string().min(1, "Name is required"),
    age: z.number().min(18, "Must be 18+"),
  });

  it("extracts field errors from a ZodError", () => {
    const result = schema.safeParse({ email: "not-an-email", name: "", age: 10 });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = zodFieldErrors(result.error);
      expect(errors.email).toBe("Invalid email");
      expect(errors.name).toBe("Name is required");
      expect(errors.age).toBe("Must be 18+");
    }
  });

  it("returns the first error message per field (not all messages)", () => {
    const strictSchema = z.object({
      password: z.string().min(8, "Too short").regex(/[A-Z]/, "Needs uppercase"),
    });
    const result = strictSchema.safeParse({ password: "ab" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = zodFieldErrors(result.error);
      // Should have exactly one message for 'password'
      expect(errors.password).toBe("Too short");
    }
  });

  it("returns empty object for a valid parse (no errors)", () => {
    const fakeZodError = new z.ZodError([]);
    const errors = zodFieldErrors(fakeZodError);
    expect(errors).toEqual({});
  });

  it("ignores issues without a string path (root-level or array-index errors)", () => {
    const arraySchema = z.array(z.string().min(1));
    const result = arraySchema.safeParse(["", "ok"]);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = zodFieldErrors(result.error);
      // Path[0] is 0 (number), so it should be ignored
      expect(Object.keys(errors)).toHaveLength(0);
    }
  });
});
