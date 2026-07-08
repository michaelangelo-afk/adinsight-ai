"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface AutoRefreshProps {
  /** Interval in milliseconds. Default: 60_000 (60 seconds). */
  interval?: number;
  /** Whether auto-refresh is enabled. Default: true. */
  enabled?: boolean;
}

/**
 * Wraps dashboard content and calls router.refresh() at the given interval
 * to re-fetch Server Component data without a full page reload.
 *
 * Usage:
 *   <AutoRefresh interval={60_000}>
 *     <MetricsGrid summary={summary} />
 *   </AutoRefresh>
 */
export function AutoRefresh({
  interval = 60_000,
  enabled = true,
  children
}: AutoRefreshProps & { children: React.ReactNode }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      router.refresh();
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interval, enabled, router]);

  return <>{children}</>;
}
