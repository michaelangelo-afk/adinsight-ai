// Runtime safety net for the Supabase browser env. NEXT_PUBLIC_* values
// are inlined by Webpack at build time, so on a healthy deploy this
// check returns { ok: true } cheaply. It only fires when the build env
// is missing the var for the active target, in which case the call
// sites surface a runbook pointer instead of letting createClient()
// throw an opaque auth error.
export type EnvCheck = { ok: true } | { ok: false; reason: string };

export function assertSupabaseConfigured(): EnvCheck {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return {
      ok: false,
      reason: `Supabase isn't configured. Set NEXT_PUBLIC_SUPABASE_URL in .env.local (local dev) or your hosting provider's environment-variable settings (production target), then rebuild so the value gets inlined into the client bundle.`,
    };
  }
  return { ok: true };
}
