// lib/meta/env.ts
//
// Reads the META_* env vars required to drive Meta OAuth + the Meta Marketing
// API. Mirrors lib/supabase/env.ts so callers can use the same shape:
//   const env = readMetaEnv();
//   if (!env.ok) { showError(formatMetaEnvError(env)); return; }
//   // env.appId / env.appSecret / env.redirectUri / env.apiVersion safe.

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
    };

const VAR_NAMES: Record<"appId" | "appSecret" | "both", string> = {
  appId: "META_APP_ID",
  appSecret: "META_APP_SECRET",
  both: "META_APP_ID and META_APP_SECRET"
};

/** Default redirect URI for local development. In prod this is overridden by META_REDIRECT_URI. */
const DEFAULT_DEV_REDIRECT = "http://localhost:3000/api/auth/meta/callback";

/** Default Meta Graph API version; overrideable via META_API_VERSION. */
const DEFAULT_API_VERSION = "v18.0";

export function readMetaEnv(): MetaEnvStatus {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri =
    process.env.META_REDIRECT_URI ?? DEFAULT_DEV_REDIRECT;
  const apiVersion = process.env.META_API_VERSION ?? DEFAULT_API_VERSION;

  if (!appId && !appSecret) {
    return { ok: false, missing: "both", friendly: VAR_NAMES.both };
  }
  if (!appId) {
    return { ok: false, missing: "appId", friendly: VAR_NAMES.appId };
  }
  if (!appSecret) {
    return {
      ok: false,
      missing: "appSecret",
      friendly: VAR_NAMES.appSecret
    };
  }
  return { ok: true, appId, appSecret, redirectUri, apiVersion };
}

export function formatMetaEnvError(status: {
  ok: false;
  missing: "appId" | "appSecret" | "both";
  friendly: string;
}): string {
  const plural = status.missing === "both";
  const names = status.friendly;
  const value = plural ? "values" : "value";
  const verb = plural ? "are" : "is";
  return (
    `Meta OAuth isn't configured. Add ${names} to .env.local ` +
    `(or your hosting provider's environment-variable settings). ` +
    `Register a Meta app at https://developers.facebook.com and whitelist ` +
    `META_REDIRECT_URI as a Valid OAuth Redirect URI. ` +
    `Then rebuild so the ${value} ${verb} inlined into the server bundle.`
  );
}
