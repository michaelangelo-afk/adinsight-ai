# GrowthAds — Landing + Dashboard Prototype

The first slice of [GrowthAds](https://growthads.ng) — the growth platform built for Nigerian SMEs running ads on Meta, Google, and TikTok.

> **Status:** This is a high-fidelity interactive prototype with rich mock data. The UI/UX, types, and component architecture are production-grade; the data layer is wired to in-memory mock fixtures. Real Supabase / Meta / Paystack / OpenAI wiring is the next milestone.

---

## What's built

### 🌐 Public marketing site (`/`) — light green-and-white theme
- Hero-centric headline + embedded dashboard preview (connected platforms strip + automation tile)
- Bento-grid feature showcase — Smart automations / Multi-platform analytics / One-click deployment / AI recommendations / Weekly reports / Influencer marketplace
- How-it-works (3 steps: connect & deploy → build automations → analyze & scale)
- Pricing — Basic ₦25k / Pro ₦50k / Enterprise ₦150k (Naira-denominated, Paystack-billed)
- Closing CTA + footer

### 📊 Authenticated dashboard (`/dashboard`) — dark mode
- Sidebar nav with brand switcher + tier upgrade card
- Topbar (date range, search, notifications, profile)
- Hero metrics grid — total spend, conversions, avg CPC, ROI (with trend sparks)
- 30-day spend-vs-conversions area chart (recharts)
- Vertical platform-mix bar chart + best-cost-per-conversion callout
- AI recommendations panel with impact filters + ₦178k+ savings summary
- Sortable campaigns table with per-row sparkline
- Connected-accounts strip (Meta + Google, Connect/Sync controls)

---

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000
npm run typecheck      # tsc --noEmit
npm run build          # production build (runs full type-check)
```

Node ≥ 18.

---

## Architecture

```
/app
  /(dashboard)        # Dashboard route group
    layout.tsx        # Sidebar + main shell
    dashboard/page.tsx
  layout.tsx          # Root with Inter font
  page.tsx            # Landing composition
  globals.css         # Tailwind layers + design tokens

/components
  /brand/logo.tsx
  /ui                 # Button, Card, Badge primitives
  /landing            # Nav, Hero, Features, Workflow, Pricing, CTA, Footer
  /dashboard          # Sidebar, Topbar, Metrics, Charts, Recs, Campaigns

/lib
  /types.ts           # TS types mirroring Postgres schema (4.2 of the spec)
  /mock-data.ts       # Rich in-memory fixtures, deterministic
  /utils.ts           # Naira formatters, class-name merging
```

The `lib/types.ts` shapes match the database tables in section 4.2 of the spec 1:1, so when you wire Supabase you'll be replacing fixture reads with `supabase.from('campaigns').select(...)` and the rest of the tree stays untouched.

---

## Where to plug in the real backend

| Mock fixture (`lib/mock-data.ts`) | Real source |
|---|---|
| `dashboardSummary` | `supabase.rpc('dashboard_summary', { range })` or aggregate query |
| `trends` | `campaign_metrics` table aggregated by `date` |
| `recommendations` | `recommendations` table, refreshed daily by an Edge Function cron |
| `campaigns` | `campaigns` joined with latest `campaign_metrics` |
| `connectedAccounts` | `ad_accounts` filtered by `profile_id = auth.uid()` |
| `influencers` / `reports` | matching tables directly |

Authentication: drop Supabase Auth in `app/(dashboard)/layout.tsx` and gate the route group with a server-component session check.

---

## Design tokens

- **Brand green (primary)** — `violet-950 … violet-300` — forest → emerald (#15803D → #4ADE80). Used for CTAs, accents, focus rings, and the brand gradient.
- **Emerald (secondary)** — `naira-950 … naira-300` — bright teal-greens (#022C22 → #6EE7B7). Used for chart highlights, success states, and softer secondary chips.
- **Slate (text + borders)** — `mist-50 … mist-600` — clean Tailwind slate (#F8FAFC → #475569).
- **Surface (light landing)** — `surface-50 … surface-400` — white through warm off-white (#FFFFFF → #CBD5E1).
- **Ink (dashboard dark)** — `ink-950 … ink-500` — kept for the `/dashboard` route group only.
- Typography: Inter via `next/font/google`

All tokens live in `tailwind.config.ts`. The landing is light-mode by design; the dashboard inherits the dark `ink` palette.

---

## Roadmap notes

What's NOT yet built (intentionally — out of scope for this slice):

- Auth UI / Supabase Auth wiring
- Real Meta, Google, TikTok, X, LinkedIn, Snapchat OAuth + API flows
- Rule-engine for **smart automations** (e.g. auto-pause ads when CPC exceeds budget)
- Paystack subscription + escrow
- Influencer marketplace pages (data model is there; UI to come)
- Weekly PDF report generation
- AI recommendation prompt engineering
- Light/dark theme toggle (landing is light by design; dashboard is dark)

Each of these can be slotted in without changing the component tree.
