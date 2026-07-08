import { createBrowserClient } from "@supabase/ssr";
import { readSupabaseEnv, formatEnvError } from "./env";

/**
 * Create a Supabase browser client. In normal operation `readSupabaseEnv`
 * returns `{ ok: true }` and this is a one-liner — Webpack inlined both
 * `NEXT_PUBLIC_*` vars at build time. The throw below is intentionally
 * defensive: callers (e.g. the auth forms) do their own pre-check, so
 * this branch is unreachable in the happy path. Do not delete the
 * pre-check in callers — if you do, this throw becomes the only
 * guard against the env being missing, and its message is then the
 * only UX the user sees for that failure mode.
 */
export function createClient() {
  const env = readSupabaseEnv();
  if (!env.ok) {
    throw new Error(formatEnvError(env));
  }
  return createBrowserClient(env.url, env.anonKey);
}
