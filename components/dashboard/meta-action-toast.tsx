// components/dashboard/meta-action-toast.tsx
//
// Phase 3.1 — Inline toast rendered at the top of the dashboard page.
// Reads the meta_action_msg flash cookie set by server actions, parses
// it via lib/action-msg.parseMetaActionMsg, then renders a tone-aware
// banner. The cookie has maxAge=30 so it auto-clears on the next render
// without manual cleanup.

import { cookies } from "next/headers";
import { parseMetaActionMsg } from "@/lib/action-msg";

export function MetaActionToast() {
  const raw = cookies().get("meta_action_msg")?.value;
  const msg = parseMetaActionMsg(raw);
  if (!msg) return null;

  const isError = msg.tone === "error";
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        "rounded-xl border px-4 py-2.5 text-sm flex items-start gap-2 " +
        (isError
          ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
          : "bg-naira-500/10 border-naira-500/30 text-naira-200")
      }
    >
      <span
        className={
          "mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold " +
          (isError
            ? "bg-rose-500/30 text-rose-100"
            : "bg-naira-500/30 text-naira-100")
        }
        aria-hidden="true"
      >
        {isError ? "!" : "✓"}
      </span>
      <span className="flex-1">{msg.text}</span>
    </div>
  );
}
