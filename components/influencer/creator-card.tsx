// components/influencer/creator-card.tsx
//
// Server Component variant (CSS-driven hover + framer client island
// embedded for the FitScoreRing). Two visual sizes:
//
//  - "standard": fits a 1-col slot in the bento grid.
//  - "featured": spans 2-cols on lg+, includes the AnimatedIcon3D
//                orbiters behind the avatar, an ER historical sparkline,
//                and an inline "Why this fits" line.
//
// Click handler: opens the creator drawer via `?c=<id>` query. We render
// a Next.js <Link> wrapper to preserve URL-as-state semantics + shareable
// URLs (URL is the source of truth for the drawer, not React state).

import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { formatNaira, formatPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FitScoreRing } from "./fit-score-ring";
import type { ExtendedInfluencer } from "@/lib/influencer/types";
import type { FitBreakdown } from "@/lib/influencer/types";

interface ErSparkProps {
  series: number[];
  tone?: "violet" | "naira";
}

function MiniErSpark({ series, tone = "violet" }: ErSparkProps) {
  const w = 100;
  const h = 28;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = tone === "naira" ? "#10B981" : "#A78BFA";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-7"
      aria-hidden
    >
      <defs>
        <linearGradient id={`er-spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.4" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#er-spark-${tone})`}
        stroke="none"
      />
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CommonProps {
  creator: ExtendedInfluencer;
  fit: FitBreakdown;
  /** ?c=<id> navigated to on click; defaults to /influencers?c=<id> */
  href?: string;
  /** Tabular extra (used in featured variant): 1-line "why this fits" */
  whyFit?: string;
}

interface StandardProps extends CommonProps {
  variant?: "standard";
  /** Stagger entrance delay (ms). Server-calculated by parent grid. */
  delay?: number;
}

interface FeaturedProps extends CommonProps {
  variant: "featured";
  delay?: number;
}

export type CreatorCardProps = StandardProps | FeaturedProps;

function WhyFitLine({ fit }: { fit: FitBreakdown }) {
  const bits: string[] = [];
  if (fit.byAxis.audience >= 28) bits.push("audience-overlap");
  if (fit.byAxis.niche >= 22) bits.push("niche-adjacent");
  if (fit.byAxis.budget >= 16) bits.push("on-budget");
  if (fit.byAxis.geo >= 7) bits.push("geo-matched");
  if (fit.byAxis.cadence >= 4) bits.push("trending-up");
  if (bits.length === 0) bits.push("explore-new");
  return bits.slice(0, 3).join(" · ");
}

function CreatorAvatar({
  avatar,
  isVerified,
  size = "md"
}: {
  avatar: string;
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "h-14 w-14 text-base"
      : size === "sm"
      ? "h-9 w-9 text-[11px]"
      : "h-11 w-11 text-xs";
  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={`${dim} rounded-full bg-brand-gradient flex items-center justify-center font-semibold text-white shadow-[0_0_14px_-2px_rgba(16,185,129,0.55)]`}
        aria-hidden
      >
        {avatar}
      </div>
      {isVerified && (
        <span
          aria-label="Verified creator"
          title="Verified creator"
          className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-ink-950"
        >
          <BadgeCheck
            size={12}
            className="text-white drop-shadow-[0_0_4px_rgba(16,185,129,0.7)]"
          />
        </span>
      )}
    </div>
  );
}

function StatPill({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-md bg-mist-50/[0.04] hairline px-2.5 py-1 text-[11px] text-mist-300">
      <span className="text-mist-400 uppercase tracking-wider text-[9px]">
        {label}
      </span>
      <span className="text-mist-50 font-semibold tabular-nums">{value}</span>
    </span>
  );
}

export function CreatorCard(props: CreatorCardProps) {
  const { creator, fit, delay = 0 } = props;
  const isFeatured = props.variant === "featured";
  const href = props.href ?? `/influencers?c=${creator.id}`;

  return (
    <Link
      href={href}
      aria-label={`View ${creator.fullName} (${creator.handle}) — fit score ${fit.overall} out of 100`}
      className={
        "group glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up relative overflow-hidden tap-press block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      }
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover halo that brightens on focus. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 0%, rgba(16,185,129,0.10), transparent 60%)"
        }}
      />

      <div
        className={
          "relative grid gap-5 " +
          (isFeatured ? "lg:grid-cols-[140px,1fr,140px]" : "grid-cols-[auto,1fr,auto]")
        }
      >
        {/* Avatar zone */}
        <div className="flex items-start gap-3 min-w-0">
          <CreatorAvatar
            avatar={creator.avatar}
            isVerified={creator.isVerified}
            size={isFeatured ? "lg" : "md"}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-mist-50 truncate">
                {creator.fullName}
              </h3>
            </div>
            <div className="mt-0.5 text-[12px] text-mist-400 truncate">
              {creator.handle}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-mist-500">
              <MapPin size={10} aria-hidden />
              <span>{creator.city}</span>
              <span className="text-mist-600">·</span>
              <span aria-hidden>★</span>
              <span className="tabular-nums">{creator.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Middle: stats or featured body */}
        <div className="space-y-3 min-w-0">
          <div className="flex flex-wrap gap-1.5">
            {creator.niche.slice(0, 3).map((n) => (
              <Badge key={n} tone="neutral">
                {n}
              </Badge>
            ))}
          </div>

          {isFeatured ? (
            <>
              <p className="text-sm text-mist-200 leading-relaxed">
                <span className="text-emerald-300 font-medium">
                  Why this fits:
                </span>{" "}
                {props.whyFit ?? <WhyFitLine fit={fit} />}
              </p>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-mist-500 mb-1">
                  12-month engagement
                </div>
                <MiniErSpark
                  series={creator.historicalEr.series}
                  tone="naira"
                />
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <StatPill
                label="ER"
                value={formatPercent(creator.engagementRate, 2)}
              />
              <StatPill
                label="↗ ER"
                value={`+${(creator.recentDelta * 100).toFixed(0)}%`}
              />
              <StatPill
                label="from"
                value={formatNaira(creator.basePrice)}
              />
            </div>
          )}
        </div>

        {/* Right: fit ring + arrow */}
        <div className="flex items-center justify-end gap-3 shrink-0">
          <FitScoreRing
            score={fit.overall}
            size={isFeatured ? "lg" : "md"}
            delay={delay + 120}
          />
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-mist-50/[0.04] hairline text-mist-300 transition-all duration-300 group-hover:text-violet-200 group-hover:bg-violet-500/15 group-hover:border-violet-500/40 group-hover:translate-x-0.5"
          >
            <ArrowUpRight size={14} />
          </span>
          {isFeatured && (
            <Badge tone="good" className="ml-1">
              <Sparkles size={10} className="mr-0.5" />
              Top match
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
