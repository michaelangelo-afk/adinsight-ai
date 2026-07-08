// lib/action-msg.ts
//
// Helper for the meta_action_msg flash cookie used by Phase-3.1 server
// actions to surface success / error feedback after revalidatePath.
// The dashboard renders the cookie value as a toast via
// components/dashboard/meta-action-toast.tsx.

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
