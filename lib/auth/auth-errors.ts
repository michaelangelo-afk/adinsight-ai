/**
 * Turns an auth failure into copy a first-time visitor can act on.
 *
 * Supabase's browser client reports a dead/unreachable backend as a raw
 * `TypeError: Failed to fetch` (Chrome), `NetworkError` (Firefox) or
 * `Load failed` (Safari) — none of which mean anything to a user, and
 * all of which are indistinguishable from "the whole site is broken".
 * Because auth is optional here, the right response is to say so and
 * point at the demo, not to print the exception.
 */
const NETWORK_ERROR =
  /failed to fetch|fetch failed|networkerror|network error|load failed|err_name_not_resolved|err_connection/i;

export function friendlyAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "";

  if (NETWORK_ERROR.test(raw)) {
    return "We can't reach the sign-in service right now. You don't need an account to use GrowthAds — open the demo dashboard and keep exploring.";
  }

  return raw || "Something went wrong. Please try again.";
}
