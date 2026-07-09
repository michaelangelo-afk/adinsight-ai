// lib/action-msg.ts
//
// Helper for the meta_action_msg flash cookie used by Phase-3.1 server
// actions to surface success / error feedback after revalidatePath.
// The dashboard renders the cookie value as a toast via
// components/dashboard/meta-action-toast.tsx.

import { cookies } from "next/headers";

export interface MetaActionMsg {
  tone: "success" | "error";
  text: string;
}

const success = (text: string): string =>
  JSON.stringify({ tone: "success", text } satisfies MetaActionMsg);
const error = (text: string): string =>
  JSON.stringify({ tone: "error", text } satisfies MetaActionMsg);

export const setMetaActionMsg = { success, error };

/**
 * Parses the raw cookie value into MetaActionMsg, or null on bad input.
 * Call from a Server Component (cookies() is server-only).
 */
export function parseMetaActionMsg(
  raw: string | undefined
): MetaActionMsg | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as Partial<MetaActionMsg>;
    if (
      (j.tone === "success" || j.tone === "error") &&
      typeof j.text === "string"
    ) {
      return { tone: j.tone, text: j.text };
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Demo-mode cookie — a long-lived boolean flag that lets the dashboard
// show a connected Meta Ads pill without requiring the Supabase / OAuth
// path. Used by the "Try demo" button when the user has no real Meta Ads
// account yet (or env vars aren't configured).
//
// Reads from a Server Component via cookies(). The cookie is intentionally
// httpOnly so a leaked client token cannot synthesize demo state.
// ============================================================================
export const META_DEMO_COOKIE = "meta_demo";
export const META_DEMO_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Returns true when the user has previously clicked Try demo. */
export function parseMetaDemoFlag(raw: string | undefined): boolean {
  return raw === "1";
}

/**
 * Server-side demo-mode guard. Reads the META_DEMO_COOKIE on demand and
 * returns true when the user has clicked Try demo in the dashboard.
 *
 * Centralized so every data-source action routes through the same
 * check — branching on the cookie in app/actions/dashboard.ts and
 * app/actions/recommendations.ts becomes a one-liner, and the cookie
 * name lives in exactly one place.
 *
 * The returned boolean drives:
 *   - The same mock-data set that USE_MOCK_DATA=true already returns
 *     (so the demo path doesn't introduce a third state machine).
 *   - getConnectedAccounts() filtering Meta out of the synthetic
 *     account list to avoid the demo pill double-printing beside a
 *     mock Meta entry.
 *   - Recommendations Apply/Dismiss silently succeeding without
 *     round-tripping to Supabase (cookie reverts to mock on refresh).
 */
export function isDemoMode(): boolean {
  return cookies().get(META_DEMO_COOKIE)?.value === "1";
}
