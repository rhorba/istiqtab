import { defineConfig, devices } from "@playwright/test";

/**
 * Istiqtab E2E test configuration.
 *
 * Targets the Docker-served stack at http://localhost (Caddy reverse proxy).
 * To run locally without Docker, set BASE_URL=http://localhost:3000.
 *
 * Videos are always recorded and saved to apps/web/test-results/videos/.
 * After a run, the merged video is copied to /docs/e2e-recording.webm.
 */
const BASE_URL = process.env.BASE_URL ?? "http://localhost";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // sequential keeps the video narrative coherent
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 30_000,

  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["line"],
  ],

  use: {
    baseURL: BASE_URL,
    locale: "en-US",

    // Record every test — we'll stitch the clips into a single demo video.
    video: {
      mode: "on",
      size: { width: 1280, height: 800 },
    },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    headless: true,
    viewport: { width: 1280, height: 800 },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  outputDir: "test-results",
});
