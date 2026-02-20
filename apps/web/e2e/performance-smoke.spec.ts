import { expect, test } from "@playwright/test";

function percentile(values: number[], p: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? 0;
}

test("@perf collection-detail interaction stays within smoke thresholds", async ({ page }) => {
  const bootStart = Date.now();
  await page.goto("/");
  await expect(page.locator(".screen-grid a").first()).toBeVisible({ timeout: 30_000 });
  const firstLoadMs = Date.now() - bootStart;

  const cycles = 8;
  const samples: number[] = [];

  for (let i = 0; i < cycles; i += 1) {
    const interactionStart = Date.now();
    await page.locator(".screen-grid a").first().click();
    await expect(page.getByRole("button", { name: /back/i })).toBeVisible();
    await page.getByRole("button", { name: /back/i }).click();
    await expect(page.locator(".screen-grid a").first()).toBeVisible();
    samples.push(Date.now() - interactionStart);
  }

  const p95 = percentile(samples, 95);
  const avg = Math.round(samples.reduce((acc, value) => acc + value, 0) / samples.length);

  test.info().annotations.push({ type: "perf", description: `firstLoadMs=${firstLoadMs}` });
  test.info().annotations.push({ type: "perf", description: `interactionAvgMs=${avg}` });
  test.info().annotations.push({ type: "perf", description: `interactionP95Ms=${p95}` });

  // Generous smoke thresholds to detect regressions without flaking on local networks.
  expect(firstLoadMs).toBeLessThan(15000);
  expect(p95).toBeLessThan(3000);
});

