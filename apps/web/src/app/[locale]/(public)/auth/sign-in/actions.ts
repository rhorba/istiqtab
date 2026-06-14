"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type SignInState = { error?: string };

export async function signInWithCredentials(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/en";

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: callbackUrl,
    });
  } catch (err) {
    // Auth.js throws a redirect on success — rethrow so Next.js handles it
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    if (err instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    return { error: "Something went wrong. Please try again." };
  }

  return {};
}

export async function signInWithGoogle(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/en";
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signInWithLinkedIn(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/en";
  await signIn("linkedin", { redirectTo: callbackUrl });
}
