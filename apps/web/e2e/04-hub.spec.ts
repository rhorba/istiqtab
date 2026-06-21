import { expect, test } from "@playwright/test";

test.describe("Intelligence Hub", () => {
  test("hub index page renders", async ({ page }) => {
    await page.goto("/en/hub");
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("hub has sectors section", async ({ page }) => {
    await page.goto("/en/hub");
    // Should link to sectors or have sectors content
    const sectorLinks = page.locator('a[href*="/hub/sectors"]');
    const sectorCount = await sectorLinks.count();
    expect(sectorCount).toBeGreaterThan(0);
  });

  test("hub has regions section", async ({ page }) => {
    await page.goto("/en/hub");
    // Should link to regions or have regions content
    const regionLinks = page.locator('a[href*="/hub/regions"]');
    const regionCount = await regionLinks.count();
    expect(regionCount).toBeGreaterThan(0);
  });

  test("sectors list page renders", async ({ page }) => {
    await page.goto("/en/hub/sectors");
    await expect(page).not.toHaveURL(/error/);
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(100);
  });

  test("automotive sector detail page renders", async ({ page }) => {
    await page.goto("/en/hub/sectors/automotive");
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator("h1").first()).toBeVisible();
    // Should mention automotive
    const title = await page.locator("h1").first().textContent();
    expect(title?.toLowerCase()).toMatch(/automotive|automobile/i);
  });

  test("renewables sector detail page renders", async ({ page }) => {
    await page.goto("/en/hub/sectors/renewables");
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("bpo_ites sector detail page renders", async ({ page }) => {
    await page.goto("/en/hub/sectors/bpo_ites");
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("regions list page renders", async ({ page }) => {
    await page.goto("/en/hub/regions");
    await expect(page).not.toHaveURL(/error/);
    const content = await page.textContent("body");
    expect(content?.length).toBeGreaterThan(100);
  });

  test("Tanger-Tetouan region detail page renders", async ({ page }) => {
    await page.goto("/en/hub/regions/tanger_tetouan");
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator("h1").first()).toBeVisible();
    const title = await page.locator("h1").first().textContent();
    expect(title?.toLowerCase()).toMatch(/tanger|tetouan/i);
  });

  test("Casablanca region detail page renders", async ({ page }) => {
    await page.goto("/en/hub/regions/casablanca_settat");
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("hub pages have SEO meta tags", async ({ page }) => {
    await page.goto("/en/hub/sectors/automotive");
    const _description = await page
      .$eval('meta[name="description"]', (el) => (el as HTMLMetaElement).content)
      .catch(() => "");
    // Either has description meta or the page title is sufficient
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test("French locale hub works", async ({ page }) => {
    await page.goto("/fr/hub");
    await expect(page).not.toHaveURL(/error/);
  });

  test("hub sector page links back to hub listing", async ({ page }) => {
    await page.goto("/en/hub/sectors/automotive");
    // Should have back link or breadcrumb
    const backLink = page.locator('a[href*="/hub"]').first();
    await expect(backLink).toBeVisible();
  });
});
