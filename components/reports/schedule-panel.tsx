"use client";

import { useState } from "react";
import { Calendar, Mail, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

/**
 * Cadence list. A row is a schedule, not a settings form: cadence + format +
 * next run on the first line, recipients on the second, a real switch on the
 * right. The switch is 36×20 and NOT a `touch-target` — an 44px minimum on a
 * control this small turned it into a 44px green disc.
 */
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
      className="glass-card rounded-xl p-5"
      aria-label="Scheduled report cadence"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="stat-label flex items-center gap-1.5">
            <Calendar size={11} aria-hidden className="text-brand-300" />
            Scheduled
          </div>
          <h3 className="mt-1 text-sm font-semibold tracking-tight text-mist-50">
            Cadence and recipients
          </h3>
          <p className="mt-1 text-[12px] text-mist-400">
            Toggle a row to pause that schedule. Recipients are editable in the
            next sprint — currently in demo mode.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("New schedule modal — coming up")}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.02] px-2.5 text-[11.5px] font-medium text-mist-200 transition-colors hover:border-brand-500/40 hover:text-brand-200"
        >
          <Plus size={12} aria-hidden />
          New schedule
        </button>
      </header>

      <ul className="mt-4 space-y-2" role="list">
        {SCHEDULES.map((s) => {
          const on = enabledSet.has(s.id);
          return (
            <li
              key={s.id}
              className={
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-200 " +
                (on
                  ? "border-white/[0.08] bg-white/[0.025]"
                  : "border-white/[0.05] bg-white/[0.01] opacity-70 hover:opacity-100")
              }
            >
              <button
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={on}
                aria-label={`${on ? "Disable" : "Enable"} ${
                  CADENCE_LABEL[s.cadence]
                } report`}
                className={
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 " +
                  (on
                    ? "bg-brand-600"
                    : "bg-white/[0.12] ring-1 ring-inset ring-white/[0.06]")
                }
              >
                <span
                  aria-hidden
                  className={
                    "block h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-transform duration-200 " +
                    (on ? "translate-x-[18px]" : "translate-x-0.5")
                  }
                />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[12.5px] font-medium text-mist-50">
                    {CADENCE_LABEL[s.cadence]} report
                  </span>
                  <Badge
                    tone={
                      s.format === "pdf"
                        ? "brand"
                        : s.format === "csv"
                        ? "neutral"
                        : "good"
                    }
                  >
                    {s.format.toUpperCase()}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[10.5px] text-mist-500">
                    <Clock size={9} aria-hidden />
                    Next run {nextRunLabel(s.nextRunAt)}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Mail size={10} aria-hidden className="text-mist-600" />
                  {s.recipients.map((r) => (
                    <span
                      key={r}
                      className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10.5px] text-mist-300"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <span
                className={
                  "inline-flex w-10 shrink-0 items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] " +
                  (on ? "text-brand-300" : "text-mist-600")
                }
                aria-label={on ? "Schedule enabled" : "Schedule paused"}
              >
                {on ? "Live" : "Off"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
