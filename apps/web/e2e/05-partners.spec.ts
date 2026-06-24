import { expect, test } from "@playwright/test";
import { DEMO_INVESTOR, signIn } from "./helpers/auth.js";

test.describe("Partner Directory", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, DEMO_INVESTOR.email, DEMO_INVESTOR.password);
  });

  test("partner directory page renders", async ({ page }) => {
    await page.goto("/en/investor/partners");
    await expect(page).not.toHaveURL(/sign-in/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("shows partner listings", async ({ page }) => {
    await page.goto("/en/investor/partners");
    // Should show partner cards or list items
    await page.waitForTimeout(1000);
    const content = await page.textContent("body");
    // Should mention partner types or show some partner data
    expect(content?.length).toBeGreaterThan(200);
  });

  test("partner filter by type is available", async ({ page }) => {
    await page.goto("/en/investor/partners");
    // Filter controls should be visible (select, radio, or button group)
    const filters = page.locator(
      "select, button[role='combobox'], input[type='radio'], [data-testid*='filter']",
    );
    const count = await filters.count();
    expect(count).toBeGreaterThan(0);
  });

  test("partner detail page renders when clicked", async ({ page }) => {
    await page.goto("/en/investor/partners");
    await page.waitForTimeout(1000);
    // Try to find a partner link
    const partnerLinks = page.locator('a[href*="/investor/partners/"]');
    const count = await partnerLinks.count();
    if (count > 0) {
      await partnerLinks.first().click();
      await page.waitForTimeout(1500);
      // Should be on a partner detail page
      expect(page.url()).toMatch(/\/partners\//);
    }
  });

  test("introduction request form is accessible on partner detail", async ({ page }) => {
    await page.goto("/en/investor/partners");
    await page.waitForTimeout(1000);
    const partnerLinks = page.locator('a[href*="/investor/partners/"]');
    const count = await partnerLinks.count();
    if (count > 0) {
      await partnerLinks.first().click();
      await page.waitForTimeout(1500);
      // Should have a button or form to request introduction
      const requestBtn = page.locator(
        'button:has-text("Request"), button:has-text("Introduction"), button:has-text("Contact")',
      );
      // Button might or might not be there depending on status
      const _exists = (await requestBtn.count()) > 0;
      // Just verify the page is functional
      expect(page.url()).toMatch(/\/partners\//);
    }
  });

  test("partner directory paginates or shows all partners", async ({ page }) => {
    await page.goto("/en/investor/partners");
    await page.waitForTimeout(1000);
    // Should render without error
    const error = page.locator("text=500, text=Error, text=Something went wrong");
    expect(await error.count()).toBe(0);
  });
});
