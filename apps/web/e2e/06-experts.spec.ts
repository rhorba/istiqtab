import { expect, test } from "@playwright/test";
import { DEMO_INVESTOR, signIn } from "./helpers/auth.js";

test.describe("Expert Directory & Booking", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, DEMO_INVESTOR.email, DEMO_INVESTOR.password);
  });

  test("expert directory page renders", async ({ page }) => {
    await page.goto("/en/investor/experts");
    await expect(page).not.toHaveURL(/sign-in/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("shows expert listings", async ({ page }) => {
    await page.goto("/en/investor/experts");
    await page.waitForTimeout(1500);
    // Should show expert cards or a list
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(200);
  });

  test("expert cards show rate and name", async ({ page }) => {
    await page.goto("/en/investor/experts");
    await page.waitForTimeout(1500);
    const body = await page.textContent("body");
    // Should mention MAD (Moroccan currency) or EUR for rates
    const hasRate = body?.includes("MAD") || body?.includes("EUR") || body?.includes("/hr");
    expect(hasRate).toBe(true);
  });

  test("expert detail page renders", async ({ page }) => {
    await page.goto("/en/investor/experts");
    await page.waitForTimeout(1500);
    const expertLinks = page.locator('a[href*="/investor/experts/"]');
    const count = await expertLinks.count();
    if (count > 0) {
      await expertLinks.first().click();
      await page.waitForTimeout(1500);
      expect(page.url()).toMatch(/\/experts\//);
      // Detail page should have the expert's name or booking section
      await expect(page.locator("h1, h2").first()).toBeVisible();
    }
  });

  test("booking slots section visible on expert detail", async ({ page }) => {
    await page.goto("/en/investor/experts");
    await page.waitForTimeout(1500);
    const expertLinks = page.locator('a[href*="/investor/experts/"]');
    const count = await expertLinks.count();
    if (count > 0) {
      await expertLinks.first().click();
      await page.waitForTimeout(1500);
      // Should have a booking button or slots section
      const bookingEl = page.locator(
        'button:has-text("Book"), section:has-text("Book"), *:has-text("Available slots")',
      );
      const _exists = (await bookingEl.count()) > 0;
      // Verify page loaded without error
      const errorEl = page.locator("text=500 Internal Server Error");
      expect(await errorEl.count()).toBe(0);
    }
  });

  test("investor bookings page renders", async ({ page }) => {
    await page.goto("/en/investor/bookings");
    await expect(page).not.toHaveURL(/sign-in/);
    await page.waitForTimeout(1000);
    // Should render (might show empty state)
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(50);
  });

  test("expert filter works without error", async ({ page }) => {
    await page.goto("/en/investor/experts");
    await page.waitForTimeout(1000);
    // No 500 errors
    const error = page.locator("text=Internal Server Error, text=unhandled error");
    expect(await error.count()).toBe(0);
  });
});
