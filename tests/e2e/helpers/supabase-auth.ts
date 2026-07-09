/**
 * Supabase test-user + organization lifecycle helpers.
 *
 * The OAuth callback route requires the user to be signed in to
 * Supabase (it redirects to /login if `auth.getUser()` is null) and
 * the dashboard layout redirects users without a `users.organization_id`
 * to /onboarding — both gates can deny the test if the side-effects
 * below aren't in lockstep.
 *
 * The flow:
 *   1. admin.auth.admin.createUser({ email, password, email_confirm })
 *      — skips the email-confirmation round-trip.
 *   2. INSERT into `organizations` + `users` matching the auth row's
 *      id, with a UUID `organization_id` so the dashboard layout's
 *      `!user.profile?.organization_id` guard passes.
 *   3. anon auth.signInWithPassword() — what the browser would do.
 *   4. Convert the resulting session into a Playwright `storageState`
 *      cookie matching the `sb-{projectRef}-auth-token` shape the
 *      @supabase/ssr middleware reads.
 *
 * Cleanup deletes in reverse order (FK cascade is the safety net).
 */
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Cookie } from "@playwright/test";

const PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const PROJECT_REF =
  PROJECT_URL.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1] ??
  PROJECT_URL.match(/^https:\/\/([^.]+)\.supabase\.in/)?.[1] ??
  PROJECT_URL.match(/^https:\/\/([^.]+)\.supabase\.net/)?.[1] ??
  "";

export const E2E_PREREQS = {
  ready: !!(PROJECT_URL && SERVICE_KEY && ANON_KEY && PROJECT_REF),
  missing: [
    !PROJECT_URL && "NEXT_PUBLIC_SUPABASE_URL",
    !PROJECT_REF &&
      "NEXT_PUBLIC_SUPABASE_URL (must be https://<ref>.supabase.co)",
    !SERVICE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
    !ANON_KEY && "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  ].filter((s): s is string => !!s)
};

export interface E2ETestUser {
  userId: string;
  email: string;
  password: string;
  organizationId: string;
  /** Playwright storageState — pass to `browser.newContext({ storageState })`. */
  storageState: {
    cookies: Array<Cookie>;
    origins: Array<{
      origin: string;
      localStorage: Array<{ name: string; value: string }>;
    }>;
  };
}

function randomTag(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function randomPassword(): string {
  return `e2e-${Math.random().toString(36).slice(2, 12)}-${Date.now()}`;
}

/**
 * Provision (create user + org + users row + sign in) the test
 * fixture for one OAuth roundtrip. Returns a storage state that the
 * spec injects into the Playwright browser context so we don't have
 * to drive the /login UI.
 */
export async function provisionE2EUser(
  tag: string = randomTag()
): Promise<E2ETestUser> {
  if (!E2E_PREREQS.ready) {
    throw new Error(
      `Cannot provision E2E user — missing env: ${E2E_PREREQS.missing.join(", ")}`
    );
  }
  const email = `${tag}@growthads-e2e.local`;
  const password = randomPassword();

  const admin = createSupabaseClient(PROJECT_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // 1. auth.users row, with email_confirm so signInWithPassword works
  //    without first verifying an emailed link.
  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email,
      password,
      email_confirm: true,
      user_metadata: { e2e: true, tag }
    }
  );
  if (createErr || !created.user) {
    throw new Error(
      `Supabase admin.createUser failed: ${createErr?.message ?? "unknown"}`
    );
  }
  const userId = created.user.id;

  // 2. organization + users row. Schema enforces NOT NULL on
  //    organizations.name and users.full_name — we set both above.
  const orgId = crypto.randomUUID();
  const { error: orgErr } = await admin.from("organizations").insert({
    id: orgId,
    name: "E2E Test Org",
    monthly_ad_budget: 0,
    primary_objective: "conversions"
  });
  if (orgErr) {
    throw new Error(
      `Supabase organizations.insert failed: ${orgErr.message}`
    );
  }
  const { error: userErr } = await admin.from("users").insert({
    id: userId,
    organization_id: orgId,
    role: "admin",
    full_name: "E2E Test User",
    phone: null,
    avatar: null
  });
  if (userErr) {
    throw new Error(`Supabase users.insert failed: ${userErr.message}`);
  }

  // 3. Sign in via the anon client (what the browser would do).
  const authClient = createSupabaseClient(PROJECT_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: signInData, error: signInErr } =
    await authClient.auth.signInWithPassword({ email, password });
  if (signInErr || !signInData.session) {
    throw new Error(
      `Supabase signInWithPassword failed: ${
        signInErr?.message ?? "no session"
      }`
    );
  }

  // 4. Session → Playwright cookie. Derive the baseURL's hostname so
  //    the cookie's domain matches what the browser will send —
  //    wrong domain is the #1 silent cause of "session injected but
  //    callback still sees no user" in Playwright + Supabase setups.
  const baseUrl = new URL(
    process.env.E2E_BASE_URL ?? "http://localhost:3000"
  );
  const cookieDomain = baseUrl.hostname;
  const session = signInData.session;
  const expiresIn = session.expires_in ?? 3600;
  const expiresAt =
    session.expires_at ?? Math.floor(Date.now() / 1000) + expiresIn;

  const tokenCookie = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: expiresIn,
    expires_at: expiresAt,
    token_type: "bearer",
    user: signInData.user
  });

  // @supabase/ssr 0.12 stores the auth-token cookie as
  //   base64(JSON.stringify(session))
  // and the server-side cookie reader in `createServerClient` calls
  // `Buffer.from(value, 'base64').toString()` then `JSON.parse`. If we
  // write raw JSON the reader's primary decode fails and the fallback
  // path may or may not match depending on payload shape — sources of
  // the silent "session inject reached the browser but the callback
  // still sees no user" failure mode. Encode as base64 to match the
  // canonical format the browser SDK writes itself.
  const tokenCookieBase64 = Buffer.from(tokenCookie, "utf-8").toString(
    "base64"
  );

  const cookieName = `sb-${PROJECT_REF}-auth-token`;

  const cookie: Cookie = {
    name: cookieName,
    value: tokenCookieBase64,
    domain: cookieDomain,
    path: "/",
    expires: -1,
    httpOnly: false,
    secure: false,
    sameSite: "Lax"
  };

  return {
    userId,
    email,
    password,
    organizationId: orgId,
    storageState: {
      cookies: [cookie],
      origins: []
    }
  };
}

/**
 * Delete the test user's Supabase rows + the auth.users row.
 * `meta_connections` has FK ON DELETE CASCADE to auth.users on
 * user_id, but we explicitly delete first to keep the deletion
 * atomic + visible in Supabase logs.
 */
export async function cleanupE2EUser(userId: string): Promise<void> {
  if (!E2E_PREREQS.ready) return;
  const admin = createSupabaseClient(PROJECT_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  await admin.from("meta_connections").delete().eq("user_id", userId);
  await admin.from("meta_accounts").delete().eq("user_id", userId);
  await admin.from("meta_campaigns").delete().eq("user_id", userId);
  await admin.from("users").delete().eq("id", userId);
  const { data: u } = await admin
    .from("users")
    .select("organization_id")
    .eq("id", userId)
    .maybeSingle();
  if (u?.organization_id) {
    await admin.from("organizations").delete().eq("id", u.organization_id);
  }
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    // Don't throw — tests have already passed/failed by this point
    // and we don't want cleanup noise to mask the real result.
    console.warn(`[e2e] cleanup admin.deleteUser(${userId}): ${error.message}`);
  }
}
