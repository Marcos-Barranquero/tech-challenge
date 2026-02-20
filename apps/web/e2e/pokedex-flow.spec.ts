import { expect, test, type Page } from "@playwright/test";

async function waitForCollectionReady(page: Page) {
  await page.goto("/");
  await expect(page.locator(".screen-grid a").first()).toBeVisible({ timeout: 30_000 });
}

test.describe("Pokedex flow", () => {
  test("keeps in-memory collection state when opening/closing detail and clears it on reload", async ({
    page,
  }) => {
    await waitForCollectionReady(page);

    const search = page.getByRole("textbox", { name: /search pokemon and evolutions/i });
    await search.fill("pikachu");
    await expect(page.locator(".screen-grid a")).toHaveCount(3);

    await page.locator(".screen-grid a").filter({ hasText: /pikachu/i }).first().click();

    await expect(page).toHaveURL(/pokemon=25/);
    await expect(page.getByRole("button", { name: /back/i })).toBeVisible();

    await page.getByRole("button", { name: /back/i }).click();

    await expect(page).not.toHaveURL(/pokemon=/);
    await expect(search).toHaveValue("pikachu");

    await page.reload();
    await expect(search).toHaveValue("");
  });

  test("uses query-string detail routing and evolution direction transitions", async ({ page }) => {
    await waitForCollectionReady(page);

    await page.getByRole("textbox", { name: /search pokemon and evolutions/i }).fill("bulbasaur");
    await page.locator(".screen-grid a").filter({ hasText: /bulbasaur/i }).first().click();

    await expect(page).toHaveURL(/pokemon=1/);
    const detailPanel = page.locator(".screen-panel-detail");
    await detailPanel.getByRole("link", { name: /ivysaur/i }).click();
    await expect(page).toHaveURL(/pokemon=2/);
    await expect(page.locator("section.detail-reel-up")).toBeVisible();

    await detailPanel.getByRole("link", { name: /bulbasaur/i }).click();
    await expect(page).toHaveURL(/pokemon=1/);
    await expect(page.locator("section.detail-reel-down")).toBeVisible();
  });

  test("applies type and generation filters", async ({ page }) => {
    await waitForCollectionReady(page);

    const selects = page.getByRole("combobox");
    await selects.nth(0).selectOption("water");
    await selects.nth(1).selectOption("generation-i");

    const cards = page.locator(".screen-grid article");
    await expect(cards.first()).toBeVisible();
    const visibleCount = await cards.count();
    expect(visibleCount).toBeGreaterThan(0);

    const sample = Math.min(visibleCount, 6);
    for (let i = 0; i < sample; i += 1) {
      await expect(cards.nth(i)).toContainText(/gen i/i);
      await expect(cards.nth(i)).toContainText(/water/i);
    }
  });
});
