// components/influencer/creator-detail-drawer.tsx
//
// "use client" — slide-in right-side drawer driven by URL ?c=<id>.
// URL-as-state means the drawer is deep-linkable: copy & paste the URL
// into Slack and your colleague sees the same creator detail.
//
// Backdrop, ESC-to-close, click-outside-to-close, focus-trap on the
// first interactive element, restored focus on close — all the
// accessibility bits you'd expect from a premium drawer.

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Heart,
  BadgeCheck,
  Sparkles,
  ArrowLeftRight,
  MapPin
} from "lucide-react";
import { formatNaira, formatPercent, formatCompactNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FitScoreRing } from "./fit-score-ring";
import { AudienceDemographicsChart } from "./audience-demographics";
import { ContentMixDonut } from "./content-mix-donut";
import { RoiCalculator } from "./roi-calculator";
import { useShortlist } from "@/lib/influencer/use-shortlist";
import type { ExtendedInfluencer } from "@/lib/influencer/types";
import type { FitBreakdown } from "@/lib/influencer/types";
import {
  CONTENT_KIND_LABEL,
  type ContentKind
} from "@/lib/influencer/types";

function AxisBreakdown({ fit }: { fit: FitBreakdown }) {
  const MAX = {
    audience: 35,
    niche: 30,
    budget: 20,
    geo: 10,
    cadence: 5
  } as const;
  const rows: Array<{ key: keyof typeof MAX; label: string; value: number; max: number }> = [
    { key: "audience", label: "Audience overlap", value: fit.byAxis.audience, max: MAX.audience },
    { key: "niche", label: "Niche adjacency", value: fit.byAxis.niche, max: MAX.niche },
    { key: "budget", label: "Budget fit", value: fit.byAxis.budget, max: MAX.budget },
    { key: "geo", label: "Geo match", value: fit.byAxis.geo, max: MAX.geo },
    { key: "cadence", label: "Momentum", value: fit.byAxis.cadence, max: MAX.cadence }
  ];
  return (
    <ul className="space-y-2" role="list">
      {rows.map((r) => {
        const pct = (r.value / r.max) * 100;
        return (
          <li key={r.key}>
            <div className="flex items-baseline justify-between text-[11px] text-mist-300 mb-0.5">
              <span>{r.label}</span>
              <span className="tabular-nums">
                {Math.round(r.value)}/{r.max}
              </span>
            </div>
            <div className="relative h-1.5 rounded-full bg-mist-50/[0.06] overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CreatorDetailDrawer({
  creators,
  fits
}: {
  creators: ExtendedInfluencer[];
  fits: Record<string, FitBreakdown>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const closeRef = useRef<HTMLButtonElement>(null);
  const { hydrated, toggle, has } = useShortlist();

  const openId = params.get("c");
  const creator = openId ? creators.find((c) => c.id === openId) ?? null : null;
  const fit = creator ? fits[creator.id] ?? null : null;
  const shortlisted = creator ? has(creator.id) : false;

  const isOpen = Boolean(creator && fit);

  // ESC → close.
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    // Focus the close button on open (a11y).
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Lock body scroll while open.
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
    next.delete("c");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <AnimatePresence>
      {isOpen && creator && fit && (
        <motion.div
          key="drawer-root"
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="creator-drawer-title"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close creator details"
            onClick={close}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Panel */}
          <motion.aside
            className="ml-auto h-full w-full max-w-[640px] bg-ink-950 border-l border-mist-50/[0.06] shadow-2xl overflow-y-auto"
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
            {/* Sticky top bar */}
            <header className="sticky top-0 z-10 bg-ink-950/85 backdrop-blur-xl border-b border-mist-50/[0.06] px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-mist-400">
                <Sparkles size={11} aria-hidden className="text-violet-300" />
                Creator profile · {creator.city}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close creator details"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-mist-50/[0.04] hairline text-mist-300 hover:text-mist-50 hover:border-rose-500/40 hover:bg-rose-500/10 tap-press touch-target"
              >
                <X size={14} aria-hidden />
              </button>
            </header>

            <div className="px-5 sm:px-6 py-6 space-y-6">
              {/* Identity */}
              <section className="flex items-start gap-4">
                <div
                  aria-hidden
                  className="relative h-16 w-16 rounded-full bg-brand-gradient flex items-center justify-center text-lg font-semibold text-white shadow-[0_0_18px_-2px_rgba(16,185,129,0.55)]"
                >
                  {creator.avatar}
                  {creator.isVerified && (
                    <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-ink-950">
                      <BadgeCheck size={14} className="text-white" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2
                    id="creator-drawer-title"
                    className="text-xl font-semibold text-mist-50 tracking-tight"
                  >
                    {creator.fullName}
                  </h2>
                  <div className="text-sm text-mist-400 mt-0.5">
                    {creator.handle}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-mist-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={10} aria-hidden />
                      {creator.city}
                    </span>
                    <span aria-hidden>·</span>
                    <span>★ {creator.rating.toFixed(1)}</span>
                    <span aria-hidden>·</span>
                    <span>{formatCompactNumber(creator.followerCount)} followers</span>
                    <span aria-hidden>·</span>
                    <span>{formatPercent(creator.engagementRate, 2)} ER</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {creator.niche.map((n) => (
                      <Badge key={n} tone="neutral">
                        {n}
                      </Badge>
                    ))}
                  </div>
                </div>
                <FitScoreRing score={fit.overall} size="lg" />
              </section>

              {/* Fit breakdown */}
              <section
                className="rounded-xl bg-ink-900/40 hairline p-4"
                aria-label="Why this fits"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-mist-50 inline-flex items-center gap-2">
                    <ArrowLeftRight size={13} aria-hidden className="text-emerald-300" />
                    Why this fits
                  </h3>
                  <span className="text-[11px] uppercase tracking-wider text-mist-500">
                    Composite {fit.overall}/100
                  </span>
                </div>
                <AxisBreakdown fit={fit} />
              </section>

              {/* Audience + Content mix */}
              <section className="grid sm:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-sm font-semibold text-mist-50 mb-3">
                    Audience
                  </h3>
                  <AudienceDemographicsChart audience={creator.audience} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-mist-50 mb-3">
                    Content mix
                  </h3>
                  <ContentMixDonut mix={creator.contentMix} variant="dark" />
                </div>
              </section>

              {/* Sample posts */}
              <section>
                <h3 className="text-sm font-semibold text-mist-50 mb-3">
                  Recent posts
                </h3>
                <ul
                  className="grid grid-cols-3 gap-2"
                  role="list"
                  aria-label="Recent posts"
                >
                  {creator.samplePosts.map((p) => (
                    <li
                      key={p.id}
                      className="aspect-square rounded-lg hairline bg-gradient-to-br from-violet-500/10 to-emerald-500/10 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                      <span aria-hidden className="text-3xl">
                        {p.thumbnailSeed}
                      </span>
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/85 to-transparent px-2 py-1.5 text-[10px]">
                        <span className="block text-mist-200 uppercase tracking-wider">
                          {CONTENT_KIND_LABEL[p.kind as ContentKind]}
                        </span>
                        <span className="block text-mist-50 tabular-nums font-semibold">
                          {formatPercent(p.er, 2)} ER
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* ROI calculator */}
              <RoiCalculator creator={creator} />

              {/* Action row */}
              <div className="sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 bg-ink-950/85 backdrop-blur-xl border-t border-mist-50/[0.06] flex items-center gap-3">
                <div className="text-[11px] text-mist-400">
                  <div className="uppercase tracking-wider">Base price</div>
                  <div className="text-mist-50 font-semibold tabular-nums">
                    {formatNaira(creator.basePrice)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => creator.id && toggle(creator.id)}
                  aria-pressed={hydrated && shortlisted}
                  className={
                    "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold tap-press touch-target " +
                    (hydrated && shortlisted
                      ? "bg-rose-500/15 border border-rose-500/40 text-rose-200 hover:bg-rose-500/25"
                      : "bg-mist-50/[0.04] border border-mist-50/10 text-mist-100 hover:border-emerald-500/40 hover:text-emerald-200")
                  }
                >
                  <Heart
                    size={13}
                    aria-hidden
                    className={hydrated && shortlisted ? "fill-rose-300 text-rose-300" : ""}
                  />
                  {hydrated && shortlisted ? "Shortlisted" : "Shortlist"}
                </button>
                <Button
                  variant="primary"
                  size="md"
                  className="ml-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      `Brief request sent to ${creator.fullName}. (Demo: no email is actually sent.)`
                    );
                  }}
                >
                  Request collaboration
                </Button>
              </div>
            </div>

            <Link
              href="/influencers"
              prefetch={false}
              aria-hidden
              tabIndex={-1}
              className="sr-only"
            />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
