"use server";

import { signIn } from "@/auth";
import { SignUpSchema } from "@istiqtab/core";
import { db, users } from "@istiqtab/db";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";

export type SignUpState = { error?: string; fieldErrors?: Record<string, string> };

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    company: formData.get("company") || undefined,
    country: formData.get("country") || undefined,
    preferredLanguage: (formData.get("preferredLanguage") as string) || "en",
  };

  const parsed = SignUpSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      fieldErrors[field] = issue.message;
    }
    return { fieldErrors };
  }

  const { email, password, name, role, company, country, preferredLanguage } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  await db.insert(users).values({
    id: crypto.randomUUID(),
    email,
    name,
    role,
    passwordHash,
    company: company ?? null,
    country: country ?? null,
    preferredLanguage,
    isActive: true,
  });

  // Sign in immediately after registration
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/en",
    });
  } catch (err) {
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    // Account created — redirect to sign-in if auto-sign-in fails
    return { error: "Account created. Please sign in." };
  }

  return {};
}
