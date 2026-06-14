import type { z } from "zod";

/** Standard return shape for form server actions used with useActionState. */
export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Flatten a ZodError into a { field: message } map (first issue per field). */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !(field in fieldErrors)) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}
