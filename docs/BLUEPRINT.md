# GrowthAds — Product Blueprint

**Status:** planning document, 2026-10-25. Grounded in `docs/PLATFORMS.md`,
`lib/platforms/catalog.json`, and the code already in `lib/` (Meta, Snapchat,
Google Ads clients; Supabase auth; dashboard and influencer UI on mock data).

**Scope note:** this is the full picture. The MVP is a small slice of it (§2).
Each phase is only started after the previous one is approved.

---

## 1. Vision

One workspace where a Nigerian SME (or agency) can:

1. **Connect** ad accounts and read them through real APIs.
2. **Create** ad graphics and short videos in a Studio, using AI models
   (image: Nano Banana / Gemini image models; video: Sora 2 and other video
   APIs) behind one provider-agnostic interface.
3. **Deploy** campaigns to the channels that have a write API, with a review
   step before anything goes live.
4. **Discover and book** influencers in a marketplace, measured against ads.
5. **Understand** results through insights and scheduled reports.

Design bar: "topclass" means the product is fast, consistent, accessible, and
honest about what it can and cannot do for each channel (see the catalog's
`apiAccess` and `wave` fields).

---

## 2. MVP definition

The MVP is **3–4 working integrations with read and write**, plus automated
deploy and analytics reports. Proposed:

| # | Integration | Read | Write | Why it is in the MVP |
|---|---|---|---|---|
| 1 | Meta Marketing API | ✅ | ✅ create/pause campaigns | Largest NG reach; OAuth client already exists |
| 2 | Google Ads API | ✅ | ✅ create campaigns | Explorer access is auto-approved; client exists |
| 3 | Snapchat Marketing API | ✅ | ✅ | Open to all developers; client exists |
| 4 | Google Business Profile | ✅ | ✅ posts/offers | Free, no business-entity gate |

Torano promoted listings is free and owned by us, but it is the moat for a
later phase, not an MVP integration.

**Not in the MVP:** TikTok and Meta "Full" access (both need business
verification), X (paid API), LinkedIn (partner-gated), any browser automation
(rejected in `PLATFORMS.md` §2), and assisted-posting channels (Jiji,
Nairaland) beyond a copy/paste kit.

**Explicit MVP decision for you:** Meta Full access needs a registered business
(CAC business name). Until then, Meta runs on Limited access. Confirm this is
acceptable for the MVP.

---

## 3. Core modules

### 3.1 Integrations hub
- Provider adapters behind one interface: `connect`, `listAccounts`,
  `listCampaigns`, `fetchInsights`, `createCampaign`, `setStatus`.
- Encrypted token storage with refresh handling (Meta long-lived tokens,
  Snapchat and Google refresh tokens already have helpers).
- Health checks per connection; a `/api/health/*` route per provider.

### 3.2 Studio (AI creative)
- Provider-agnostic `ImageGenerator` and `VideoGenerator` interfaces. Nano
  Banana and Sora 2 are first adapters; others are added as adapters, not
  rewrites.
- Brand kit (logo, colors, fonts, voice), templates per channel size spec, and
  a variant generator for A/B tests.
- Asset library with versioning, usage rights notes, and content moderation
  before publish.
- Cost guard: per-plan credit budget and a per-generation cost estimate shown
  before the call.

### 3.3 Campaign deploy
- Campaign draft → review → deploy pipeline. Deploy is idempotent (a
  retried job never creates a duplicate campaign).
- Per-channel validation against the catalog (budget minimums, creative sizes,
  objective names).
- Job queue with retries and a visible job log per campaign.

### 3.4 Insights and reports
- Daily sync of spend, impressions, clicks, conversions per channel into our
  database.
- Dashboards (existing UI, switched from mock data to real queries).
- Scheduled PDF/email reports, plus the "recommendations" engine rebuilt on
  real data.

### 3.5 Influencer marketplace
- Creator profiles, search and fit scoring (logic exists in `lib/influencer/`).
- Shortlist, outreach, and booking flow. Payments are a later decision.
- Compare creator reach against ad reach (`compare-to-ads.ts`).

### 3.6 Accounts, billing, and admin
- Supabase auth and organisations (exists in part). Roles: owner, editor,
  viewer.
- Billing via the payment provider chosen in `torano-work/docs/PAYMENTS-*`.
- Admin view for support: connection status, failed jobs, usage.

---

## 4. Architecture

- **Frontend and API:** Next.js App Router (existing).
- **Database and auth:** Supabase Postgres with row-level security on every
  table that holds an organisation's data. Migrations live in
  `supabase/migrations/`.
- **Background work:** a queue for sync, deploy, and generation jobs (a
  Postgres-backed queue is enough for the MVP; add a managed queue later).
- **Secrets:** all provider tokens encrypted at rest. Never returned to the
  client after the initial OAuth.
- **Storage:** generated images and videos in object storage with signed URLs.
- **Observability:** structured logs per job and per provider call; error
  monitoring; provider rate-limit tracking (Meta: 60 points/300 s on Limited).

---

## 5. Phased roadmap

Each phase ends with working, verified behavior, not just code.

**Phase 0 — Foundations (1 week)**
- Create the connections table and token encryption; apply migrations.
- Replace mock data on the dashboard with a real query for one connected
  account.
- Exit: a user can connect Meta and see real spend.

**Phase 1 — MVP integrations (3–4 weeks)**
- Meta, Google Ads, Snapchat: connect, list, read insights, sync daily.
- Google Business Profile: connect, list locations, create a post.
- Exit: each integration passes a read test and a write test against a sandbox
  or test account.

**Phase 2 — Automated deploy (2 weeks)**
- Campaign draft, review, and deploy through the job queue; idempotency and
  retries; per-channel validation.
- Exit: a draft deploys to two channels with one click, and a replayed job
  creates no duplicates.

**Phase 3 — Insights and reports (2 weeks)**
- Real dashboards, scheduled reports, recommendations on real data.
- Exit: a scheduled report is delivered on time with numbers matching the
  provider's own reporting within a stated tolerance.

**Phase 4 — Studio (3–4 weeks)**
- Image adapter (Nano Banana) first, then video (Sora 2). Brand kit, templates,
  asset library, cost guard.
- Exit: a generated creative is saved, sized for a channel, and can be attached
  to a deployed campaign.

**Phase 5 — Influencer marketplace (3 weeks)**
- Profiles, search, shortlist, outreach. Replace mock creators with real
  records.

**Phase 6 — Production hardening (ongoing, starts in Phase 1)**
- Security review, RLS tests, load test of sync jobs, backup and restore drill,
  uptime monitoring, incident runbook, legal pages, data-protection (NDPA 2023)
  review.

---

## 6. Production readiness checklist

- [ ] Every table has RLS, with tests that prove cross-tenant reads fail.
- [ ] All provider tokens encrypted; no token in logs or responses.
- [ ] Every OAuth flow has state verification and tests (already started).
- [ ] Each integration has an automated read test and write test.
- [ ] Deploy jobs are idempotent and retried safely.
- [ ] Typecheck, lint, unit, and end-to-end tests pass in CI.
- [ ] Error monitoring, job dashboards, and alerts in place.
- [ ] Backups tested by restore.
- [ ] Legal: terms, privacy policy, NDPA compliance, provider terms reviewed.
- [ ] Load tested at the expected number of connected accounts.

---

## 7. Decisions needed from you

1. **MVP integrations:** confirm Meta, Google Ads, Snapchat, and Google Business
   Profile, or swap one.
2. **Meta access:** accept Limited access for the MVP, or start the business
   registration now.
3. **Studio providers:** confirm Nano Banana and Sora 2 as the first two, and
   whether there is a budget for paid generation during testing.
4. **Payments:** which provider from `torano-work/docs/PAYMENTS-PROVIDERS.md`.
5. **Influencer payouts:** in scope for the marketplace, or booking only.

---

## 8. Immediate next step

Phase 0: create the connections table with encrypted tokens, and move the
dashboard off mock data for one real connected account. It is the smallest
step that unblocks every later phase.
