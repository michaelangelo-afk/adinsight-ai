"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { FileText, Download, Send, ChevronRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  return `${a.toLocaleDateString("en-NG", opts)} → ${b.toLocaleDateString(
    "en-NG",
    opts
  )}`;
}

/**
 * The document plate. Two sheets fanned behind the front page, all built from
 * the same rounded rect so the stack reads as paper rather than three stickers.
 */
function DocPlate({ size }: { size: "hero" | "row" }) {
  const hero = size === "hero";
  return (
    <div
      aria-hidden
      className={
        "relative shrink-0 " + (hero ? "h-[150px] w-[118px]" : "h-12 w-9")
      }
    >
      <span className="absolute inset-0 -rotate-[7deg] rounded-lg border border-white/[0.08] bg-brand-500/[0.07]" />
      <span className="absolute inset-0 -rotate-[3deg] rounded-lg border border-white/[0.09] bg-brand-500/[0.10]" />
      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-brand-400/25 bg-gradient-to-b from-[#12251f] to-[#0c1714] shadow-[0_1px_0_rgba(255,255,255,0.07)_inset]">
        <FileText
          size={hero ? 26 : 13}
          className="text-brand-300 transition-colors duration-300 group-hover:text-brand-200"
        />
        {hero && (
          <>
            <span className="mt-1 h-px w-10 bg-white/[0.14]" />
            <span className="h-px w-10 bg-white/[0.10]" />
            <span className="h-px w-6 bg-white/[0.07]" />
            <span className="mt-2 rounded-[3px] bg-brand-400/15 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.1em] text-brand-200">
              PDF
            </span>
          </>
        )}
      </span>
    </div>
  );
}

export function ReportCard(props: ReportCardProps) {
  const { report, delay = 0 } = props;
  const isHero = props.variant === "hero";
  const href = props.href ?? `/reports?rep=${report.id}`;

  const stop = (fn: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };

  const actionClass =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 text-[11.5px] font-semibold transition-colors " +
    "border border-white/[0.09] bg-white/[0.03] text-mist-100 hover:border-brand-500/45 hover:text-brand-200 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60";

  return (
    <Link
      href={href}
      aria-label={`Open report ${report.title}`}
      className={
        "group glass-card relative block overflow-hidden rounded-xl transition-colors duration-200 " +
        "hover:border-white/[0.16] focus-visible:outline-none focus-visible:ring-2 " +
        "focus-visible:ring-brand-300/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 " +
        (isHero ? "p-5 sm:p-6" : "p-4")
      }
      style={{ animationDelay: `${delay}ms` }}
    >
      {isHero && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-500/[0.10] blur-3xl"
        />
      )}

      <div
        className={
          "relative " +
          (isHero
            ? "grid items-center gap-5 lg:grid-cols-[118px,1fr,168px]"
            : "flex items-center gap-3.5")
        }
      >
        <DocPlate size={isHero ? "hero" : "row"} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">
              <Calendar size={9} aria-hidden className="mr-1" />
              {dateRangeLabel(report)}
            </Badge>
            <Badge tone="neutral">{report.size}</Badge>
            {isHero && <Badge tone="good">most recent</Badge>}
          </div>

          <h3
            className={
              "font-semibold tracking-tight text-mist-50 " +
              (isHero ? "mt-2 text-[17px]" : "mt-1.5 text-[13px]")
            }
          >
            {report.title}
          </h3>

          {isHero ? (
            <>
              <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-mist-400">
                Weekly snapshot of spend, conversions and ROI across{" "}
                <strong className="font-medium text-mist-200">3 campaigns</strong>
                , with an annotated per-platform breakdown and a curated list of
                new AI insights to act on this week.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {["Spend ₦142,600", "866 conversions", "3.1× ROI"].map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-white/[0.04] px-2 py-1 text-[10.5px] font-medium tabular-nums text-mist-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-0.5 text-[11px] text-mist-500">
              Delivered to 5 recipients · PDF + email
            </p>
          )}
        </div>

        <div
          className={
            isHero
              ? "flex items-center gap-2 lg:flex-col lg:items-stretch"
              : "ml-auto flex shrink-0 items-center gap-1.5"
          }
        >
          <button
            type="button"
            onClick={stop(() =>
              alert(`Download queued for ${report.title} (demo)`)
            )}
            className={actionClass + " h-8"}
          >
            <Download size={12} aria-hidden />
            {isHero ? "Download PDF" : "PDF"}
          </button>
          <button
            type="button"
            onClick={stop(() => alert(`Email queued for ${report.title} (demo)`))}
            className={
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[11.5px] " +
              "font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 " +
              "focus-visible:ring-brand-300/60 " +
              (isHero
                ? "bg-brand-600 text-white hover:bg-brand-500"
                : "border border-white/[0.09] bg-white/[0.03] text-mist-100 hover:border-brand-500/45 hover:text-brand-200")
            }
          >
            <Send size={12} aria-hidden />
            {isHero ? "Send now" : "Email"}
          </button>

          {isHero && (
            <span className="hidden h-8 items-center justify-center gap-1 rounded-lg text-[11.5px] font-medium text-mist-400 transition-colors group-hover:text-brand-200 lg:inline-flex">
              Open preview
              <ChevronRight
                size={12}
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
