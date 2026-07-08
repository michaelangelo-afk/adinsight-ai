// app/actions/meta.ts
//
// Phase 3.1 server actions for the Meta Marketing API integration.
//
// Three actions + one typed-result helper:
//   1) connectMeta      — Sets a CSRF state cookie + redirects to Facebook's
//                         OAuth dialog. Called from the <Connect> button.
//                         Has no return path; the OAuth callback writes the
//                         meta_connections row and revalidates /dashboard.
//   2) syncInsights     — Re-fetches insights for all accounts under the
//                         user's meta_connections row. Form-action variant
//                         returns Promise<void> + writes a meta_action_msg
//                         flash cookie so the dashboard can toast the result.
//   3) updateCampaign   — Pause / resume a single campaign. Form-action
//                         variant returns Promise<void> + same flash pattern.
//   4) disconnectMeta   — Marks the connection status=revoked AND clears the
//                         access_token + refresh_token columns at rest so the
//                         audit row is inert. No Meta API revoke call yet —
//                         the next expiry will invalidate on Meta's side.

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

import { readMetaEnv, formatMetaEnvError } from "@/lib/meta/env";
import {
  buildOAuthUrl,
  fetchAdAccounts,
  updateCampaignStatus
} from "@/lib/meta/client";
import {
  getMyMetaConnectionWithSecrets,
  upsertMyMetaConnection,
  disconnectMyMetaConnection
} from "@/lib/supabase/meta-connections";

import { createServiceClient } from "@/lib/supabase/server";
import { setMetaActionMsg } from "@/lib/action-msg";

/** CSRF state cookie name + max-age (10 minutes is plenty for OAuth). */
const STATE_COOKIE = "meta_oauth_state";
const STATE_MAX_AGE = 600;

/**
 * Recognizable demo-account identifiers so a future real OAuth upsert
 * can clearly tell demo vs production. The meta_user_id stays stable
 * across re-connects so the user's existing dashboard demo state is
 * preserved until they swap to a real Meta account.
 */
const DEMO_META_USER_ID = "demo-account-lagos-bites";
const DEMO_META_USER_NAME = "Demo Ad Account";

/**
 * Internal result type. Form-action exports return Promise<void> because
 * a form action must satisfy `void | Promise<void>` per React DOM types.
 * We surface every meaningful outcome via the meta_action_msg flash
 * cookie that the dashboard's MetaActionToast reads on render.
 */
export type MetaActionResult =
  | { ok: true }
  | { ok: false; reason: string; friendly: string };

/** Step 1 of the OAuth flow. Sets state cookie + redirects to Facebook. */
export async function connectMeta(): Promise<never> {
  const env = readMetaEnv();
  if (!env.ok) {
    cookies().set("meta_action_msg", setMetaActionMsg.error(formatMetaEnvError(env)), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 30,
      path: "/"
    });
    redirect("/dashboard?meta_connect=failed");
  }
  const state = crypto.randomBytes(24).toString("hex");
  cookies().set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: STATE_MAX_AGE,
    path: "/"
  });
  redirect(buildOAuthUrl(state));
}

/** Form-action wrapper around syncInsightsImpl — returns Promise<void>. */
export async function syncInsights(): Promise<void> {
  const r = await syncInsightsImpl();
  if (r.ok) {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.success("Meta accounts synced."),
      { httpOnly: true, sameSite: "lax", maxAge: 30, path: "/" }
    );
  } else {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.error(r.friendly),
      { httpOnly: true, sameSite: "lax", maxAge: 30, path: "/" }
    );
  }
  revalidatePath("/dashboard");
}

/**
 * Internal: returns typed result. Caller (syncInsights) translates that
 * to a flow that satisfies React form-action signature.
 */
async function syncInsightsImpl(): Promise<MetaActionResult> {
  const env = readMetaEnv();
  if (!env.ok) {
    return {
      ok: false,
      reason: env.missing,
      friendly: formatMetaEnvError(env)
    };
  }
  const conn = await getMyMetaConnectionWithSecrets();
  if (!conn || conn.status !== "active") {
    return {
      ok: false,
      reason: "no_connection",
      friendly:
        "Connect your Meta ad account first, then Sync will pull the latest insights."
    };
  }
  if (conn.access_token === null) {
    return {
      ok: false,
      reason: "missing_token",
      friendly:
        "Meta connection record is missing an access token. Please reconnect."
    };
  }
  if (new Date(conn.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      reason: "expired_token",
      friendly:
        "Meta access token has expired. Please reconnect from the Connect button."
    };
  }
  try {
    const accounts = await fetchAdAccounts(conn.access_token);
    const service = createServiceClient();
    for (const a of accounts) {
      await service.from("meta_accounts").upsert(
        {
          user_id: conn.user_id,
          meta_account_id: a.id,
          name: a.name,
          account_status: a.account_status,
          currency: a.currency ?? null,
          is_active: a.account_status === 1,
          last_synced_at: new Date().toISOString()
        },
        { onConflict: "user_id,meta_account_id" }
      );
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: "meta_api_error",
      friendly: err instanceof Error ? err.message : "Meta sync failed"
    };
  }
}

/** Pause / resume a single campaign — form-action wrapper around the impl. */
export async function updateCampaign(
  metaCampaignId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<void> {
  const r = await updateCampaignImpl(metaCampaignId, status);
  if (r.ok) {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.success(
        status === "PAUSED"
          ? `Campaign paused on Meta.`
          : `Campaign resumed on Meta.`
      ),
      { httpOnly: true, sameSite: "lax", maxAge: 30, path: "/" }
    );
  } else {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.error(r.friendly),
      { httpOnly: true, sameSite: "lax", maxAge: 30, path: "/" }
    );
  }
  revalidatePath("/dashboard");
}

async function updateCampaignImpl(
  metaCampaignId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<MetaActionResult> {
  const env = readMetaEnv();
  if (!env.ok) {
    return {
      ok: false,
      reason: env.missing,
      friendly: formatMetaEnvError(env)
    };
  }
  const conn = await getMyMetaConnectionWithSecrets();
  if (!conn || conn.status !== "active") {
    return {
      ok: false,
      reason: "no_connection",
      friendly: "Connect your Meta ad account to pause/resume campaigns."
    };
  }
  if (conn.access_token === null) {
    return {
      ok: false,
      reason: "missing_token",
      friendly: "Meta connection is missing a token — please reconnect."
    };
  }
  try {
    await updateCampaignStatus(conn.access_token, metaCampaignId, status);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: "meta_api_error",
      friendly: err instanceof Error ? err.message : "Meta update failed"
    };
  }
}

/**
 * Demo connect — upserts a recognizable demo row into meta_connections
 * with synthetic scopes + a clearly-fake token. No real Meta API call.
 * The user_id unique constraint means a real OAuth callback later
 * simply overwrites the demo row, so the friend-test scenario tomorrow
 * transitions cleanly.
 *
 * Demo vs production distinction:
 *   - meta_user_id is "demo-account-lagos-bites" (recognizable)
 *   - access_token is "demo:<uuid>" (obvious sentinel)
 *   - No readMetaEnv() check — demo mode intentionally bypasses env
 *     validation so users without META_APP_ID set can still preview
 *     the connected-state UI.
 */
export async function connectDemoMeta(): Promise<void> {
  try {
    await upsertMyMetaConnection({
      meta_user_id: DEMO_META_USER_ID,
      meta_user_name: DEMO_META_USER_NAME,
      access_token: `demo:${crypto.randomUUID()}`,
      refresh_token: null,
      // 30-day window — long enough that it won't brown out before the
      // user reconnects with real OAuth.
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      scopes: ["ads_management", "ads_read"]
    });
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.success(
        "Demo Meta account connected. (No real data — connect Meta Ads for live insights.)"
      ),
      { httpOnly: true, sameSite: "lax", maxAge: 30, path: "/" }
    );
  } catch (err) {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.error(
        err instanceof Error ? err.message : "Demo connect failed"
      ),
      { httpOnly: true, sameSite: "lax", maxAge: 30, path: "/" }
    );
  }
  revalidatePath("/dashboard");
}

/** Disconnect — clears tokens at rest + sets status=revoked. */
export async function disconnectMeta(): Promise<void> {
  try {
    await disconnectMyMetaConnection();
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.success("Meta account disconnected."),
      { httpOnly: true, sameSite: "lax", maxAge: 30, path: "/" }
    );
  } catch (err) {
    cookies().set(
      "meta_action_msg",
      setMetaActionMsg.error(
        err instanceof Error ? err.message : "Disconnect failed"
      ),
      { httpOnly: true, sameSite: "lax", maxAge: 30, path: "/" }
    );
  }
  revalidatePath("/dashboard");
}
