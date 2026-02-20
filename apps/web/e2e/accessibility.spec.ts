import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoCriticalA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .include(".gba-screen")
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(["color-contrast"])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.describe("Accessibility @a11y", () => {
  test("@a11y collection view has no critical a11y violations in screen area", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".screen-grid a").first()).toBeVisible({ timeout: 30_000 });

    await expectNoCriticalA11yViolations(page);
  });

  test("@a11y detail view has no critical a11y violations in screen area", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".screen-grid a").first()).toBeVisible({ timeout: 30_000 });
    await page.locator(".screen-grid a").first().click();
    await expect(page.getByRole("button", { name: /back/i })).toBeVisible();

    await expectNoCriticalA11yViolations(page);
  });
});
