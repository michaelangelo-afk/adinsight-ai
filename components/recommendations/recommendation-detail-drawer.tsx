// components/recommendations/recommendation-detail-drawer.tsx
//
// "use client" — slide-in right-side drawer for a single AI
// recommendation. Mirrors the /influencers drawer pattern: URL ?r=
// is the source of truth; ESC, click-outside, X all close.
//
// Action bar pinned to the bottom: Apply / Mark done / Dismiss
// buttons, each styled for the recommendation's current status. (Phase
// 1 prototypes — sends a flash animation + alert with a friendly
// demo message; production wiring pending.)

"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Sparkles,
  Check,
  XCircle,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FitScoreRing } from "@/components/influencer/fit-score-ring";
import {
  recommendationImpactTone
} from "./recommendation-card";
import { computeSyntheticFit } from "@/components/recommendations/_fit-helper";
import type { Recommendation } from "@/lib/types";

function StatusAffordances({
  recommendation
}: {
  recommendation: Recommendation;
}) {
  const tone = recommendationImpactTone(recommendation.impact);
  const isPending = recommendation.status === "pending";

  function flashDemo(label: string) {
    if (typeof window === "undefined") return;
    alert(`${label} (Demo: no real state change)`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="primary"
        size="md"
        onClick={(e) => {
          e.preventDefault();
          flashDemo("Applied to Ads Manager");
        }}
        disabled={!isPending}
      >
        <Check size={13} aria-hidden />
        Apply now
      </Button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          flashDemo("Marked done");
        }}
        disabled={!isPending}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-mist-50/[0.04] border border-mist-50/10 text-mist-100 hover:border-emerald-500/40 hover:text-emerald-200 tap-press touch-target disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ArrowRight size={12} aria-hidden />
        Mark done
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          flashDemo("Dismissed");
        }}
        disabled={!isPending}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-mist-50/[0.04] border border-mist-50/10 text-mist-300 hover:text-rose-300 hover:border-rose-500/40 tap-press touch-target disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <XCircle size={12} aria-hidden />
        Dismiss
      </button>
    </div>
  );
}

export function RecommendationDetailDrawer({
  recommendations
}: {
  recommendations: Recommendation[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const closeRef = useRef<HTMLButtonElement>(null);

  const openId = params.get("r");
  const recommendation = openId
    ? recommendations.find((r) => r.id === openId) ?? null
    : null;
  const isOpen = Boolean(recommendation);

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  function close() {
    const next = new URLSearchParams(params.toString());
    next.delete("r");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <AnimatePresence>
      {isOpen && recommendation && (
        <motion.div
          key="rec-drawer-root"
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rec-drawer-title"
        >
          <motion.button
            type="button"
            aria-label="Close recommendation details"
            onClick={close}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            className="ml-auto h-full w-full max-w-[600px] bg-ink-950 border-l border-mist-50/[0.06] shadow-2xl overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
              mass: 0.9
            }}
          >
            <header className="sticky top-0 z-10 bg-ink-950/85 backdrop-blur-xl border-b border-mist-50/[0.06] px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-mist-400">
                <Sparkles size={11} aria-hidden className="text-violet-300" />
                AI Recommendation · {recommendation.impact} impact
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close recommendation details"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-mist-50/[0.04] hairline text-mist-300 hover:text-mist-50 hover:border-rose-500/40 hover:bg-rose-500/10 tap-press touch-target"
              >
                <X size={14} aria-hidden />
              </button>
            </header>

            <div className="px-5 sm:px-6 py-6 space-y-6">
              <section>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge tone={recommendation.status === "applied" ? "good" : recommendation.status === "dismissed" ? "bad" : "warn"}>
                    {recommendation.status === "applied" && (
                      <Check size={10} className="mr-1" aria-hidden />
                    )}
                    {recommendation.status === "dismissed" && (
                      <XCircle size={10} className="mr-1" aria-hidden />
                    )}
                    {recommendation.status}
                  </Badge>
                  <Badge tone="neutral">
                    Impact {recommendation.impact}
                  </Badge>
                  {recommendation.campaignId && (
                    <Badge tone="violet">
                      {recommendation.campaignId.replace("c_", "")}
                    </Badge>
                  )}
                </div>
                <h2
                  id="rec-drawer-title"
                  className="text-xl font-semibold text-mist-50 tracking-tight leading-tight"
                >
                  {recommendation.title}
                </h2>
                <p className="mt-2 text-sm text-mist-300 leading-relaxed">
                  {recommendation.body}
                </p>
              </section>

              {/* Confidence + savings */}
              <section className="rounded-xl bg-ink-900/40 hairline p-4">
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-wider text-mist-500 mb-1.5">
                      AI confidence
                    </div>
                    <FitScoreRing
                      score={computeSyntheticFit(recommendation)}
                      size="lg"
                    />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-mist-500">
                      Projected value
                    </div>
                    {recommendation.estimatedSavings ? (
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <TrendingUp
                          size={14}
                          aria-hidden
                          className="text-emerald-300"
                        />
                        <span className="text-2xl font-semibold text-emerald-300 tabular-nums animate-count-up">
                          {formatNaira(recommendation.estimatedSavings)}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-mist-400">
                        No savings estimate
                      </div>
                    )}
                    <div className="mt-2 text-[11px] text-mist-400">
                      Generated{" "}
                      <time dateTime={recommendation.createdAt}>
                        {new Date(recommendation.createdAt).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </time>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action row */}
              <div className="sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 bg-ink-950/85 backdrop-blur-xl border-t border-mist-50/[0.06] flex items-center justify-between gap-3">
                <span className="text-[11px] text-mist-400">
                  {recommendation.status === "pending"
                    ? "Awaiting your action"
                    : `Final state: ${recommendation.status}`}
                </span>
                <StatusAffordances recommendation={recommendation} />
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
