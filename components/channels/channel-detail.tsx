"use client";

import * as React from "react";
import { ArrowUpRight, ShieldAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { ChannelGlyph } from "@/components/channels/channel-glyph";
import type { Channel } from "@/lib/platforms/catalog";
import {
  apiAccessLabel,
  composerIdFor,
  GROUP_LABELS,
  reachLabel,
  reachTitle,
  statusOf,
  STATUS_LABELS,
  STATUS_TONES,
  STATUS_BADGE_CLASS,
  PRIMARY_ON_DARK
} from "@/lib/channels/display";
import type { AssistedChannelId } from "@/lib/channels/assisted";

interface ChannelDetailProps {
  channel: Channel;
  onClose: () => void;
  onAssist: (id: AssistedChannelId) => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-mist-50/[0.06] py-2.5 last:border-0">
      <dt className="shrink-0 text-xs uppercase tracking-wider text-mist-400">
        {label}
      </dt>
      <dd className="text-right text-sm text-mist-100">{value}</dd>
    </div>
  );
}

export function ChannelDetail({ channel, onClose, onAssist }: ChannelDetailProps) {
  const status = statusOf(channel);
  const composerId = composerIdFor(channel);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close channel details"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="channel-detail-title"
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-mist-50/10 bg-ink-900 shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-mist-50/[0.06] bg-ink-900/95 p-5 backdrop-blur">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-xl border border-white/10 bg-white px-2">
              <ChannelGlyph channelId={channel.id} group={channel.group} />
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider text-mist-400">
                {GROUP_LABELS[channel.group]}
              </div>
              <h2
                id="channel-detail-title"
                className="mt-0.5 text-lg font-semibold tracking-tight text-mist-50"
              >
                {channel.name}
              </h2>
              <div className="mt-1">
                <Badge
                  tone={STATUS_TONES[status]}
                  className={STATUS_BADGE_CLASS[status]}
                >
                  {STATUS_LABELS[status]}
                </Badge>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mist-50/10 bg-mist-50/[0.04] text-mist-300 transition-colors hover:border-brand-500/40 hover:text-mist-50"
          >
            <X size={17} aria-hidden />
          </button>
        </header>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl border border-mist-50/10 bg-mist-50/[0.03] p-4">
            <div className="text-xs uppercase tracking-wider text-mist-400">
              Nigerian reach
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums text-mist-50">
              {reachLabel(channel)}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-mist-400">
              {reachTitle(channel)}
            </p>
          </div>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mist-400">
              Access
            </h3>
            <dl className="mt-2">
              <Row label="Read" value={channel.api.read ? "Yes" : "No API"} />
              <Row label="Write" value={apiAccessLabel(channel)} />
              <Row label="Gate" value={channel.api.gate.replace(/-/g, " ")} />
              <Row label="Cost" value={channel.api.cost} />
              <Row label="Quota" value={channel.api.quota} />
              <Row label="Effort" value={`${channel.effort} · wave ${channel.wave}`} />
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mist-400">
              Economics
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mist-200">
              {channel.economics.entry}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-mist-400">
              {channel.economics.benchmark}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-mist-400">
              Playbook
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mist-200">
              {channel.playbook}
            </p>
          </section>

          <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <ShieldAlert size={13} aria-hidden />
              Automation policy
            </div>
            <p className="mt-2 text-xs leading-relaxed text-amber-100/80">
              {channel.automation.why}
            </p>
            <p className="mt-2 text-xs text-amber-200/70">
              Browser posting: {channel.automation.browserAutomation.replace(/-/g, " ")} ·
              Playwright: {channel.automation.playwrightVerdict}
            </p>
          </section>

          <div className="flex flex-col gap-2">
            {status === "live" && (
              <LinkButton
                href="/dashboard"
                variant="primary"
                className={PRIMARY_ON_DARK}
              >
                Open dashboard
              </LinkButton>
            )}
            {status === "assisted" && composerId && (
              <Button
                type="button"
                onClick={() => onAssist(composerId as AssistedChannelId)}
                className={PRIMARY_ON_DARK}
              >
                Build the listing kit
              </Button>
            )}
            {status === "api" && (
              <LinkButton
                href={channel.api.docs}
                target="_blank"
                rel="noreferrer"
                variant="primary"
                className={PRIMARY_ON_DARK}
              >
                Open API docs
                <ArrowUpRight size={14} aria-hidden />
              </LinkButton>
            )}
            {status === "assisted" && !composerId && (
              <p className="rounded-xl border border-mist-50/10 bg-mist-50/[0.03] p-3 text-xs leading-relaxed text-mist-400">
                This is a sales-led partnership, not a self-serve composer.
                Use the playbook above with the account team.
              </p>
            )}
            {status === "sales" && (
              <p className="rounded-xl border border-mist-50/10 bg-mist-50/[0.03] p-3 text-xs leading-relaxed text-mist-400">
                No self-serve surface to connect. Treat this as a partnership
                conversation, not an integration.
              </p>
            )}
            {status !== "api" && (
              <a
                href={channel.api.docs}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs text-mist-400 transition-colors hover:text-mist-100"
              >
                Source / platform docs
                <ArrowUpRight size={12} aria-hidden />
              </a>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
