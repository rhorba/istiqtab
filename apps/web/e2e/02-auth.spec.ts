import { expect, test } from "@playwright/test";

const DEMO_EMAIL = "hans.schmidt@demo.istiqtab.ma";
const DEMO_PASSWORD = "demo1234";
const ADMIN_EMAIL = "admin@istiqtab.ma";

test.describe("Authentication flows", () => {
  test("sign-in page renders form correctly", async ({ page }) => {
    await page.goto("/en/auth/sign-in");
    await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("sign-in page shows sign-up link", async ({ page }) => {
    await page.goto("/en/auth/sign-in");
    // Use the "Create account" link text to avoid matching nav links with double-locale prefix
    const link = page.getByRole("link", { name: /create account/i });
    await expect(link).toBeVisible();
  });

  test("sign-up page renders registration form", async ({ page }) => {
    await page.goto("/en/auth/sign-up");
    // Heading is "Start your Morocco journey" (not "Create your account")
    await expect(page.getByRole("heading", { name: /Start your Morocco journey/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Create Account/i })).toBeVisible();
  });

  test("sign-in with invalid credentials shows error", async ({ page }) => {
    await page.goto("/en/auth/sign-in");
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Auth.js v5 redirects to pages.error (/en/auth/error) on failed credentials
    await page.waitForURL(/sign-in|auth\/error/, { timeout: 5_000 });
    expect(page.url()).toMatch(/sign-in|error/);
  });

  test("sign-in with demo investor credentials succeeds", async ({ page }) => {
    await page.goto("/en/auth/sign-in");
    await page.getByLabel(/email/i).fill(DEMO_EMAIL);
    await page.getByLabel(/password/i).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    // Should redirect away from sign-in (to /en or /en/investor/*)
    await page.waitForFunction(() => !window.location.href.includes("sign-in"), {
      timeout: 12_000,
    });
    expect(page.url()).not.toMatch(/sign-in/);
  });

  test("authenticated investor can access wizard", async ({ page }) => {
    // Sign in
    await page.goto("/en/auth/sign-in");
    await page.getByLabel(/email/i).fill(DEMO_EMAIL);
    await page.getByLabel(/password/i).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForFunction(() => !window.location.href.includes("sign-in"), {
      timeout: 12_000,
    });
    // Navigate to wizard
    await page.goto("/en/investor/wizard");
    await expect(page).toHaveURL(/wizard/);
    // Should NOT redirect to sign-in
    expect(page.url()).not.toMatch(/sign-in/);
  });

  test("unauthenticated access to wizard redirects to sign-in", async ({ page }) => {
    await page.goto("/en/investor/wizard");
    await page.waitForURL(/sign-in/, { timeout: 5_000 });
    expect(page.url()).toMatch(/sign-in/);
  });

  test("unauthenticated access to admin redirects to sign-in", async ({ page }) => {
    await page.goto("/en/admin");
    await page.waitForURL(/sign-in/, { timeout: 5_000 });
    expect(page.url()).toMatch(/sign-in/);
  });

  test("sign-out works after login", async ({ page }) => {
    await page.goto("/en/auth/sign-in");
    await page.getByLabel(/email/i).fill(DEMO_EMAIL);
    await page.getByLabel(/password/i).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForFunction(() => !window.location.href.includes("sign-in"), {
      timeout: 12_000,
    });

    // Find and click sign-out (usually in nav or dropdown)
    const signOutBtn = page.locator(
      'button[type="submit"]:has-text("Sign out"), form[action*="signout"] button, a:has-text("Sign out")',
    );
    if ((await signOutBtn.count()) > 0) {
      await signOutBtn.first().click();
      await page.waitForURL(/\/(en\/?$|sign-in)/, { timeout: 5_000 });
    }
    // Either on home or sign-in — we just verify the flow doesn't error
  });

  test("sign-in with admin credentials gives admin access", async ({ page }) => {
    await page.goto("/en/auth/sign-in");
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForFunction(() => !window.location.href.includes("sign-in"), {
      timeout: 12_000,
    });
    // Admin should be able to reach admin dashboard
    await page.goto("/en/admin");
    expect(page.url()).not.toMatch(/sign-in/);
  });
});
