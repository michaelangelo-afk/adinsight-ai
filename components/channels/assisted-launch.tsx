"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Check,
  Clipboard,
  Download,
  Megaphone,
  ShieldCheck,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ASSISTED_CHANNELS,
  EMPTY_LISTING,
  buildKit,
  kitToText,
  type AssistedChannelId,
  type ListingInput
} from "@/lib/channels/assisted";
import { addLaunch, type LaunchRecord } from "@/lib/channels/launch-log";
import {
  PRIMARY_ON_DARK,
  STATUS_BADGE_CLASS
} from "@/lib/channels/display";

interface AssistedLaunchProps {
  initialChannelId: AssistedChannelId;
  defaultBusiness: string;
  onClose: () => void;
  onPublished: (record: LaunchRecord) => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function Field({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-mist-400">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mist-400">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-mist-50/10 bg-mist-50/[0.04] px-3 py-2.5 text-sm text-mist-50 placeholder:text-mist-400 transition-colors focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

export function AssistedLaunch({
  initialChannelId,
  defaultBusiness,
  onClose,
  onPublished
}: AssistedLaunchProps) {
  const [channelId, setChannelId] =
    React.useState<AssistedChannelId>(initialChannelId);
  const [input, setInput] = React.useState<ListingInput>({
    ...EMPTY_LISTING,
    business: defaultBusiness
  });
  const [copied, setCopied] = React.useState<string | null>(null);
  const [published, setPublished] = React.useState(false);
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;

  const kit = React.useMemo(
    () => buildKit(channelId, input),
    [channelId, input]
  );

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

  React.useEffect(() => {
    setPublished(false);
    setCopied(null);
  }, [channelId]);

  const update = (key: keyof ListingInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const copy = async (text: string, label: string) => {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(label);
    window.setTimeout(() => setCopied((v) => (v === label ? null : v)), 1800);
  };

  const download = () => {
    const blob = new Blob([kitToText(kit)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kit.channelId}-${kit.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "listing"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const markPublished = () => {
    const id =
      typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}`;
    const record: LaunchRecord = {
      id,
      channelId,
      channelName: kit.channelName,
      title: kit.title,
      at: new Date().toISOString(),
      url: kit.composerUrl
    };
    addLaunch(record);
    onPublished(record);
    setPublished(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close assisted launch"
        onClick={onClose}
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assisted-launch-title"
        className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl border border-mist-50/10 bg-ink-900 shadow-2xl sm:rounded-3xl"
      >
        <header className="shrink-0 border-b border-mist-50/[0.06] bg-ink-900/95 p-5 backdrop-blur sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-300">
                <Megaphone size={12} aria-hidden />
                Assisted launch
              </div>
              <h2
                id="assisted-launch-title"
                className="mt-1 text-xl font-semibold tracking-tight text-mist-50 sm:text-2xl"
              >
                Create the kit. You press publish.
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-mist-300">
                GrowthAds never logs in or posts for you on this channel. We
                write the listing, add the tracking link and open the
                platform&apos;s own composer.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-mist-50/10 bg-mist-50/[0.04] text-mist-300 transition-colors hover:border-brand-500/40 hover:text-mist-50"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <div
            className="mt-4 flex gap-1 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Assisted channel"
          >
            {ASSISTED_CHANNELS.map((channel) => {
              const active = channel.id === channelId;
              return (
                <button
                  key={channel.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setChannelId(channel.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-brand-500/40 bg-brand-500/15 text-mist-50"
                      : "border-mist-50/10 bg-mist-50/[0.03] text-mist-300 hover:border-brand-500/30 hover:text-mist-50"
                  )}
                >
                  {channel.name}
                </button>
              );
            })}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.95fr,1.05fr]">
            <section aria-label="Listing details" className="space-y-4">
              <Field label="Business">
                <input
                  className={inputClass}
                  value={input.business}
                  onChange={(e) => update("business", e.target.value)}
                  placeholder="Ada's Kitchen"
                />
              </Field>

              <Field
                label="Title / headline"
                hint={`${kit.titleCount} of ${kit.titleMax} characters used`}
              >
                <input
                  className={inputClass}
                  value={input.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Small chops tray for 10"
                />
              </Field>

              <Field label="Description / offer">
                <textarea
                  className={cn(inputClass, "min-h-[112px] resize-y")}
                  value={input.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Fresh samosas, spring rolls, puff-puff and peppered gizzard. Ready in 45 minutes."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                {kit.channelId !== "nairaland" && (
                  <Field label="Price (₦)">
                    <input
                      className={inputClass}
                      value={input.price}
                      onChange={(e) => update("price", e.target.value)}
                      inputMode="decimal"
                      placeholder="12000"
                    />
                  </Field>
                )}
                <Field label="Location">
                  <input
                    className={inputClass}
                    value={input.location}
                    onChange={(e) => update("location", e.target.value)}
                    placeholder="Yaba, Lagos"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {kit.channelId !== "nairaland" && (
                  <Field label="Phone / WhatsApp">
                    <input
                      className={inputClass}
                      value={input.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      inputMode="tel"
                      placeholder="0803 123 4567"
                    />
                  </Field>
                )}
                <Field label="Category">
                  <input
                    className={inputClass}
                    value={input.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="Food & Catering"
                  />
                </Field>
              </div>

              <Field
                label="Landing URL"
                hint="We add utm_source, utm_medium and utm_campaign automatically."
              >
                <input
                  className={inputClass}
                  value={input.url}
                  onChange={(e) => update("url", e.target.value)}
                  inputMode="url"
                  placeholder="adaskitchen.ng/chops"
                />
              </Field>

              <div className="rounded-2xl border border-mist-50/10 bg-mist-50/[0.03] p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-mist-200">
                  <ShieldCheck size={13} aria-hidden className="text-brand-300" />
                  Platform rule
                </div>
                <p className="mt-1 text-xs leading-relaxed text-mist-400">
                  {kit.spec}
                </p>
              </div>
            </section>

            <section aria-label="Generated listing kit" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone="warn" className={STATUS_BADGE_CLASS.assisted}>
                    Assisted
                  </Badge>
                  <span className="text-xs text-mist-400">{kit.channelName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={download}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-mist-50/10 bg-mist-50/[0.04] px-3 text-xs font-medium text-mist-200 transition-colors hover:border-brand-500/40 hover:text-mist-50"
                  >
                    <Download size={12} aria-hidden />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => copy(kit.copy, "all")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/15 px-3 text-xs font-medium text-brand-200 transition-colors hover:bg-brand-500/25"
                  >
                    {copied === "all" ? (
                      <Check size={12} aria-hidden />
                    ) : (
                      <Clipboard size={12} aria-hidden />
                    )}
                    {copied === "all" ? "Copied" : "Copy everything"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-mist-50/10 bg-ink-950/70 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="break-words text-base font-semibold text-mist-50">
                    {kit.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => copy(kit.title, "title")}
                    aria-label="Copy title"
                    className="shrink-0 rounded-lg p-1.5 text-mist-400 transition-colors hover:bg-mist-50/[0.06] hover:text-mist-50"
                  >
                    {copied === "title" ? (
                      <Check size={13} aria-hidden />
                    ) : (
                      <Clipboard size={13} aria-hidden />
                    )}
                  </button>
                </div>
                <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-mist-200">
                  {kit.body}
                </div>
                {kit.hashtags && (
                  <div className="mt-3 text-sm text-brand-200">{kit.hashtags}</div>
                )}
                {kit.link && (
                  <div className="mt-3 flex items-start gap-2 border-t border-mist-50/[0.06] pt-3">
                    <span className="min-w-0 flex-1 break-all text-xs text-mist-400">
                      {kit.link}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(kit.link, "link")}
                      aria-label="Copy tracked link"
                      className="shrink-0 rounded-lg p-1.5 text-mist-400 transition-colors hover:bg-mist-50/[0.06] hover:text-mist-50"
                    >
                      {copied === "link" ? (
                        <Check size={13} aria-hidden />
                      ) : (
                        <Clipboard size={13} aria-hidden />
                      )}
                    </button>
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between border-t border-mist-50/[0.06] pt-2 text-xs text-mist-400">
                  <span>
                    {kit.bodyCount} / {kit.bodyMax} characters
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(kit.body, "body")}
                    className="text-mist-400 transition-colors hover:text-mist-50"
                  >
                    {copied === "body" ? "Copied" : "Copy body"}
                  </button>
                </div>
              </div>

              {kit.warnings.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                    Before you publish
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-amber-100/80">
                    {kit.warnings.map((warning) => (
                      <li key={warning} className="flex gap-2">
                        <span aria-hidden className="mt-0.5">
                          •
                        </span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-mist-50/10 bg-mist-50/[0.03] p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                  Checklist
                </div>
                <ul className="mt-2 space-y-2">
                  {kit.checklist.map((item) => (
                    <li key={item} className="flex gap-2 text-xs leading-relaxed text-mist-200">
                      <Check
                        size={13}
                        aria-hidden
                        className="mt-0.5 shrink-0 text-brand-300"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {published && (
                <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-100">
                  Saved to recent launches. The platform is still the source of
                  truth — mark it published there as well.
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                <LinkButton
                  href={kit.composerUrl}
                  target="_blank"
                  rel="noreferrer"
                  variant="primary"
                  className={`flex-1 ${PRIMARY_ON_DARK}`}
                >
                  {kit.channelId === "whatsapp" ? "Open WhatsApp share" : `Open ${kit.channelName}`}
                  <ArrowUpRight size={14} aria-hidden />
                </LinkButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={markPublished}
                  disabled={published}
                  className="flex-1 !border-brand-500/30 !bg-brand-500/10 !text-brand-200 hover:!bg-brand-500/20"
                >
                  {published ? "Marked published" : "Mark as published"}
                </Button>
              </div>
              <p className="text-center text-xs text-mist-400">
                No credentials stored. No automated login. You stay in control of
                the account.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
