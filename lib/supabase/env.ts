// lib/supabase/env.ts
//
// IMPORTANT: this file intentionally lives in its own module rather than
// being inlined into lib/supabase/client.ts. Keeping it separate means any
// change to the env-check surface (or the underlying env vars being set
// late on Vercel) forces Webpack to produce a fresh chunk on the next
// build, which is the cache-bust that resolves the failure mode where
// `process.env.NEXT_PUBLIC_*` was inlined as `undefined` in a stale
// chunk. See commit d4ecee4 for the bug this prevents regressing into.

export type SupabaseEnvStatus =
  | { ok: true; url: string; anonKey: string }
  | { ok: false; missing: "url" | "anonKey" | "both" };

const VAR_NAMES: Record<"url" | "anonKey" | "both", string> = {
  url: "NEXT_PUBLIC_SUPABASE_URL",
  anonKey: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  both: "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
};

/**
 * Returns the Supabase browser env as a discriminated union, checking
 * BOTH NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 *
 * On a healthy deploy, Webpack has already inlined both values at build
 * time, so this returns `{ ok: true, url, anonKey }` cheaply. When env
 * vars are missing for the active build target, the failure mode is
 * identified precisely so the caller can format a specific message
 * (UI copy stays out of this module).
 */
export function readSupabaseEnv(): SupabaseEnvStatus {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url && !anonKey) return { ok: false, missing: "both" };
  if (!url) return { ok: false, missing: "url" };
  if (!anonKey) return { ok: false, missing: "anonKey" };
  return { ok: true, url, anonKey };
}

/**
 * Format a host-neutral, user-facing error string for a missing-env
 * status. The `missing` key from `SupabaseEnvStatus` is mapped to a
 * readable var name via `VAR_NAMES` directly above, so adding a new
 * env var is a one-line change in this module.
 */
export function formatEnvError(status: {
  ok: false;
  missing: "url" | "anonKey" | "both";
}): string {
  const plural = status.missing === "both";
  const names = VAR_NAMES[status.missing];
  const value = plural ? "values" : "value";
  const verb = plural ? "are" : "is";
  return (
    `Supabase isn't configured. Missing env: ${names}. ` +
    `Add to .env.local (local dev) or your hosting provider's ` +
    `environment-variable settings (production target), then rebuild ` +
    `so the ${value} ${verb} inlined into the client bundle.`
  );
}
