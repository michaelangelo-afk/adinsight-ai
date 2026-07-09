"use client";

// components/billing/invoice-list.tsx
//
// Client-rendered invoice list. Each row carries its own download
// button (uses an inline onClick handler to surface the demo PDF
// alert), so the component must live on the client side of the RSC
// boundary.

import { Download, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

export function InvoicesList({ invoices }: { invoices: Invoice[] }) {
  return (
    <section
      className="glass-card rounded-2xl p-5 sm:p-6 hover-lift animate-fade-up"
      style={{ animationDelay: "180ms" }}
      aria-label="Recent invoices"
    >
      <header className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-violet-300 inline-flex items-center gap-1.5">
            <FileText size={11} aria-hidden />
            Invoices
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-mist-50">
            Recent invoices
          </h3>
          <p className="mt-1 text-sm text-mist-300">
            Tap any row to download the matching PDF. Active cycles show
            with a <span className="text-amber-300 font-medium">due</span> chip.
          </p>
        </div>
      </header>

      <ul className="divide-y divide-mist-50/[0.04]" role="list">
        {invoices.map((inv) => (
          <li
            key={inv.id}
            className="py-3 grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 items-center group hover:bg-mist-50/[0.04] rounded-lg px-2 -mx-2 transition-colors duration-200"
          >
            <span
              aria-hidden
              className="h-9 w-9 rounded-full bg-mist-50/[0.04] hairline flex items-center justify-center"
            >
              <FileText size={13} className="text-mist-300 group-hover:text-emerald-300 transition-colors duration-200" />
            </span>
            <div className="min-w-0">
              <div className="text-sm text-mist-50 font-medium truncate">
                {inv.description}
              </div>
              <div className="text-[11px] text-mist-400">
                <time dateTime={inv.date}>
                  {new Date(inv.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </time>
              </div>
            </div>
            <Badge tone={inv.status === "paid" ? "good" : inv.status === "due" ? "warn" : "neutral"}>
              {inv.status}
            </Badge>
            <span className="text-sm text-mist-50 tabular-nums font-semibold w-28 text-right">
              {formatNaira(inv.amount)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                alert(`Downloading ${inv.id}.pdf (demo)`);
              }}
              aria-label={`Download invoice ${inv.id}`}
              className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-all duration-200 inline-flex h-9 w-9 items-center justify-center rounded-lg text-mist-400 hover:text-emerald-300 hover:bg-emerald-500/10 tap-press touch-target"
            >
              <Download size={13} aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/30 px-4 py-3 text-xs text-mist-200">
        All past invoices are auto-archived to{" "}
        <code className="text-[11px] text-mist-100 bg-mist-50/[0.05] rounded px-1.5 py-0.5">
          /billing/archive
        </code>
        . Full ledger export available to Scale tier customers.
      </div>
    </section>
  );
}
