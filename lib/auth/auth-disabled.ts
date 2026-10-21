/**
 * Auth is OPTIONAL by default — every page is browsable without a
 * login or sign-up.
 *
 * Set `NEXT_PUBLIC_REQUIRE_AUTH=true` to put the `/login` gate back.
 * While auth is optional:
 *
 *   - `lib/supabase/middleware.ts` never redirects to /login.
 *   - `app/(dashboard)/layout.tsx` never redirects to /login or
 *     /onboarding.
 *   - `isDemoMode()` in `lib/action-msg.ts` returns true, so every data
 *     action serves the mock-data set instead of throwing
 *     "Not authenticated" / "No organization found".
 *   - `POST /api/onboarding` accepts a submission and returns a demo
 *     result instead of 401.
 *
 * It must be a `NEXT_PUBLIC_` variable because middleware is bundled for
 * the edge runtime, where only public env vars are inlined at build time.
 * Values are inlined during `next build`, so flip the flag and rebuild
 * (restart `next dev`).
 */
export function isAuthDisabled(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_AUTH !== "true";
}
