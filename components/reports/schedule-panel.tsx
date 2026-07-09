// components/reports/schedule-panel.tsx
//
// "use client" but mostly server (no hooks). Shows scheduled cadence
// + recipients + format. Each row is click-to-edit (state updates
// locally with framer-motion y swap).

"use client";

import { useState } from "react";
import {
  Calendar,
  Mail,
  Clock,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScheduledReport } from "@/lib/types";

const SCHEDULES: ScheduledReport[] = [
  {
    id: "sch_daily",
    cadence: "daily",
    recipients: ["you@lagosbites.com", "ops@lagosbites.com"],
    nextRunAt: "2026-07-10T01:00:00Z",
    format: "pdf",
    enabled: true
  },
  {
    id: "sch_weekly",
    cadence: "weekly",
    recipients: ["partners@lagosbites.com"],
    nextRunAt: "2026-07-13T02:00:00Z",
    format: "html",
    enabled: true
  },
  {
    id: "sch_monthly",
    cadence: "monthly",
    recipients: ["finance@lagosbites.com"],
    nextRunAt: "2026-08-01T03:00:00Z",
    format: "csv",
    enabled: false
  }
];

const CADENCE_LABEL = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly"
} as const;

function nextRunLabel(iso: string): string {
  const next = new Date(iso);
  const now = new Date("2026-07-09T12:00:00Z");
  const hours = Math.round((next.getTime() - now.getTime()) / 3600_000);
  if (hours <= 0) return "now";
  if (hours < 24) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `in ${days}d`;
  return next.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function SchedulePanel() {
  const [enabledSet, setEnabledSet] = useState<Set<string>>(
    new Set(SCHEDULES.filter((s) => s.enabled).map((s) => s.id))
  );

  const toggle = (id: string) => {
    setEnabledSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section
      className="glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up"
      style={{ animationDelay: "180ms" }}
      aria-label="Scheduled report cadence"
    >
      <header className="flex items-start justify-between mb-4 gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-violet-300 inline-flex items-center gap-1.5">
            <Calendar size={11} aria-hidden />
            Scheduled
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-mist-50">
            Cadence + recipients
          </h3>
          <p className="mt-1 text-sm text-mist-300">
            Toggle a row to pause that schedule. Edit recipients inline
            next sprint — currently in demo mode.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            alert("New schedule modal — coming up");
          }}
        >
          + New schedule
        </Button>
      </header>

      <ul className="space-y-3" role="list">
        {SCHEDULES.map((s) => {
          const on = enabledSet.has(s.id);
          return (
            <li
              key={s.id}
              className={
                "rounded-xl hairline p-3.5 flex items-center gap-3 transition-colors duration-300 " +
                (on
                  ? "bg-ink-900/40 border-violet-500/30"
                  : "bg-ink-900/40 opacity-70 hover:opacity-95")
              }
            >
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={on}
                aria-label={`${on ? "Disable" : "Enable"} ${CADENCE_LABEL[s.cadence]} report`}
                className={
                  "inline-flex h-6 w-11 items-center rounded-full transition-colors tap-press touch-target shrink-0 " +
                  (on
                    ? "bg-emerald-500/70 border border-emerald-400/80 justify-end px-1"
                    : "bg-mist-50/10 border hairline justify-start px-1")
                }
              >
                <span
                  aria-hidden
                  className="h-4 w-4 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.35)]"
                />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-mist-50">
                    {CADENCE_LABEL[s.cadence]} report
                  </span>
                  <Badge tone={s.format === "pdf" ? "violet" : s.format === "csv" ? "neutral" : "good"}>
                    {s.format.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] uppercase tracking-wider text-mist-500 inline-flex items-center gap-1">
                    <Clock size={9} aria-hidden />
                    Next run {nextRunLabel(s.nextRunAt)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <Mail size={10} aria-hidden className="text-mist-500" />
                  {s.recipients.map((r) => (
                    <span
                      key={r}
                      className="text-[11px] text-mist-300 rounded-full hairline px-2 py-0.5"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              {on && (
                <span
                  className="text-[10px] uppercase tracking-wider text-emerald-300 inline-flex items-center gap-1"
                  aria-label="Schedule enabled"
                >
                  <Check size={10} aria-hidden />
                  live
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
