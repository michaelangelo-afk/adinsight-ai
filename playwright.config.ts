import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the Meta OAuth roundtrip e2e test.
 *
 * Auto-spawns the Next.js dev server locally OR `next build && next start`
 * in CI for deterministic state. Workers are pinned to 1 because the
 * `beforeAll` provisions a single shared Supabase + Facebook test user;
 * parallel runs would race on the OAuth callback upsert.
 *
 * The spec auto-skips when secrets are missing — running `npm run e2e`
 * in a plain dev shell returns "skipped" not "failed", so the dir is
 * safe to ignore until someone opts in. CI runs the same spec without
 * skip via env injected from GitHub Actions (see
 * `.github/workflows/e2e.yml`).
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000, // fb.com on first run is slow; consent dialog adds 5-15s
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    // Headless on CI, headed locally so devs can follow the dialog.
    headless: isCI
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],

  webServer: {
    // CI uses `next start` for deterministic state. Local dev uses
    // `next dev` for fast iteration (the spec tolerates both because
    // the OAuth callback route is `force-dynamic` either way).
    command: isCI
      ? "npm run build && npm run start -- -p 3000"
      : "npm run dev",
    url: "http://localhost:3000/api/health/meta",
    reuseExistingServer: !isCI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      // Don't override NODE_ENV when CI already sets it to 'production'.
      ...(isCI ? {} : { NODE_ENV: "development" })
    }
  }
});
