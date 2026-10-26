// lib/google-ads/client.ts
//
// Read-only Google Ads REST client.
//   - readGoogleAdsEnv(): GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET /
//     GOOGLE_ADS_DEVELOPER_TOKEN / GOOGLE_ADS_REDIRECT_URI.
//   - buildGoogleAdsAuthUrl(state): Google OAuth consent URL. Requests offline
//     access so a refresh token is returned.
//   - exchangeGoogleAdsCode(code) / refreshGoogleAdsToken(refreshToken).
//   - listAccessibleCustomers(accessToken): customer resource names the user
//     can reach.
//   - searchCampaigns(accessToken, customerId): campaigns in one account.
//
// Developer tokens are now tied to a Google Cloud project; the Explorer
// access level is what this client assumes (2,880 operations/day).

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const ADS_API_BASE = "https://googleads.googleapis.com/v25";

export const GOOGLE_ADS_OAUTH_SCOPE =
  "https://www.googleapis.com/auth/adwords";

export type GoogleAdsEnvStatus =
  | {
      ok: true;
      clientId: string;
      clientSecret: string;
      developerToken: string;
      redirectUri: string;
    }
  | {
      ok: false;
      missing: string[];
    };

export function readGoogleAdsEnv(): GoogleAdsEnvStatus {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const redirectUri = process.env.GOOGLE_ADS_REDIRECT_URI;

  const missing: string[] = [];
  if (!clientId) missing.push("GOOGLE_ADS_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_ADS_CLIENT_SECRET");
  if (!developerToken) missing.push("GOOGLE_ADS_DEVELOPER_TOKEN");
  if (!redirectUri) missing.push("GOOGLE_ADS_REDIRECT_URI");

  if (!clientId || !clientSecret || !developerToken || !redirectUri) {
    return { ok: false, missing };
  }
  return { ok: true, clientId, clientSecret, developerToken, redirectUri };
}

export function buildGoogleAdsAuthUrl(state: string): string {
  const env = readGoogleAdsEnv();
  if (!env.ok) throw new Error("Google Ads not configured");
  const params = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: env.redirectUri,
    response_type: "code",
    scope: GOOGLE_ADS_OAUTH_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface GoogleAdsTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type: string;
}

async function postToken(
  body: Record<string, string>
): Promise<GoogleAdsTokenResponse> {
  const env = readGoogleAdsEnv();
  if (!env.ok) throw new Error("Google Ads not configured");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      ...body
    }),
    cache: "no-store"
  });
  const json = (await res.json().catch(() => null)) as
    | (GoogleAdsTokenResponse & { error?: string; error_description?: string })
    | null;
  if (!res.ok || !json || !json.access_token) {
    throw new Error(
      `Google token request failed (${res.status}): ${
        json?.error_description ?? json?.error ?? "no body"
      }`
    );
  }
  return json;
}

export function exchangeGoogleAdsCode(
  code: string
): Promise<GoogleAdsTokenResponse> {
  const env = readGoogleAdsEnv();
  if (!env.ok) throw new Error("Google Ads not configured");
  return postToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.redirectUri
  });
}

export function refreshGoogleAdsToken(
  refreshToken: string
): Promise<GoogleAdsTokenResponse> {
  return postToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
}

function adsHeaders(accessToken: string): Record<string, string> {
  const env = readGoogleAdsEnv();
  if (!env.ok) throw new Error("Google Ads not configured");
  return {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": env.developerToken,
    "Content-Type": "application/json"
  };
}

/** Returns customer resource names such as "customers/1234567890". */
export async function listAccessibleCustomers(
  accessToken: string
): Promise<string[]> {
  const res = await fetch(`${ADS_API_BASE}/customers:listAccessibleCustomers`, {
    headers: adsHeaders(accessToken),
    cache: "no-store"
  });
  const json = (await res.json().catch(() => null)) as
    | { resourceNames?: string[]; error?: { message?: string } }
    | null;
  if (!res.ok || !json) {
    throw new Error(
      `Google Ads listAccessibleCustomers failed (${res.status}): ${
        json?.error?.message ?? "no body"
      }`
    );
  }
  return json.resourceNames ?? [];
}

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  channelType?: string;
}

/** Campaigns under one customer id (digits only, no dashes). */
export async function searchCampaigns(
  accessToken: string,
  customerId: string
): Promise<GoogleAdsCampaign[]> {
  const res = await fetch(
    `${ADS_API_BASE}/customers/${customerId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: adsHeaders(accessToken),
      body: JSON.stringify({
        query:
          "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type FROM campaign ORDER BY campaign.id"
      }),
      cache: "no-store"
    }
  );
  const json = (await res.json().catch(() => null)) as
    | Array<{
        results?: Array<{
          campaign?: {
            id: string;
            name: string;
            status: string;
            advertisingChannelType?: string;
          };
        }>;
      }>
    | null;
  if (!res.ok || !json) {
    throw new Error(`Google Ads campaign search failed (${res.status})`);
  }
  return json.flatMap((chunk) =>
    (chunk.results ?? []).flatMap((r) =>
      r.campaign
        ? [
            {
              id: r.campaign.id,
              name: r.campaign.name,
              status: r.campaign.status,
              channelType: r.campaign.advertisingChannelType
            }
          ]
        : []
    )
  );
}
