// app/api/auth/meta/callback/route.ts
//
// Phase 3.1 Meta OAuth completion endpoint.
//
// Facebook redirects here from the dialog with:
//   ?code=…&state=…  (success)
//   ?error=…&state=… (user denied)
//
// The route handler:
//   1. Reads + clears the meta_oauth_state cookie; rejects mismatches.
//   2. Verifies the signed-in user; rejects if anonymous.
//   3. Exchanges `code` for a LONG-LIVED token via lib/meta/client.
//      exchangeCodeForToken now chains short-lived → long-lived
//      (≈60 days) — without the second step the token expires in
//      ~1–2 hours and Sync would constant-fail with expired_token.
//   4. Fetches the user's Meta ad accounts once for scope verification.
//   5. Upserts the meta_connections row via the service-role client.
//   6. Redirects to /dashboard?meta_connect=ok (or =failed with the
//      unified meta_action_msg flash cookie consumed by MetaActionToast).

// Belt-and-braces: explicitly force this route to evaluate on every
// request, never at build time. cookies()/headers() inherited below
// already trigger dynamic rendering, but declare it explicitly so a
// future refactor doesn't accidentally strip the only dynamic
// signal — without these, a static prerender pass that evaluated
// `readMetaEnv()` with empty META_APP_ID could cache a permanent
// "not configured" failure that survives adding env vars.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readMetaEnv, formatMetaEnvError } from "@/lib/meta/env";
import {
  exchangeCodeForToken,
  fetchAdAccounts,
  fetchMe,
  META_OAUTH_SCOPES
} from "@/lib/meta/client";
import { upsertMyMetaConnection } from "@/lib/supabase/meta-connections";
import { setMetaActionMsg, META_DEMO_COOKIE } from "@/lib/action-msg";

const STATE_COOKIE = "meta_oauth_state";
const FLASH_MAX_AGE = 30;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const cookieStore = cookies();

  const flashError = (text: string, redirectTo: string) => {
    // httpOnly: true — these are read only by Server Components, never
    // by client JS. Defense-in-depth against trivial exfil via XSS.
    cookieStore.set("meta_action_msg", setMetaActionMsg.error(text), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: FLASH_MAX_AGE,
      path: "/"
    });
    return NextResponse.redirect(new URL(redirectTo, req.url));
  };
  const flashSuccess = (text: string, redirectTo: string) => {
    cookieStore.set("meta_action_msg", setMetaActionMsg.success(text), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: FLASH_MAX_AGE,
      path: "/"
    });
    return NextResponse.redirect(new URL(redirectTo, req.url));
  };

  // ---- 1. Surface user-denied errors from Facebook ----
  if (errorParam) {
    return flashError(
      `Meta denied: ${errorParam}`,
      "/dashboard?meta_connect=failed"
    );
  }
  if (!code || !state) {
    return flashError(
      "Meta OAuth callback missing code or state.",
      "/dashboard?meta_connect=failed"
    );
  }

  // ---- 2. CSRF state cookie check (single-use; always cleared) ----
  const expected = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);
  if (!expected || expected !== state) {
    return flashError(
      "Meta OAuth state mismatch — possible CSRF.",
      "/dashboard?meta_connect=failed"
    );
  }

  // ---- 3. Env + auth checks ----
  const env = readMetaEnv();
  if (!env.ok) {
    return flashError(formatMetaEnvError(env), "/dashboard?meta_connect=failed");
  }

  const anon = createClient();
  const {
    data: { user }
  } = await anon.auth.getUser();
  if (!user) {
    cookieStore.set(
      "meta_action_msg",
      setMetaActionMsg.error(
        "Sign in to your GrowthAds account first, then reconnect Meta."
      ),
      { httpOnly: true, sameSite: "lax", maxAge: FLASH_MAX_AGE, path: "/" }
    );
    return NextResponse.redirect(new URL("/login?next=/dashboard", req.url));
  }

  // ---- 4. Code → long-lived user access token ----
  let token;
  try {
    token = await exchangeCodeForToken(code);
  } catch (err) {
    return flashError(
      err instanceof Error ? err.message : "Token exchange failed",
      "/dashboard?meta_connect=failed"
    );
  }

  // ---- 5. Resolve the Meta USER id + display name via /me ----
  // The previous code used `accounts[0].id.split("_")[0]` but that
  // just returns the literal string "act" — Meta ad-account ids are
  // formatted `act_<digits>`; the user-id half is only on /me.
  // /me also returns the display name we want to keep in
  // meta_connections.meta_user_name (so the AccountsStrip and any
  // future "Connected as: <name>" UI can show it).
  let metaUserId: string | null = null;
  let metaUserName: string | null = null;
  try {
    const me = await fetchMe(token.access_token);
    metaUserId = me.id;
    metaUserName = me.name;
  } catch {
    // Non-fatal: fall through to write the row with sentinel id.
    metaUserId = null;
    metaUserName = null;
  }

  // ---- 5b. Verify scopes by hitting /me/adaccounts once ----
  // Failure is non-fatal — we keep the connection row regardless
  // and let the next sync attempt surface a real ad-accounts error.
  try {
    await fetchAdAccounts(token.access_token);
  } catch {
    /* non-fatal */
  }

  // ---- 6. Persist via service role (bypasses RLS) ----
  try {
    await upsertMyMetaConnection({
      meta_user_id: metaUserId ?? "unknown",
      meta_user_name: metaUserName,
      access_token: token.access_token,
      expires_at: new Date(Date.now() + token.expires_in * 1000).toISOString(),
      scopes: [...META_OAUTH_SCOPES]
    });
  } catch (err) {
    return flashError(
      err instanceof Error
        ? `Failed to store Meta connection: ${err.message}`
        : "Failed to store Meta connection",
      "/dashboard?meta_connect=failed"
    );
  }

  // ---- 7. Clear the demo flag if it lingered — the real OAuth path
  // is now the source of truth. Without this clear, AccountsStrip
  // would render BOTH the synthetic Demo pill AND the real Meta Ads
  // pill side-by-side after the friend-test tomorrow. ----
  cookieStore.delete(META_DEMO_COOKIE);

  // ---- 8. Success redirect — MetaActionToast on the next render picks
  // up the meta_action_msg cookie below. ----
  return flashSuccess(
    "Meta account connected.",
    "/dashboard?meta_connect=ok"
  );
}
