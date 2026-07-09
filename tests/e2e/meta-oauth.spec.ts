/**
 * Meta OAuth roundtrip — full Playwright e2e against the Facebook
 * Test User sandbox. Catches env/cookie/redirect regressions on every
 * CI run so the manual friend-test in `docs/friend-test.md` only
 * escalates to a real-Meta roundtrip when this spec itself fails.
 *
 * What it asserts (in order):
 *   1. Pre-flight: GET /api/health/meta returns ready=true +
 *      META_REDIRECT_URI_effective matches the configured redirect.
 *   2. Connect button → Facebook OAuth dialog (URL-pattern wait).
 *   3. Consent dialog → click → callback (URL-pattern wait).
 *   4. meta_connect=ok URL on /dashboard.
 *   5. meta_oauth_state cookie cleared (single-use CSRF check passed).
 *   6. meta_demo cookie cleared (real-OAuth path is source of truth).
 *   7. meta_connections row written via service-role Supabase read —
 *      user_id = testUserId, meta_user_id = fbTestUserId,
 *      access_token.length > 100 (long-lived), status = 'active'.
 *   8. AccountsStrip renders "Meta Ads" + "live" pill, no data-demo-pill.
 *
 * Teardown deletes the Facebook + Supabase test users in afterAll
 * (try/catch — CI cancellation mustn't leak orphan FB users).
 */
import { test, expect, type Cookie } from "@playwright/test";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  createMetaTestUser,
  deleteMetaTestUser,
  type MetaTestUser
} from "./helpers/test-user";
import {
  provisionE2EUser,
  cleanupE2EUser,
  E2E_PREREQS,
  type E2ETestUser
} from "./helpers/supabase-auth";

const META_APP_ID = process.env.META_APP_ID ?? "";
const META_APP_SECRET = process.env.META_APP_SECRET ?? "";
const META_API_VERSION = process.env.META_API_VERSION ?? "v18.0";
const META_REDIRECT_URI =
  process.env.META_REDIRECT_URI ??
  "http://localhost:3000/api/auth/meta/callback";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const META_PREREQS_READY = !!META_APP_ID && !!META_APP_SECRET;
const PREREQS_READY = META_PREREQS_READY && E2E_PREREQS.ready;

const RUN_TAG_DATE = Date.now();
const RUN_TAG_SUFFIX = Math.random().toString(36).slice(2, 8);
const RUN_TAG = `e2e-${RUN_TAG_DATE}-${RUN_TAG_SUFFIX}`;

/** Pre-computed skip reason so test.skip() takes a plain string. */
const SKIP_REASON: string = (() => {
  const missing = [
    !META_APP_ID && "META_APP_ID",
    !META_APP_SECRET && "META_APP_SECRET",
    ...E2E_PREREQS.missing
  ].filter((s): s is string => !!s);
  return missing.length > 0
    ? `Skipping: missing env (${missing.join(", ")}). ` +
        `Set them locally or run via GitHub Actions for a real round-trip.`
    : "Skipping: env not ready";
})();

test.describe.configure({ mode: "serial" });

test.describe("Meta OAuth roundtrip", () => {
  test.skip(!PREREQS_READY, SKIP_REASON);

  let metaTestUser: MetaTestUser | null = null;
  let supabaseTestUser: E2ETestUser | null = null;

  test.beforeAll(async () => {
    // 1. Pre-flight — fails fast and surfaces the diagnostic JSON
    //    directly in the test report (no log-diving for the failure
    //    root cause).
    const health = await getHealth();
    expect(
      health.ready,
      `Health endpoint not ready: ${JSON.stringify(health)}`
    ).toBe(true);
    expect(health.checks.META_APP_ID_present).toBe(true);
    expect(health.checks.META_APP_SECRET_present).toBe(true);
    expect(
      health.checks.META_REDIRECT_URI_effective,
      `META_REDIRECT_URI_effective did not match the configured ` +
        `META_REDIRECT_URI (got ${health.checks.META_REDIRECT_URI_effective}, ` +
        `expected ${META_REDIRECT_URI}). Update env or the whitelist.`
    ).toBe(META_REDIRECT_URI);

    // 2. Create the Facebook test user with the OAuth scopes
    //    pre-granted. The consent dialog the test still has to click
    //    is the "this app wants access" confirmation, not a real ask.
    metaTestUser = await createMetaTestUser({
      appId: META_APP_ID,
      appSecret: META_APP_SECRET,
      apiVersion: META_API_VERSION,
      scopes: ["ads_read", "ads_management", "read_insights"]
    });

    // 3. Provision a Supabase user with org + users row + storage
    //    state cookie. The dashboard layout redirects users without
    //    organization_id to /onboarding — that guard must pass too.
    supabaseTestUser = await provisionE2EUser(RUN_TAG);
  });

  test.afterAll(async () => {
    // Cleanup is best-effort. Don't throw — a teardown error masking
    // the real test failure is the worst possible UX.
    if (metaTestUser) {
      await deleteMetaTestUser({
        appId: META_APP_ID,
        appSecret: META_APP_SECRET,
        testUserId: metaTestUser.id,
        apiVersion: META_API_VERSION
      }).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[e2e] teardown FB test user failed: ${msg}`);
      });
    }
    if (supabaseTestUser) {
      await cleanupE2EUser(supabaseTestUser.userId).catch(
        (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[e2e] teardown Supabase user failed: ${msg}`);
        }
      );
    }
  });

  test("full OAuth roundtrip writes a meta_connections row", async ({
    browser
  }) => {
    test.slow(); // 3x the spec's normal timeout — full roundtrip + dialog

    const context = await browser.newContext({
      storageState: supabaseTestUser!.storageState
    });
    const page = await context.newPage();

    // 1. Land on /dashboard while signed in as the test user. The
    //    users+organizations rows we provisioned satisfy the layout
    //    guard — if this lands on /login or /onboarding, the
    //    storageState or the seed rows are wrong. Drift here is the
    //    single biggest signal that @supabase/ssr changed the cookie
    //    name + format, OR that our base64 / domain handling broke.
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard(\?|$)/, { timeout: 30_000 });
    expect(
      page.url(),
      "Session inject must land on /dashboard, not /login. If the url " +
        "redirected away, the storageState cookie name or base64 format " +
        "drifted from what @supabase/ssr 0.12 reads server-side."
    ).toMatch(/\/dashboard(\?|$)/);
    const connectBtn = page.locator("button", { hasText: /^Connect$/ }).first();
    await expect(connectBtn).toBeVisible({ timeout: 30_000 });

    // 2. Auto-authenticate the test user on Facebook via the
    //    pre-authenticated login_url. Wait for facebook.com to
    //    actually commit the cookie before driving the OAuth flow.
    await page.goto(metaTestUser!.loginUrl);
    await page.waitForURL(/facebook\.com/, { timeout: 30_000 });

    // 3. Return to the dashboard and click Connect. The server action
    //    `connectMeta` sets the meta_oauth_state CSRF cookie and
    //    redirects to the OAuth dialog — we wait on the dialog URL
    //    pattern rather than racing on the request-response pair.
    await page.goto("/dashboard");
    await connectBtn.waitFor({ state: "visible", timeout: 30_000 });
    await Promise.all([
      page.waitForURL(/facebook\.com\/.+\/dialog\/oauth/, {
        timeout: 30_000
      }),
      connectBtn.click()
    ]);

    // 4. The dev-mode app + pre-granted permissions show a "Continue"
    //    / "Allow" confirm screen. Try a broad selector set since the
    //    dialog DOM has changed several times; whichever name wins
    //    most recently is left at the head of the list.
    const consentBtn = page
      .locator(
        'form[action*="facebook.com"] button[type="submit"], ' +
          '[role="button"][name="__CONFIRM__"], ' +
          'button[name="__CONFIRM__"], ' +
          'button:has-text("Continue"), ' +
          'button:has-text("Allow"), ' +
          'button:has-text("OK"), ' +
          'button:has-text("Agree"), ' +
          'button:has-text("Yes")'
      )
      .first();
    await consentBtn.waitFor({ state: "visible", timeout: 30_000 });
    await Promise.all([
      page.waitForURL(
        /\/(dashboard\?(meta_connect=ok|meta_connect=failed)|api\/auth\/meta\/callback)/,
        { timeout: 60_000 }
      ),
      consentBtn.click()
    ]);

    // 5. Confirm we ended on the success URL — if this fires, either
    //    the server saw `?error=…`, the state cookie failed to match,
    //    the env validator tripped, or the DB upsert errored. Surface
    //    the breadcrumb toast so the test report isn't a guessing game.
    if (page.url().includes("meta_connect=failed")) {
      const toast = await page
        .locator(
          '[data-meta-action-toast], [role="status"], [role="alert"]'
        )
        .first()
        .textContent({ timeout: 5_000 })
        .catch(() => "<toast not found>");
      throw new Error(
        `Meta OAuth callback returned failure. URL=${page.url()} toast=${toast}`
      );
    }
    expect(page.url()).toMatch(/meta_connect=ok/);

    // 6. Cookies surfaced through the callback. Pull the full cookie
    //    jar from the context (cookies() doesn't follow per-page
    //    redirects here, so context is the right scope).
    const cookies = await context.cookies();
    const findCookie = (name: string): Cookie | undefined =>
      cookies.find((c) => c.name === name);

    expect(
      findCookie("meta_oauth_state"),
      "meta_oauth_state cookie should be cleared after a successful callback"
    ).toBeUndefined();
    expect(
      findCookie("meta_demo"),
      "meta_demo cookie should be cleared after a real OAuth callback (real path is source of truth)"
    ).toBeUndefined();

    // 7. AccountsStrip renders the live Meta Ads pill, no demo pill.
    await expect(page.locator("text=Meta Ads").first()).toBeVisible({
      timeout: 15_000
    });
    expect(
      await page.locator("[data-demo-pill]").count(),
      "data-demo-pill must be absent after a real OAuth connection"
    ).toBe(0);

    // 8. DB assertion — service-role reads the meta_connections row
    //    that the callback wrote. meta_user_id is the Facebook user id
    //    (numeric), access_token is the long-lived ~60-day token
    //    (>100 chars), status = 'active'.
    const db = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { data: row, error: dbErr } = await db
      .from("meta_connections")
      .select(
        "user_id, meta_user_id, meta_user_name, status, access_token, expires_at"
      )
      .eq("user_id", supabaseTestUser!.userId)
      .maybeSingle();
    expect(dbErr, `meta_connections read failed: ${dbErr?.message ?? "?"}`).toBeNull();
    expect(row, "meta_connections row should be written by callback").not.toBeNull();
    expect(row!.meta_user_id, "meta_user_id should match FB test user id").toBe(
      metaTestUser!.id
    );
    expect(row!.status, "meta connection status should be 'active'").toBe(
      "active"
    );
    expect(
      row!.access_token?.length ?? 0,
      "access_token should be long-lived (>100 chars); short-lived (~1-2h) tokens " +
        "indicate the fb_exchange_token step failed"
    ).toBeGreaterThan(100);

    await context.close();
  });
});

interface HealthResponse {
  ready: boolean;
  server_time: string;
  node_env: string;
  checks: {
    META_APP_ID_present: boolean;
    META_APP_ID_length: number;
    META_APP_SECRET_present: boolean;
    META_APP_SECRET_length: number;
    META_REDIRECT_URI_effective: string;
    META_API_VERSION_effective: string;
  };
}

async function getHealth(): Promise<HealthResponse> {
  const url =
    (process.env.E2E_BASE_URL ?? "http://localhost:3000") +
    "/api/health/meta";
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Health endpoint HTTP ${r.status}: ${await r.text()}`);
  }
  return (await r.json()) as HealthResponse;
}
