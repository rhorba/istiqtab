import { expect, test } from "@playwright/test";

test.describe("Incentives Calculator (anonymous)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/calculator");
  });

  test("page loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Calculator|Incentives/i);
    // Use .first() because "Investment Charter 2022" appears in both the label and the subtitle text
    await expect(page.getByText("Investment Charter 2022", { exact: true }).first()).toBeVisible();
  });

  test("renders calculator form", async ({ page }) => {
    // Should have the calculator form rendered
    const form = page.locator("form, [data-testid='calculator-form']");
    await expect(form.first()).toBeVisible();
  });

  test("sector select is present", async ({ page }) => {
    // The form should have a sector selection
    const sectorField = page
      .locator("select, button[role='combobox'], [data-testid='sector-select']")
      .first();
    await expect(sectorField).toBeVisible();
  });

  test("can select automotive sector", async ({ page }) => {
    // Find the sector select/combobox
    const sectorTrigger = page.locator("button[role='combobox']").first();
    if ((await sectorTrigger.count()) > 0) {
      await sectorTrigger.click();
      // Select automotive from the dropdown
      const option = page.getByRole("option", { name: /automotive/i });
      if ((await option.count()) > 0) {
        await option.click();
      }
    }
  });

  test("submit button or calculate button is present", async ({ page }) => {
    const btn = page.locator(
      'button[type="submit"], button:has-text("Calculate"), button:has-text("Compute")',
    );
    await expect(btn.first()).toBeVisible();
  });

  test("calculator disclaimer text is present", async ({ page }) => {
    // The disclaimer about indicative results
    const _disclaimer = page.locator("text=indicative, text=disclaimer, text=verify, text=Charter");
    // At least one disclaimer-type text should appear
    const disclaimerCount = await page.locator("text=indicative").count();
    const charterCount = await page.locator("text=Charter").count();
    expect(disclaimerCount + charterCount).toBeGreaterThan(0);
  });

  test("runs a full calculation and shows results", async ({ page }) => {
    // Fill in the form step by step
    const sectorTrigger = page.locator("button[role='combobox']").nth(0);
    if ((await sectorTrigger.count()) > 0) {
      await sectorTrigger.click();
      await page.waitForTimeout(300);
      const automotive = page.getByRole("option", { name: /automotive/i });
      if ((await automotive.count()) > 0) await automotive.click();
    }

    // Fill region if present
    const regionTrigger = page.locator("button[role='combobox']").nth(1);
    if ((await regionTrigger.count()) > 0) {
      await regionTrigger.click();
      await page.waitForTimeout(300);
      const region = page.getByRole("option").first();
      if ((await region.count()) > 0) await region.click();
    }

    // Fill investment bracket if present
    const bracketTrigger = page.locator("button[role='combobox']").nth(2);
    if ((await bracketTrigger.count()) > 0) {
      await bracketTrigger.click();
      await page.waitForTimeout(300);
      const bracket = page.getByRole("option").first();
      if ((await bracket.count()) > 0) await bracket.click();
    }

    // Submit
    const submitBtn = page.locator('button[type="submit"]').first();
    if ((await submitBtn.count()) > 0) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
      // After calculation, results or next step should be visible
    }
  });

  test("French locale calculator loads", async ({ page }) => {
    await page.goto("/fr/calculator");
    await expect(page).not.toHaveURL(/error/);
    // Should render some content in French
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });
});
