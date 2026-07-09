// lib/meta/env.ts
//
// Reads the META_* env vars required to drive Meta OAuth + the Meta
// Marketing API. Returns either an ok: true shape with all the values
// we need, or a diagnostic-rich ok: false shape that the connect-action
// toasts verbatim AND the /api/health/meta endpoint echoes.
//
// The error message NO LONGER says "rebuild so the values are inlined
// into the server bundle" — Next.js 15 server actions + route handlers
// read process.env at request time, not at build time. There is no
// "inlining" to do, and that wording was misleading operators into
// confused rebuilds / restarts. The error now lists what we actually
// detected + names the active redirect URI so URI mismatches are
// immediately visible.

export type MetaEnvStatus =
  | {
      ok: true;
      appId: string;
      appSecret: string;
      redirectUri: string;
      apiVersion: string;
    }
  | {
      ok: false;
      missing: "appId" | "appSecret" | "both";
      friendly: string;
      /** Always populated so the error can name the active redirect URI. */
      redirectUri: string;
      /** Diagnostic booleans so the operator can tell which vars the
       *  Node.js runtime actually sees (without leaking the values). */
      appIdSet: boolean;
      appSecretSet: boolean;
    };

const VAR_NAMES: Record<"appId" | "appSecret" | "both", string> = {
  appId: "META_APP_ID",
  appSecret: "META_APP_SECRET",
  both: "META_APP_ID and META_APP_SECRET"
};

/** Default redirect URI for local development. */
const DEFAULT_DEV_REDIRECT = "http://localhost:3000/api/auth/meta/callback";

/** Default Meta Graph API version. */
const DEFAULT_API_VERSION = "v18.0";

export function readMetaEnv(): MetaEnvStatus {
  const appIdRaw = process.env.META_APP_ID;
  const appSecretRaw = process.env.META_APP_SECRET;
  const redirectUri = process.env.META_REDIRECT_URI ?? DEFAULT_DEV_REDIRECT;
  const apiVersion = process.env.META_API_VERSION ?? DEFAULT_API_VERSION;

  const appIdSet = !!appIdRaw && appIdRaw.length > 0;
  const appSecretSet = !!appSecretRaw && appSecretRaw.length > 0;

  if (!appIdSet && !appSecretSet) {
    return {
      ok: false,
      missing: "both",
      friendly: VAR_NAMES.both,
      redirectUri,
      appIdSet,
      appSecretSet
    };
  }
  if (!appIdSet) {
    return {
      ok: false,
      missing: "appId",
      friendly: VAR_NAMES.appId,
      redirectUri,
      appIdSet,
      appSecretSet
    };
  }
  if (!appSecretSet) {
    return {
      ok: false,
      missing: "appSecret",
      friendly: VAR_NAMES.appSecret,
      redirectUri,
      appIdSet,
      appSecretSet
    };
  }
  return {
    ok: true,
    appId: appIdRaw!,
    appSecret: appSecretRaw!,
    redirectUri,
    apiVersion
  };
}

export function formatMetaEnvError(status: {
  ok: false;
  missing: "appId" | "appSecret" | "both";
  friendly: string;
  redirectUri: string;
  appIdSet: boolean;
  appSecretSet: boolean;
}): string {
  return (
    `Meta OAuth isn't configured. Add ${status.friendly} to .env.local ` +
    `(or your hosting provider's environment-variable settings). ` +
    `Register a Meta app at https://developers.facebook.com and whitelist ` +
    `${status.redirectUri} as a Valid OAuth Redirect URI. ` +
    `Server detected — META_APP_ID: ${status.appIdSet ? "set" : "(empty)"}, ` +
    `META_APP_SECRET: ${status.appSecretSet ? "set" : "(empty)"}. ` +
    `If both look set, restart \`npm run dev\` so Next.js reloads .env.local. ` +
    `Verify with GET /api/health/meta. ` +
    `Note: the redirect URI above must be reachable from Meta's servers — ` +
    `localhost only works if your dev server is reachable from the open ` +
    `internet. If you're on a VPD / SSH / cloud sandbox, run ` +
    `\`ngrok http 3000\` (see docs/friend-test.md §9), then paste the ` +
    `public HTTPS URL here AND in your Meta app's Valid OAuth Redirect URIs.`
  );
}
