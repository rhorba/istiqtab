import { expect, test } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("renders hero headline and subtitle", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
    // Gold subtitle under the main headline
    const sub = page.locator("p.font-serif.text-\\[var\\(--color-gold\\)\\]").first();
    await expect(sub).toBeVisible();
  });

  test("shows four stat pills", async ({ page }) => {
    const pills = page.locator(
      "span.rounded-full.border.border-\\[var\\(--color-gold\\)\\]\\/40",
    );
    await expect(pills).toHaveCount(4);
  });

  test("calculator CTA navigates to /en/calculator", async ({ page }) => {
    const cta = page.locator('a[href*="/calculator"]').first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/en\/calculator/);
  });

  test("sign-up CTA navigates to /en/auth/sign-up", async ({ page }) => {
    const cta = page.locator('a[href*="/auth/sign-up"]').first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/en\/auth\/sign-up/);
  });

  test("shows 'What Istiqtab covers' trust strip with 4 items", async ({ page }) => {
    await expect(page.getByText("What Istiqtab covers")).toBeVisible();
    const items = page.locator("text=Setup Wizard, text=Incentives Calculator");
    await expect(page.getByText("Setup Wizard")).toBeVisible();
    await expect(page.getByText("Incentives Calculator")).toBeVisible();
    await expect(page.getByText("Partner Finder")).toBeVisible();
    await expect(page.getByText("AI Advisor")).toBeVisible();
  });

  test("featured sector cards link to hub/sectors", async ({ page }) => {
    const sectorLinks = page.locator('a[href*="/hub/sectors/"]');
    const count = await sectorLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("'how it works' section shows 3 steps", async ({ page }) => {
    await expect(page.getByText("Calculate your incentives")).toBeVisible();
    await expect(page.getByText("Follow your setup wizard")).toBeVisible();
    await expect(page.getByText("Book an expert or find a partner")).toBeVisible();
  });

  test("bottom section positioning statement is visible", async ({ page }) => {
    await expect(
      page.getByText("AMDIE tells you Morocco is open for business."),
    ).toBeVisible();
  });

  test("'View all sector guides' link navigates to hub", async ({ page }) => {
    const link = page.getByText("View all sector guides in the Intelligence Hub →");
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/en\/hub/);
  });

  test("page title includes Istiqtab", async ({ page }) => {
    await expect(page).toHaveTitle(/Istiqtab/i);
  });
});
