// components/influencer/shortlist-panel.tsx
//
// "use client" — shortlist table. Reads/writes through the
// useShortlist hook (localStorage-backed). The receiving parent
// passes the static `creators` list so we can render rich rows
// without re-fetching.

"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  HeartOff,
  Trash2,
  Send
} from "lucide-react";
import { formatNaira, formatCompactNumber } from "@/lib/utils";
import { useShortlist } from "@/lib/influencer/use-shortlist";
import type { ExtendedInfluencer, FitBreakdown } from "@/lib/influencer/types";
import { FitScoreRing } from "./fit-score-ring";

export function ShortlistPanel({
  creators,
  fits
}: {
  creators: ExtendedInfluencer[];
  fits: Record<string, FitBreakdown>;
}) {
  const { ids, hydrated, toggle, removeAll } = useShortlist();

  const saved = hydrated
    ? creators
        .filter((c) => ids.includes(c.id))
        .sort((a, b) => (fits[b.id]?.overall ?? 0) - (fits[a.id]?.overall ?? 0))
    : [];

  const totalReach = saved.reduce((s, c) => s + c.followerCount, 0);
  const totalSpend = saved.reduce((s, c) => s + c.basePrice, 0);
  const avgFit = saved.length
    ? Math.round(
        saved.reduce((s, c) => s + (fits[c.id]?.overall ?? 0), 0) / saved.length
      )
    : 0;

  return (
    <section
      className="glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up"
      style={{ animationDelay: "200ms" }}
      aria-label="Creator shortlist"
    >
      <header className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-violet-300">
            <Heart size={11} aria-hidden />
            Creator shortlist
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-mist-50">
            {hydrated && saved.length > 0
              ? `${saved.length} creator${saved.length === 1 ? "" : "s"} ready to brief`
              : "Shortlist creators to brief"}
          </h3>
          <p className="mt-1 text-sm text-mist-300">
            Creators you star on the cards above land here. We&apos;ll roll
            them into a single brief email when you&apos;re ready.
          </p>
        </div>
        {hydrated && saved.length > 0 && (
          <button
            type="button"
            onClick={removeAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 tap-press touch-target"
          >
            <Trash2 size={11} aria-hidden />
            Clear
          </button>
        )}
      </header>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <KPI label="Total reach" value={formatCompactNumber(totalReach)} />
        <KPI label="Est. spend" value={formatNaira(totalSpend)} />
        <KPI label="Avg fit" value={`${avgFit}/100`} />
      </div>

      {!hydrated ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg hairline skeleton-shimmer"
              aria-hidden
            />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="rounded-lg border border-dashed border-mist-50/10 p-6 text-center">
          <Heart size={20} aria-hidden className="mx-auto text-mist-500 mb-2" />
          <p className="text-sm text-mist-300">
            No creators shortlisted yet. Tap the heart on any card.
          </p>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          <AnimatePresence initial={false}>
            {saved.map((c) => {
              const fit = fits[c.id];
              if (!fit) return null;
              return (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg bg-ink-900/40 hairline p-3 flex items-center gap-3 hover:border-violet-500/40 transition-colors"
                >
                  <Link
                    href={`/influencers?c=${c.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div
                      aria-hidden
                      className="h-9 w-9 rounded-full bg-brand-gradient flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                    >
                      {c.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-mist-50 truncate">
                        {c.fullName}
                      </div>
                      <div className="text-[11px] text-mist-400 truncate">
                        {c.handle} · {c.city}
                      </div>
                    </div>
                  </Link>
                  <FitScoreRing score={fit.overall} size="sm" />
                  <span className="text-xs text-mist-300 tabular-nums w-24 text-right">
                    {formatNaira(c.basePrice)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(c.id)}
                    aria-label={`Remove ${c.fullName} from shortlist`}
                    title="Remove from shortlist"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-mist-500 hover:text-rose-300 hover:bg-rose-500/10 tap-press touch-target"
                  >
                    <HeartOff size={13} aria-hidden />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {hydrated && saved.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 p-3">
          <div className="text-xs text-mist-200">
            Combined projected reach:{" "}
            <strong className="text-mist-50 tabular-nums">
              {formatCompactNumber(totalReach)}
            </strong>{" "}
            across {saved.length} creators
          </div>
          <button
            type="button"
            onClick={(e) => {
              // Pseudo-CTA — Phase 4 is a prototype so we just flash feedback.
              e.preventDefault();
              const btn = e.currentTarget;
              btn.animate(
                [
                  { transform: "scale(1)" },
                  { transform: "scale(0.96)" },
                  { transform: "scale(1)" }
                ],
                { duration: 200, easing: "ease-out" }
              );
              alert(
                `Brief sent to ${saved.length} creator${saved.length === 1 ? "" : "s"}. (Demo: no email is actually sent.)`
              );
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 hover:border-emerald-400/50 tap-press touch-target"
          >
            <Send size={12} aria-hidden />
            Brief all
          </button>
        </div>
      )}
    </section>
  );
}

function KPI({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-mist-50/[0.04] hairline px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-mist-500">
        {label}
      </div>
      <div className="text-base font-semibold text-mist-50 tabular-nums">
        {value}
      </div>
    </div>
  );
}
