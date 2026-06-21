import type { Page } from "@playwright/test";

export const DEMO_INVESTOR = {
  email: "hans.schmidt@demo.istiqtab.ma",
  password: "demo1234",
};

export const DEMO_ADMIN = {
  email: "admin@istiqtab.ma",
  password: "demo1234",
};

export const DEMO_EXPERT = {
  email: "fatima.zahra@demo.istiqtab.ma",
  password: "demo1234",
};

/** Sign in via the form and wait for redirect away from sign-in page. */
export async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/en/auth/sign-in");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait until we're no longer on the sign-in page
  await page.waitForFunction(() => !window.location.href.includes("sign-in"), { timeout: 10_000 });
}
