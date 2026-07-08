// lib/meta/client.ts
//
// Thin wrapper around the Meta Graph API covering the Phase-3 surface:
//   - buildOAuthUrl(state): user gets redirected to Facebook OAuth dialog
//   - exchangeCodeForToken(code): trades a one-time code for a LONG-LIVED
//     user access token (≈60 days). Internally chains short-lived → long-
//     lived exchange — both are required to hit the documented lifetime.
//   - exchangeForLongLivedToken(shortLivedToken): standalone second step
//   - fetchAdAccounts(token): /me/adaccounts
//   - fetchCampaigns(token, accountId): edges in a given ad account
//   - fetchInsights(token, level, id, since, until): aggregate metrics
//   - updateCampaignStatus(token, campaignId, status): ACTIVE / PAUSED
//
// Caller (app/actions/meta.ts + app/api/auth/meta/callback/route.ts) is
// responsible for env validation via readMetaEnv(). The helpers below throw
// on a missing config, mirroring lib/supabase/client.ts.

import { readMetaEnv } from "./env";

const GRAPH_BASE = "https://graph.facebook.com";
const OAUTH_BASE = "https://www.facebook.com";

/** OAuth scopes needed for ad-account read + write + insights. */
export const META_OAUTH_SCOPES = [
  "ads_read",
  "ads_management",
  "read_insights"
] as const;

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency?: string;
  timezone_name?: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "DELETED" | "ARCHIVED";
  objective?: string;
}

export interface MetaInsight {
  date_start: string;
  date_stop: string;
  impressions: string;
  clicks: string;
  spend: string;
  conversions?: string;
}

/** Build the URL the user is redirected to in order to start OAuth. */
export function buildOAuthUrl(
  stateToken: string,
  scopes: readonly string[] = META_OAUTH_SCOPES
): string {
  const env = readMetaEnv();
  if (!env.ok) throw new Error("Meta not configured");
  const params = new URLSearchParams({
    client_id: env.appId,
    redirect_uri: env.redirectUri,
    state: stateToken,
    scope: scopes.join(","),
    response_type: "code"
  });
  return `${OAUTH_BASE}/${env.apiVersion}/dialog/oauth?${params.toString()}`;
}

/**
 * Long-lived token exchange. Chains:
 *   1. code  →  short-lived user token (≈1–2h)
 *   2. short →  long-lived user token (≈60d)
 * The two-step chain is required even with default-app-config — Meta's
 * "Make this app's tokens long-lived" toggle in the app dashboard
 * affects the implicit form behavior, but the documented durable path
 * is the explicit two-step. We always do both so the result is
 * predictable regardless of app config.
 *
 * Throws on missing env OR on either step returning non-2xx.
 */
export async function exchangeCodeForToken(code: string): Promise<MetaTokenResponse> {
  const short = await exchangeCodeForShortLivedToken(code);
  return await exchangeForLongLivedToken(short.access_token);
}

/** Step 1 — code → short-lived user access token. */
async function exchangeCodeForShortLivedToken(code: string): Promise<MetaTokenResponse> {
  const env = readMetaEnv();
  if (!env.ok) throw new Error("Meta not configured");
  const url = new URL(`${GRAPH_BASE}/${env.apiVersion}/oauth/access_token`);
  url.searchParams.set("client_id", env.appId);
  url.searchParams.set("redirect_uri", env.redirectUri);
  url.searchParams.set("client_secret", env.appSecret);
  url.searchParams.set("code", code);
  const r = await fetch(url, { method: "GET", cache: "no-store" });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(
      `Meta short-lived token exchange failed: HTTP ${r.status} ${text.slice(0, 200)}`
    );
  }
  return (await r.json()) as MetaTokenResponse;
}

/** Step 2 — short-lived → long-lived (≈60 days) user access token. */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<MetaTokenResponse> {
  const env = readMetaEnv();
  if (!env.ok) throw new Error("Meta not configured");
  const url = new URL(`${GRAPH_BASE}/${env.apiVersion}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", env.appId);
  url.searchParams.set("client_secret", env.appSecret);
  url.searchParams.set("fb_exchange_token", shortLivedToken);
  const r = await fetch(url, { method: "GET", cache: "no-store" });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(
      `Meta long-lived token exchange failed: HTTP ${r.status} ${text.slice(0, 200)}`
    );
  }
  return (await r.json()) as MetaTokenResponse;
}

/** Fetch the user's Meta ad accounts (after OAuth, used in the callback + Sync). */
export async function fetchAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  const env = readMetaEnv();
  if (!env.ok) throw new Error("Meta not configured");
  const url =
    `${GRAPH_BASE}/${env.apiVersion}/me/adaccounts` +
    `?fields=id,name,account_status,currency,timezone_name` +
    `&access_token=${encodeURIComponent(accessToken)}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Meta ad accounts fetch failed: HTTP ${r.status}`);
  }
  const j = (await r.json()) as { data?: MetaAdAccount[] };
  return j.data ?? [];
}

/** Fetch campaigns in an ad account (status=ACTIVE|PAUSED|... filter optional). */
export async function fetchCampaigns(
  accessToken: string,
  adAccountId: string
): Promise<MetaCampaign[]> {
  const env = readMetaEnv();
  if (!env.ok) throw new Error("Meta not configured");
  const url =
    `${GRAPH_BASE}/${env.apiVersion}/${adAccountId}/campaigns` +
    `?fields=id,name,status,objective` +
    `&access_token=${encodeURIComponent(accessToken)}`;
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    throw new Error(`Meta campaigns fetch failed: HTTP ${r.status}`);
  }
  const j = (await r.json()) as { data?: MetaCampaign[] };
  return j.data ?? [];
}

/** Pause or resume a Meta campaign. */
export async function updateCampaignStatus(
  accessToken: string,
  campaignId: string,
  status: "ACTIVE" | "PAUSED"
): Promise<{ success: boolean }> {
  const env = readMetaEnv();
  if (!env.ok) throw new Error("Meta not configured");
  const url = `${GRAPH_BASE}/${env.apiVersion}/${campaignId}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ status, access_token: accessToken }),
    cache: "no-store"
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(
      `Meta campaign status update failed: HTTP ${r.status} ${text.slice(0, 200)}`
    );
  }
  return (await r.json()) as { success: boolean };
}
