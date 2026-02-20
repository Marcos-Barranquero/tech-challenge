import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "pnpm --filter @tech-challenge/shared build && pnpm --filter @tech-challenge/api dev",
      url: "http://127.0.0.1:4000/health",
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
    {
      command: "NEXT_PUBLIC_API_URL=http://127.0.0.1:4000 pnpm --filter @tech-challenge/web dev",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !isCI,
      timeout: 180_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
