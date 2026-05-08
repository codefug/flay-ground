import { defineConfig, devices } from "next/experimental/testmode/playwright";

const baseURL = "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e/tests",
  testMatch: "e2e/tests/**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["blob", { outputDir: "blob-report" }]]
    : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm start",
    url: baseURL,
    reuseExistingServer: true,
  },
});
