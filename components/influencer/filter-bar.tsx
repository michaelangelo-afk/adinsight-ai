// components/influencer/filter-bar.tsx
//
// "use client" — filter bar. URL search params are the source of truth,
// so the influencer page can be deep-linked and shareable. We update
// via `next/navigation`'s router replace (no history pollution), and
// debounce the price slider so we don't blow up the history stack.
//
// The active creator (drawer) lives in `?c=<id>`; filters are kept in
// `?q=niche&city=...&price=lo-hi&platform=...&sort=...`. We push
// simultaneously so URL reflects both drawer + filter state.

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowDownUp
} from "lucide-react";
import { ALL_CITIES, ALL_NICHES, ALL_PLATFORMS, type Niche } from "@/lib/influencer/types";

const SORTS = [
  { id: "fit", label: "Best fit" },
  { id: "reach", label: "Reach ↓" },
  { id: "er", label: "Engagement rate" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc", label: "Price ↓" },
  { id: "momentum", label: "Trending up" }
] as const;
type SortId = (typeof SORTS)[number]["id"];

function parsePriceRange(raw: string | null): [number, number] {
  // default 0k – 500k
  if (!raw) return [0, 500_000];
  const [lo, hi] = raw.split("-").map((n) => Number(n));
  if (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) {
    return [lo, hi];
  }
  return [0, 500_000];
}

function fmtPriceK(v: number): string {
  return `₦${Math.round(v / 1000)}k`;
}

export function FilterBar({ totalCount }: { totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const niches = (params.get("niche")?.split(",").filter(Boolean) ?? []) as Niche[];
  const cities = (params.get("city")?.split(",").filter(Boolean) ?? []) as string[];
  const platforms =
    (params.get("platform")?.split(",").filter(Boolean) ?? []) as string[];
  const sort = (params.get("sort") as SortId | null) ?? "fit";
  const q = params.get("q") ?? "";
  const [priceLo, priceHi] = parsePriceRange(params.get("price"));

  const [query, setQuery] = useState(q);
  const [localPriceLo, setLocalPriceLo] = useState(priceLo);
  const [localPriceHi, setLocalPriceHi] = useState(priceHi);

  // Keep query in sync if URL changes externally.
  useEffect(() => {
    setQuery(q);
  }, [q]);
  useEffect(() => {
    setLocalPriceLo(priceLo);
    setLocalPriceHi(priceHi);
  }, [priceLo, priceHi]);

  // Push to URL. Preserves `?c=<id>` if it's set, preserving drawer
  // state across filter changes.
  const writeParams = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      // Don't drop ?c=<id> — but normalize if absent.
      mutate(next);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [params, pathname, router]
  );

  const toggleArray = (key: string, value: string) => {
    writeParams((sp) => {
      const cur = (sp.get(key)?.split(",").filter(Boolean) ?? []) as string[];
      const has = cur.includes(value);
      const next = has ? cur.filter((x) => x !== value) : [...cur, value];
      if (next.length === 0) sp.delete(key);
      else sp.set(key, next.join(","));
    });
  };

  const setSingle = (key: string, value: string | null) => {
    writeParams((sp) => {
      if (value === null || value === "") sp.delete(key);
      else sp.set(key, value);
    });
  };

  const clearAll = () => {
    writeParams((sp) => {
      sp.delete("q");
      sp.delete("niche");
      sp.delete("city");
      sp.delete("platform");
      sp.delete("price");
      sp.delete("sort");
    });
    setQuery("");
    setLocalPriceLo(0);
    setLocalPriceHi(500_000);
  };

  const hasActive =
    niches.length + cities.length + platforms.length > 0 ||
    q.length > 0 ||
    localPriceLo > 0 ||
    localPriceHi < 500_000;

  // Debounced price slider commit (300ms).
  useEffect(() => {
    if (localPriceLo === priceLo && localPriceHi === priceHi) return;
    const handle = window.setTimeout(() => {
      writeParams((sp) => {
        if (localPriceLo === 0 && localPriceHi === 500_000) {
          sp.delete("price");
        } else {
          sp.set("price", `${localPriceLo}-${localPriceHi}`);
        }
      });
    }, 300);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPriceLo, localPriceHi]);

  return (
    <div
      className="glass-card rounded-2xl p-4 sm:p-5 hover-lift animate-fade-up"
      style={{ animationDelay: "100ms" }}
    >
      <div className="flex flex-wrap items-center gap-3">
        {/* Search field */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mist-500"
          />
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              setSingle("q", v.trim() || null);
            }}
            placeholder="Search creators, niches…"
            aria-label="Search creators"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-mist-50/[0.04] hairline text-sm text-mist-100 placeholder:text-mist-500 focus-glow"
          />
        </div>

        {/* Sort dropdown */}
        <label className="inline-flex items-center gap-2 rounded-lg bg-mist-50/[0.04] hairline px-3 py-2 text-sm text-mist-200">
          <ArrowDownUp size={14} aria-hidden className="text-mist-400" />
          <span className="sr-only">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSingle("sort", e.target.value)}
            className="bg-transparent text-mist-100 focus:outline-none cursor-pointer"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id} className="bg-ink-900 text-mist-50">
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {/* Clear-all */}
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 tap-press touch-target"
          >
            <X size={12} aria-hidden />
            Clear
          </button>
        )}

        {/* Result count */}
        <span className="ml-auto text-[11px] uppercase tracking-wider text-mist-500">
          <span className="text-mist-50 font-semibold tabular-nums">
            {totalCount}
          </span>{" "}
          creators
        </span>
      </div>

      {/* Chip rows: niche | city | platform */}
      <div className="mt-3 flex flex-col gap-2.5">
        <ChipRow
          icon={<SlidersHorizontal size={11} aria-hidden className="text-mist-500" />}
          label="Niche"
          options={ALL_NICHES.map((n) => ({ id: n, label: n }))}
          selected={niches}
          onToggle={(v) => toggleArray("niche", v)}
        />
        <ChipRow
          label="City"
          options={ALL_CITIES.map((c) => ({ id: c, label: c }))}
          selected={cities as string[]}
          onToggle={(v) => toggleArray("city", v)}
        />
        <ChipRow
          label="Platform"
          options={ALL_PLATFORMS.map((p) => ({ id: p, label: p[0]?.toUpperCase() + p.slice(1) }))}
          selected={platforms as string[]}
          onToggle={(v) => toggleArray("platform", v)}
        />
      </div>

      {/* Price slider */}
      <div className="mt-4 px-1">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-mist-500">
          <span>Price range</span>
          <span className="tabular-nums text-mist-200">
            {fmtPriceK(localPriceLo)} – {fmtPriceK(localPriceHi)}
          </span>
        </div>
        <div className="relative mt-3">
          {/* visual track */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-mist-50/[0.08]"
          />
          <span
            aria-hidden
            className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-emerald-500/55"
            style={{
              left: `${(localPriceLo / 500_000) * 100}%`,
              right: `${100 - (localPriceHi / 500_000) * 100}%`
            }}
          />
          <input
            type="range"
            min={0}
            max={500_000}
            step={5_000}
            value={localPriceLo}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), localPriceHi - 5_000);
              setLocalPriceLo(v);
            }}
            aria-label="Minimum price"
            className="dual-range absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto"
          />
          <input
            type="range"
            min={0}
            max={500_000}
            step={5_000}
            value={localPriceHi}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), localPriceLo + 5_000);
              setLocalPriceHi(v);
            }}
            aria-label="Maximum price"
            className="dual-range absolute inset-0 w-full appearance-none bg-transparent pointer-events-auto"
          />
        </div>
        <style jsx>{`
          .dual-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            background: #10b981;
            border: 2px solid rgba(255, 255, 255, 0.85);
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
            cursor: pointer;
            pointer-events: auto;
            transition: transform 150ms ease;
          }
          .dual-range::-webkit-slider-thumb:hover {
            transform: scale(1.15);
          }
          .dual-range::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 9999px;
            background: #10b981;
            border: 2px solid rgba(255, 255, 255, 0.85);
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
            cursor: pointer;
            pointer-events: auto;
          }
          .dual-range {
            pointer-events: none;
            height: 24px;
          }
        `}</style>
      </div>
    </div>
  );
}

function ChipRow({
  icon,
  label,
  options,
  selected,
  onToggle
}: {
  icon?: React.ReactNode;
  label: string;
  options: Array<{ id: string; label: string }>;
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {icon}
      <span className="text-[11px] uppercase tracking-wider text-mist-500 w-16 shrink-0">
        {label}
      </span>
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            aria-pressed={active}
            className={
              "rounded-full px-3 py-1 text-xs font-medium transition-colors tap-press touch-target " +
              (active
                ? "bg-violet-500/20 border border-violet-500/40 text-violet-200"
                : "bg-mist-50/[0.04] hairline text-mist-300 hover:text-mist-50 hover:border-violet-500/30")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
