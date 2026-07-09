"use client";

// components/reports/report-card.tsx
//
// Client-rendered card for a single perf report. Two variants:
//  - "hero" : spans 2 cols on lg+, used for the most recent report;
//             includes a stack-of-pages decorative element.
//  - "row"  : compact card with date + size + download CTA.
//
// Marked "use client" because the inline onClick handlers on the
// Download / Email buttons need a client-side boundary \u2014 these are
// real interactive affordances, not placeholders, so promoting the
// whole card to a client component is the right scope (the card is
// inherently interactive).

import Link from "next/link";
import {
  FileText,
  Download,
  Send,
  ChevronRight,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCompactNumber } from "@/lib/utils";
import type { Report } from "@/lib/types";

interface CommonProps {
  report: Report;
  href?: string;
}

interface HeroProps extends CommonProps {
  variant: "hero";
  delay?: number;
}

interface RowProps extends CommonProps {
  variant?: "row";
  delay?: number;
}

export type ReportCardProps = HeroProps | RowProps;

function dateRangeLabel(r: Report): string {
  const a = new Date(r.dateRangeStart);
  const b = new Date(r.dateRangeEnd);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${a.toLocaleDateString("en-NG", opts)} → ${b.toLocaleDateString("en-NG", opts)}`;
}

export function ReportCard(props: ReportCardProps) {
  const { report, delay = 0 } = props;
  const isHero = props.variant === "hero";
  const href = props.href ?? `/reports?rep=${report.id}`;

  return (
    <Link
      href={href}
      aria-label={`Open report ${report.title}`}
      className="group glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up relative overflow-hidden tap-press block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      style={{ animationDelay: `${delay}ms` }}
    >
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
          "relative gap-5 " +
          (isHero
            ? "grid lg:grid-cols-[auto,1fr,auto]"
            : "flex items-center")
        }
      >
        {/* Decorative page stack */}
        <div
          aria-hidden
          className={
            "relative shrink-0 " +
            (isHero ? "h-28 w-20 lg:w-24" : "h-12 w-10")
          }
        >
          <span className="absolute inset-0 rounded-lg bg-emerald-500/[0.10] hairline -rotate-[6deg]" />
          <span className="absolute inset-0 rounded-lg bg-violet-500/[0.12] hairline -rotate-[3deg]" />
          <span className="absolute inset-0 rounded-lg bg-mist-50/[0.04] hairline flex items-center justify-center">
            <FileText
              size={isHero ? 22 : 14}
              aria-hidden
              className="text-mist-300 group-hover:text-emerald-300 transition-colors duration-300"
            />
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge tone="violet">
              <Calendar size={10} aria-hidden className="mr-1" />
              {dateRangeLabel(report)}
            </Badge>
            <Badge tone="neutral">{report.size}</Badge>
            {isHero && <Badge tone="good">most recent</Badge>}
          </div>
          <h3
            className={
              "font-semibold text-mist-50 tracking-tight " +
              (isHero ? "text-lg" : "text-sm")
            }
          >
            {report.title}
          </h3>
          {isHero && (
            <p className="text-sm text-mist-300 leading-relaxed">
              Weekly snapshot of spend, conversions and ROI across{" "}
              <strong className="text-mist-50">3 campaigns</strong>, with
              an annotated per-platform breakdown and a curated list of
              new AI insights to act on this week.
            </p>
          )}
        </div>

        <div
          className={
            "flex items-center gap-2 " +
            (isHero ? "lg:flex-col lg:items-stretch" : "")
          }
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Demo: no real PDF.
              alert(`Download queued for ${report.title} (demo)`);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-mist-50/[0.04] border border-mist-50/10 text-mist-100 hover:border-emerald-500/40 hover:text-emerald-200 tap-press touch-target"
          >
            <Download size={12} aria-hidden />
            {isHero ? "Download PDF" : "PDF"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              alert(`Email queued for ${report.title} (demo)`);
            }}
            className={
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tap-press touch-target " +
              (isHero
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-glow-emerald"
                : "bg-mist-50/[0.04] border border-mist-50/10 text-mist-100 hover:border-violet-500/40 hover:text-violet-200")
            }
          >
            <Send size={12} aria-hidden />
            {isHero ? "Send now" : "Email"}
          </button>
          {isHero && (
            <span
              aria-hidden
              className="inline-flex h-9 w-9 self-center justify-center self-stretch rounded-full bg-mist-50/[0.04] hairline text-mist-300 transition-all duration-300 group-hover:text-violet-200 group-hover:bg-violet-500/15 group-hover:border-violet-500/40 group-hover:translate-x-0.5"
            >
              <ChevronRight size={14} className="m-auto" aria-hidden />
            </span>
          )}
        </div>
      </div>
      <span className="sr-only">{formatCompactNumber(report.size.length * 1024)} bytes</span>
    </Link>
  );
}
