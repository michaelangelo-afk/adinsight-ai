# GrowthAds — Landing + Dashboard Prototype

The first slice of [GrowthAds](https://growthads.ng) — the growth platform built for Nigerian SMEs running ads on Meta, Google, and TikTok.

> **Status:** Phase 1 backend foundation is live. Auth UI, onboarding flow, database schema, RLS policies, server actions, and middleware are all wired up. The dashboard is still on the rich in-memory mock fixtures (`USE_MOCK_DATA=false` flips to real Supabase). Real Meta / Paystack / OpenAI wiring is the next milestone.

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

Node ≥ 20.

## Connecting to Supabase (Phase 1 is ready)

1. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your project's anon/jwt-format key)
   - `SUPABASE_SERVICE_ROLE_KEY` (server actions only — **never expose to client**)
2. Run migrations against your project.

### Option A: SQL Editor (simplest, fully under your control)
Open https://supabase.com/dashboard/project/dyfeolrotkjmeauiknbx/sql and paste the contents of each file in order. Run them as **separate** statements (do not combine into one batch):
   ```
   1. supabase/migrations/001_schema.sql       ← tables + enums + extensions
   2. supabase/migrations/002_policies.sql     ← RLS policies + triggers + indexes
   3. supabase/migrations/003_fix_ad_accounts_access.sql ← column-level GRANTs + SELECT policy
   ```
   *Why three separate files?* The `organizations` RLS policy references `users`, but `users` references `auth.users`. Postgres rejects policies that reference tables not yet created. The 003 migration is a follow-up fix because `security_invoker=true` views can't carry RLS policies on all PG versions.

### Option B: Supabase CLI
```
supabase login                    # generate / paste a personal access token
supabase link --project-ref dyfeolrotkjmeauiknbx
supabase db push                  # apply all migrations in supabase/migrations/
```

### Option C: Management API (curl)
```
PAT=sbp_xxx...   # personal access token from https://supabase.com/dashboard/account/tokens
for f in supabase/migrations/0*.sql; do
  curl -X POST -H "Authorization: Bearer $PAT" -H "Content-Type: application/json" \
    "https://api.supabase.com/v1/projects/dyfeolrotkjmeauiknbx/database/query" \
    --data-binary "$(python3 -c "import json; print(json.dumps({'query': open('$f').read()}))")"
done
```

3. Set `USE_MOCK_DATA=false` in `.env.local` to flip the dashboard onto real Supabase reads. Leave it as `true` for offline development.

If env vars are missing or Supabase is unreachable, the middleware + layout fall through safely (the dashboard will redirect to `/login`).

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
  /supabase
    /client.ts        # Browser client (auth forms)
    /server.ts        # Server client + service_role client
    /middleware.ts    # Edge-runtime safe Supabase session ref

/supabase
  /migrations
    001_schema.sql    # Tables + enums (run first)
    002_policies.sql  # RLS policies + triggers + indexes (run second)

/app
  /actions             # Server actions: auth, onboarding, dashboard
  /(auth)
    /login, /signup, /onboarding
  /auth/callback       # Supabase email confirmation receipt
  /api/onboarding      # POST endpoint wrapper around completeOnboarding
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

## Schema (run against Supabase Postgres)

| Table | Purpose | Tenant-scoped via |
|---|---|---|
| `organizations` | Root tenant record | `id` |
| `users` | Profile linked to `organizations` (auto-created on signup) | `auth.uid()` |
| `subscriptions` | Plan tier + Paystack sub codes | `organization_id` |
| `ad_accounts` | Platform (Meta/Google/TikTok) OAuth tokens | `organization_id` |
| `campaigns` | Live campaigns synced from platforms | `organization_id` |
| `campaign_metrics` | Daily spend / clicks / conversions breakdown | `campaign_id → organization_id` |
| `recommendations` | AI-generated reallocation / pause suggestions | `organization_id` |
| `reports` | Generated weekly PDF reports | `organization_id` |

OAuth tokens in `ad_accounts.encrypted_token` are protected by column-level GRANTs (set in migration 003) — the `authenticated` role has zero SELECT privilege on that column. Combined with the org-scoped SELECT RLS policy, users can read their own org's ad_accounts minus the token; `service_role` retains full access for Edge Function decryption flows.

## Roadmap notes

What's NOT yet built:

- Meta / Google / TikTok OAuth + sync Edge Function
- Paystack subscription + webhook
- Influencer marketplace UI
- AI recommendations pipeline

These can all be slotted in without breaking the existing component tree.

## End-to-end tests

```bash
npm run e2e            # Playwright; auto-spawns `next dev` locally /
                       # `next build + next start` on CI, exits cleanly when env is missing
npm run e2e:ui         # Playwright UI for debugging

Required env (the spec auto-skips without these):
  NEXT_PUBLIC_SUPABASE_URL  + ANON_KEY + SUPABASE_SERVICE_ROLE_KEY
  META_APP_ID + META_APP_SECRET
  META_REDIRECT_URI=http://localhost:3000/api/auth/meta/callback  (optional override)
```

The spec at `tests/e2e/meta-oauth.spec.ts` drives the full Meta OAuth
roundtrip against Facebook's Test User sandbox via `chromium`. CI runs
it on every PR + push to `main` (`.github/workflows/e2e.yml`). See
`docs/friend-test.md` §8 for the coverage matrix vs. the manual
runbook.

# Generated 2026-07-08: triggered redeploy so Supabase env vars take effect.
