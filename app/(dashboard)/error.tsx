"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Logo } from "@/components/brand/logo";

/**
 * Dashboard error boundary.
 *
 * Catches errors thrown by the async Server Component (most likely a
 * Supabase misconfiguration: missing env vars, RLS policy failure, or
 * backend timeout).
 */
export default function DashboardError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-ink-950">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo showWordmark={false} />
        </div>

        <div className="rounded-2xl glass-card p-8 shadow-card-elevated-dark">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/15 border border-rose-500/30 mb-4">
            <AlertTriangle size={20} className="text-rose-400" />
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-mist-50">
            Dashboard failed to load
          </h1>
          <p className="mt-2 text-sm text-mist-300 leading-relaxed">
            Your dashboard hit a snag pulling live data from Supabase. The
            most common cause is a missing env var or a freshly-provisioned
            project with no data yet.
          </p>

          {/* Note: We deliberately do NOT render the raw error.message here
              — it can leak Supabase URLs, JWT fragments, or table names. The
              full error is logged server-side via the console.error above
              and is also stored under error.digest (above). */}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 shadow-glow-emerald transition-all duration-200"
            >
              <RefreshCw size={14} />
              Retry
            </button>
            <a
              href="https://supabase.com/dashboard/project/dyfeolrotkjmeauiknbx"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-mist-50/[0.04] hairline px-4 py-2.5 text-sm font-medium text-mist-200 hover:bg-mist-50/[0.08] transition-colors"
            >
              Open Supabase dashboard
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
