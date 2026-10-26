// lib/snapchat/client.ts
//
// Read-only Snapchat Marketing API client.
//   - readSnapchatEnv(): SNAPCHAT_CLIENT_ID / SNAPCHAT_CLIENT_SECRET /
//     SNAPCHAT_REDIRECT_URI, with a diagnostic shape the health route echoes.
//   - buildSnapchatAuthUrl(state): redirect target for the OAuth dialog.
//   - exchangeSnapchatCode(code) / refreshSnapchatToken(refreshToken):
//     access tokens are valid for 60 minutes, so refresh is required.
//   - fetchSnapchatOrganizations(accessToken): /me/organizations with the
//     ad accounts nested under each organization.
//
// Endpoints follow developers.snap.com/marketing-api/Ads-API/quick-start.

const ACCOUNTS_BASE = "https://accounts.snapchat.com";
const ADS_API_BASE = "https://adsapi.snapchat.com/v1";

export const SNAPCHAT_OAUTH_SCOPE = "snapchat-marketing-api";

export type SnapchatEnvStatus =
  | {
      ok: true;
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    }
  | {
      ok: false;
      missing: string[];
      redirectUri: string | null;
      clientIdSet: boolean;
      clientSecretSet: boolean;
    };

export function readSnapchatEnv(): SnapchatEnvStatus {
  const clientId = process.env.SNAPCHAT_CLIENT_ID;
  const clientSecret = process.env.SNAPCHAT_CLIENT_SECRET;
  const redirectUri = process.env.SNAPCHAT_REDIRECT_URI ?? null;

  const clientIdSet = !!clientId && clientId.length > 0;
  const clientSecretSet = !!clientSecret && clientSecret.length > 0;
  const missing: string[] = [];
  if (!clientIdSet) missing.push("SNAPCHAT_CLIENT_ID");
  if (!clientSecretSet) missing.push("SNAPCHAT_CLIENT_SECRET");
  if (!redirectUri) missing.push("SNAPCHAT_REDIRECT_URI");

  if (missing.length > 0 || !clientId || !clientSecret || !redirectUri) {
    return {
      ok: false,
      missing,
      redirectUri,
      clientIdSet,
      clientSecretSet
    };
  }
  return { ok: true, clientId, clientSecret, redirectUri };
}

export function buildSnapchatAuthUrl(state: string): string {
  const env = readSnapchatEnv();
  if (!env.ok) throw new Error("Snapchat not configured");
  const params = new URLSearchParams({
    client_id: env.clientId,
    redirect_uri: env.redirectUri,
    response_type: "code",
    scope: SNAPCHAT_OAUTH_SCOPE,
    state
  });
  return `${ACCOUNTS_BASE}/login/oauth2/authorize?${params.toString()}`;
}

export interface SnapchatTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

async function postToken(
  body: Record<string, string>
): Promise<SnapchatTokenResponse> {
  const env = readSnapchatEnv();
  if (!env.ok) throw new Error("Snapchat not configured");
  const res = await fetch(`${ACCOUNTS_BASE}/login/oauth2/access_token`, {
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
    | (SnapchatTokenResponse & { error?: string; error_description?: string })
    | null;
  if (!res.ok || !json || !json.access_token) {
    throw new Error(
      `Snapchat token request failed (${res.status}): ${
        json?.error_description ?? json?.error ?? "no body"
      }`
    );
  }
  return json;
}

export function exchangeSnapchatCode(code: string): Promise<SnapchatTokenResponse> {
  const env = readSnapchatEnv();
  if (!env.ok) throw new Error("Snapchat not configured");
  return postToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: env.redirectUri
  });
}

export function refreshSnapchatToken(
  refreshToken: string
): Promise<SnapchatTokenResponse> {
  return postToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
}

export interface SnapchatAdAccount {
  id: string;
  name: string;
  status: string;
  currency?: string;
  timezone?: string;
}

export interface SnapchatOrganization {
  id: string;
  name: string;
  ad_accounts: SnapchatAdAccount[];
}

interface OrganizationsResponse {
  organizations?: Array<{
    organization?: {
      id: string;
      name: string;
      adaccounts?: Array<{ adaccount: SnapchatAdAccount }>;
    };
  }>;
}

export async function fetchSnapchatOrganizations(
  accessToken: string
): Promise<SnapchatOrganization[]> {
  const res = await fetch(
    `${ADS_API_BASE}/me/organizations?with_ad_accounts=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    }
  );
  const json = (await res.json().catch(() => null)) as
    | OrganizationsResponse
    | null;
  if (!res.ok || !json) {
    throw new Error(`Snapchat organizations request failed (${res.status})`);
  }
  return (json.organizations ?? []).flatMap((wrapper) => {
    const org = wrapper.organization;
    if (!org) return [];
    return [
      {
        id: org.id,
        name: org.name,
        ad_accounts: (org.adaccounts ?? []).map((a) => a.adaccount)
      }
    ];
  });
}
