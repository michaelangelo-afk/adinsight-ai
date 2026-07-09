// components/reports/report-preview-sheet.tsx
//
// "use client" — slide-in drawer that shows a preview-style mock for a
// report header (KPI strip + per-campaign summary table). Mirrors the
// /influencers and /recommendations drawer pattern.
//
// URL ?rep=<id> drives state. ESC + backdrop close.

"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, FileText, Download, Send, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira, formatPercent } from "@/lib/utils";
import { campaigns, dashboardSummary } from "@/lib/mock-data";
import type { Report } from "@/lib/types";

export function ReportPreviewSheet({ reports }: { reports: Report[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const closeRef = useRef<HTMLButtonElement>(null);

  const openId = params.get("rep");
  const report = openId ? reports.find((r) => r.id === openId) ?? null : null;
  const isOpen = Boolean(report);

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
    next.delete("rep");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  // Top 3 campaigns by spend for the report header.
  const topBySpend = [...campaigns]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3);

  return (
    <AnimatePresence>
      {isOpen && report && (
        <motion.div
          key="rep-sheet-root"
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rep-sheet-title"
        >
          <motion.button
            type="button"
            aria-label="Close report preview"
            onClick={close}
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.aside
            className="ml-auto h-full w-full max-w-[720px] bg-ink-950 border-l border-mist-50/[0.06] shadow-2xl overflow-y-auto"
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
                <FileText size={11} aria-hidden className="text-emerald-300" />
                {report.title}
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close report preview"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-mist-50/[0.04] hairline text-mist-300 hover:text-mist-50 hover:border-rose-500/40 hover:bg-rose-500/10 tap-press touch-target"
              >
                <X size={14} aria-hidden />
              </button>
            </header>

            <div className="px-5 sm:px-6 py-6 space-y-6">
              <section>
                <Badge tone="violet">
                  <Calendar size={10} aria-hidden className="mr-1" />
                  {new Date(report.dateRangeStart).toLocaleDateString(
                    "en-NG",
                    { day: "numeric", month: "short" }
                  )}{" "}
                  →{" "}
                  {new Date(report.dateRangeEnd).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </Badge>
                <h2
                  id="rep-sheet-title"
                  className="mt-3 text-2xl font-semibold text-mist-50 tracking-tight leading-tight"
                >
                  {report.title}
                </h2>
                <p className="mt-2 text-sm text-mist-300">
                  Generated by Adinsight on{" "}
                  <time dateTime={report.dateRangeEnd}>
                    {new Date(report.dateRangeEnd).toLocaleDateString(
                      "en-NG",
                      { day: "numeric", month: "long", year: "numeric" }
                    )}
                  </time>
                  . {report.size} · delivered to{" "}
                  <code className="text-xs rounded bg-mist-50/[0.05] px-1.5 py-0.5">
                    {dashboardSummary.trend.length} datapoints
                  </code>{" "}
                  across {campaigns.length} campaigns.
                </p>
              </section>

              <section className="grid grid-cols-3 gap-3">
                {[
                  {
                    k: "Total spend",
                    v: formatNaira(dashboardSummary.totalSpend),
                    d: "−12.4%"
                  },
                  {
                    k: "Conversions",
                    v: dashboardSummary.totalConversions.toLocaleString(),
                    d: "+18.2%"
                  },
                  {
                    k: "ROI",
                    v: `${dashboardSummary.roi.toFixed(2)}×`,
                    d: "+22.4%"
                  }
                ].map((m) => (
                  <div
                    key={m.k}
                    className="rounded-xl hairline p-4 bg-ink-900/40 text-center"
                  >
                    <div className="text-[10px] uppercase tracking-wider text-mist-500">
                      {m.k}
                    </div>
                    <div className="mt-1 text-xl font-semibold text-mist-50 tabular-nums">
                      {m.v}
                    </div>
                    <div className="mt-1 text-[11px] text-emerald-300 font-semibold">
                      {m.d}
                    </div>
                  </div>
                ))}
              </section>

              <section className="rounded-xl bg-ink-900/40 hairline p-4">
                <h3 className="text-sm font-semibold text-mist-50 mb-3">
                  Top campaigns this period
                </h3>
                <ul className="space-y-2.5" role="list">
                  {topBySpend.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="text-mist-50 font-medium flex-1 truncate">
                        {c.name}
                      </span>
                      <Badge
                        tone={
                          c.status === "active"
                            ? "good"
                            : c.status === "paused"
                            ? "warn"
                            : "neutral"
                        }
                      >
                        {c.status}
                      </Badge>
                      <span className="text-mist-50 tabular-nums font-semibold w-24 text-right">
                        {formatNaira(c.spend)}
                      </span>
                      <span className="text-mist-400 tabular-nums text-xs w-16 text-right">
                        {formatPercent(c.ctr, 2)} CTR
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/30 p-4">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300 mb-1">
                  This week's highlights
                </div>
                <ul className="text-sm text-mist-200 space-y-1.5 list-disc list-inside marker:text-emerald-300">
                  <li>
                    Net −₦60k spend week-over-week, with conversions{" "}
                    <strong className="text-mist-50">+18%</strong>.
                  </li>
                  <li>
                    Meta Retargeting continues to lead the cohort at{" "}
                    <strong className="text-mist-50">₦23.85 CPC</strong>.
                  </li>
                  <li>
                    1 new AI recommendation ready — projected{" "}
                    <strong className="text-mist-50">₦78k value</strong>.
                  </li>
                </ul>
              </section>

              {/* Action row */}
              <div className="sticky bottom-0 -mx-5 sm:-mx-6 px-5 sm:px-6 py-4 bg-ink-950/85 backdrop-blur-xl border-t border-mist-50/[0.06] flex items-center justify-between gap-3">
                <span className="text-[11px] text-mist-400">
                  Full PDF includes the cohort summary, campaign
                  breakdown and 90-day trend.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Email queued for ${report.title} (demo)`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-mist-50/[0.04] border border-mist-50/10 text-mist-100 hover:border-violet-500/40 hover:text-violet-200 tap-press touch-target"
                  >
                    <Send size={12} aria-hidden />
                    Email
                  </button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading ${report.title} (demo)`);
                    }}
                  >
                    <Download size={13} aria-hidden />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
