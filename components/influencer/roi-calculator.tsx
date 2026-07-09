// components/influencer/roi-calculator.tsx
//
// "use client" — interactive budget slider inside the creator detail
// drawer. Computes projected reach + cost-per-reach live as the user
// drags the budget.

"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { formatNaira, formatCompactNumber } from "@/lib/utils";
import type { ExtendedInfluencer } from "@/lib/influencer/types";
import { projectedMediaValue, projectedReach } from "@/lib/influencer/compare-to-ads";
import { TrendingUp, Sparkles } from "lucide-react";

const BUDGET_TIERS = [50_000, 100_000, 200_000, 350_000, 500_000] as const;

export function RoiCalculator({
  creator
}: {
  creator: ExtendedInfluencer;
}) {
  const id = useId();
  const [budget, setBudget] = useState<number>(200_000);

  const stats = useMemo(() => {
    const reach = projectedReach(creator, budget);
    const cpmByReach = reach > 0 ? Math.round((budget / reach) * 1000 * 100) / 100 : 0;
    const mediaValue = projectedMediaValue(creator, budget);
    const roiMult = budget > 0 ? mediaValue / budget : 0;
    return { reach, cpmByReach, mediaValue, roiMult };
  }, [creator, budget]);

  return (
    <section
      className="rounded-xl bg-ink-950/40 hairline p-4 space-y-4"
      aria-label="Projected ROI calculator"
    >
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-violet-200 inline-flex items-center gap-1.5">
            <Sparkles size={11} aria-hidden />
            Projected ROI
          </div>
          <h4 className="mt-0.5 text-sm font-semibold text-mist-50">
            What would you get for{" "}
            <span className="text-emerald-300 tabular-nums">
              {formatNaira(budget)}
            </span>
            ?
          </h4>
        </div>
      </header>

      <input
        id={id}
        type="range"
        min={10_000}
        max={500_000}
        step={5_000}
        value={budget}
        onChange={(e) => setBudget(Number(e.target.value))}
        aria-label="Budget slider for ROI projection"
        className="roi-slider w-full"
      />
      <div className="flex flex-wrap gap-1.5">
        {BUDGET_TIERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setBudget(t)}
            aria-pressed={budget === t}
            className={
              "rounded-full px-2.5 py-1 text-[11px] font-medium tap-press touch-target " +
              (budget === t
                ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-200"
                : "bg-mist-50/[0.04] hairline text-mist-300 hover:text-mist-50")
            }
          >
            {formatCompactNumber(t)}
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-3 gap-2 pt-2 text-center">
        <Metric
          label="Projected reach"
          value={formatCompactNumber(stats.reach)}
          delta={budget}
        />
        <Metric
          label="Cost / 1k reach"
          value={
            stats.cpmByReach > 0
              ? `₦${stats.cpmByReach.toFixed(0)}`
              : "—"
          }
        />
        <Metric
          label="Media value"
          value={formatNaira(stats.mediaValue)}
          highlight={stats.roiMult >= 2}
        />
      </dl>

      <div className="rounded-lg p-3 text-[11px] bg-emerald-500/[0.06] border border-emerald-500/20 text-mist-200 flex items-start gap-2">
        <TrendingUp size={12} aria-hidden className="text-emerald-300 mt-0.5" />
        <p>
          At this budget,{" "}
          <strong className="text-mist-50">
            {Math.round(budget / Math.max(1, creator.basePrice))} posts
          </strong>{" "}
          worth of reach &mdash; ER-weighted priority{" "}
          <strong className="text-mist-50">
            {(creator.engagementRate * 100).toFixed(1)}%
          </strong>
          . Compare this against your Meta Retargeting cost-per-1k reach
          of ~₦167.
        </p>
      </div>

      <style jsx>{`
        .roi-slider {
          appearance: none;
          height: 6px;
          background: linear-gradient(
            90deg,
            rgba(16, 185, 129, 0.6) 0%,
            rgba(16, 185, 129, 0.6)
              ${Math.min(100, (budget / 500_000) * 100)}%,
            rgba(255, 255, 255, 0.06)
              ${Math.min(100, (budget / 500_000) * 100)}%,
            rgba(255, 255, 255, 0.06) 100%
          );
          border-radius: 9999px;
        }
        .roi-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #10b981;
          border: 2px solid rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.30),
            0 0 18px -2px rgba(16, 185, 129, 0.55);
          cursor: pointer;
        }
        .roi-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 9999px;
          background: #10b981;
          border: 2px solid rgba(255, 255, 255, 0.85);
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}

function Metric({
  label,
  value,
  highlight,
  delta
}: {
  label: string;
  value: string;
  highlight?: boolean;
  delta?: number;
}) {
  return (
    <div
      className={
        "rounded-lg p-2.5 hairline " +
        (highlight ? "bg-emerald-500/[0.10] border-emerald-500/30" : "bg-mist-50/[0.04]")
      }
    >
      <dt className="text-[10px] uppercase tracking-wider text-mist-500 mb-0.5">
        {label}
      </dt>
      <dd
        className={
          "text-sm font-semibold tabular-nums " +
          (highlight ? "text-emerald-300" : "text-mist-50")
        }
      >
        <motion.span
          key={value}
          initial={{ opacity: 0.6, y: -2 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="inline-block"
        >
          {value}
        </motion.span>
        {typeof delta === "number" && label === "Projected reach" && (
          <span className="text-[10px] text-mist-400 ml-1">
            ≈
          </span>
        )}
      </dd>
    </div>
  );
}
