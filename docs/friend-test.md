# Meta OAuth — friend-test checklist

One-page runbook for the friend-test tomorrow: real Meta Ads account +
real Meta Graph API + real `meta_connections` row written by the
OAuth callback route at `/api/auth/meta/callback`.

The goal of the test is **end-to-end proof** that the Phase 3 wiring
works against Meta's real servers — token exchange → long-lived token
swap → `ads_management` scope verification → DB upsert → dashboard
re-render with live data. Today's demo mode is a crutch; this test
swaps in the real path.

---

## 0. Pre-test checklist (run ~30 min before the call)

Run these **locally** before the friend joins the call. None of these
require real Meta credentials — they verify our wiring is sane.

- [ ] **Repo is on the latest commit on `main`.** `git log --oneline -5`
      and confirm the demo-mode + Meta-logo + accounts-strip commits
      are present.
- [ ] **Env file is fresh.** `cp .env.local.example .env.local`
      (overwrites any stale copy), keep `META_APP_ID` and
      `META_APP_SECRET` blank for the pre-test sanity checks.
- [ ] **Env-validation error path renders cleanly.** Visit
      `http://localhost:3000/dashboard`, click **Connect**, confirm
      the toast reads: *"Meta OAuth isn't configured. Add META_APP_ID
      and META_APP_SECRET to .env.local…"*. If it does, the env
      validation is wired correctly.
- [ ] **OAuth URL builds correctly with placeholder values.** Open
      `lib/meta/env.ts` in your editor and temporarily paste your
      real `META_APP_ID` and `META_APP_SECRET`. Restart `npm run dev`.
      Click **Connect** again. The browser should redirect to
      `https://www.facebook.com/v18.0/dialog/oauth?…` with a `state`
      parameter. **DO NOT paste a real secret you don't want to share
      with anyone — the redirect is over HTTPS to Meta's servers and
      shows nothing sensitive, but be careful.**
- [ ] **Clean up.** After pre-test, revert `lib/meta/env.ts` to its
      blank state and remove your draft from `.env.local`. Restart
      dev server.
- [ ] **Demo mode still works.** Click **Try demo**, refresh, confirm
      the "Meta Ads · demo" pill appears AND that the analytics
      widgets now show real-looking numbers (campaigns, spend,
      recommendations). The demo data is sourced from
      `lib/mock-data.ts`.

If any of the above fails, **fix before the call** — there's no value
in the friend-test if the local path is broken.

---

## 1. What your friend needs to send (before the call)

Send her this message verbatim or copy-paste the relevant lines:

> **Hi [name] — quick checklist for tomorrow's Meta test:**
>
> 1. Create (or re-use) a Meta app at
>    https://developers.facebook.com/apps. If you have one already,
>    grab the **App ID** and **App Secret**.
> 2. Under your app's **Settings → Basic**, copy the **App ID** (a
>    number) and the **App Secret** (Show → copy).
> 3. Under **Facebook Login → Settings**, add this **exact** redirect
>    URI to the *Valid OAuth Redirect URIs* list:
>    `http://localhost:3000/api/auth/meta/callback`
>    (Production redirect URI is different — I'll set it on Vercel
>    later.)
> 4. Make sure you're **logged into facebook.com** as the user whose
>    ad account you want to test with.
> 5. **Add me as a Developer or Tester** on your app:
>    your app → **Settings → Roles → Roles** →
>    **Add → Admin / Developer / Tester**, paste my Facebook
>    profile URL or uid. This is required because a Meta app in
>    *Development* mode (the default for every new app) blocks the
>    OAuth login flow for any user outside the Admin / Developer /
>    Tester list — the dialog opens, the consent screen appears,
>    then Meta redirects back with `error=access_denied` and we see
>    *“Meta denied: access_denied”*. Skipping this step is the
>    single most common silent failure for the friend-test.
> 6. Send me back:
>    - the **App ID**,
>    - the **App Secret** (treat carefully — I'll put it in
>      `.env.local` only, never commit it),
>    - the **ad account ID** you want me to scope the test to (an
>      `act_` prefixed number, e.g. `act_8472901234`).
>
> **Don't** share your Facebook password. The OAuth flow uses the
> official facebook.com redirect — your app ID + secret is all I
> need.

Once she sends those values, paste them into `.env.local`:

```
META_APP_ID=<her-app-id>
META_APP_SECRET=<her-app-secret>
META_REDIRECT_URI=http://localhost:3000/api/auth/meta/callback
```

Restart `npm run dev`.

---

## 2. The OAuth dance (what she'll see, step by step)

Walk her through it on the call. Each step has a "this worked /
this broke" indicator.

| # | What she'll see | Worked if… | Broke if… |
|---|---|---|---|
| 1 | You click **Connect** on the dashboard | Browser navigates to `facebook.com/v18.0/dialog/oauth` with a green Meta screen | Stays on `/dashboard?meta_connect=failed` with the env-misconfig toast (env vars missing) |
| 2 | Meta shows **"Log in with Facebook"** for your app | Facebook login form appears | Permission denied? — likely an app-review issue; check `developers.facebook.com/apps/.../app-review/` |
| 3 | Meta permission dialog: *"Allow this app to access your ad accounts?"* | Two grant buttons: ads_management + ads_read | One or both missing — app's "Permissions & Features" page needs them added |
| 4 | Meta redirects back to `http://localhost:3000/api/auth/meta/callback?code=…&state=…` | Toast: *"Meta account connected."*, dashboard re-renders with the synthetic Supabase Meta Ads account pill replaced by a real "Meta Ads · live" pill | Red toast: *"Meta denied: …"* (she declined), or *"Meta OAuth state mismatch — possible CSRF."* (cookie expired before redirect; bump STATE_MAX_AGE in `app/actions/meta.ts`) |
| 5 | Dashboard refresh: a new row in `meta_connections` | Query Supabase: `select * from meta_connections where user_id = '<her-user-id>';` shows a real `meta_user_id` (numeric FB id) and a valid access_token hash | Row missing — `upsertMyMetaConnection` failed; check Supabase logs for the service-role error |

---

## 3. What to screenshot if anything breaks

These are the four URLs / state surfaces that matter:

1. **The exact URL in the address bar** after step 1 — share it
   raw. Long URLs with `?code=…&state=…` should be **redacted in
   screenshots** (paste them into a chat, don't screenshot).
2. **The toast text** on `/dashboard` — both success AND failure
   paths have human-readable text, capture it verbatim.
3. **Supabase `meta_connections` row** — `select * from
   meta_connections;` in the dashboard, screenshot the columns
   except `access_token` (redact that one).
4. **The Meta app's "Permissions & Features" page** — so we can see
   which permissions have been granted in app-review vs ad-hoc.

---

## 4. Post-test verification (run right after step 4 above)

Run these after the dashboard re-renders, to make sure the row + UI
are consistent.

**Database sanity:**

```sql
-- 1. The meta_connections row exists with a real (non-demo) meta_user_id.
select id, user_id, meta_user_id, status, scopes,
       (access_token is not null) as has_token,
       length(coalesce(access_token, '')) as token_len
from   meta_connections
where  user_id = auth.uid();

-- 2. The demo cookie was cleared by the callback route.
-- (Check via the browser devtools — Application → Cookies → meta_demo.
-- If it's still "1", the cleanup step in app/api/auth/meta/callback/route.ts
-- didn't run.)
```

**Dashboard sanity:**

- [ ] **No demo pill.** The synthetic *"Meta Ads · demo"* chip is gone
      — replaced by a real *"Meta Ads"* + *"live"* pill.
- [ ] **Account pill shows the friend's Meta ad account.** The
      `platformAccountId` matches the `act_` value they sent.
- [ ] **Pause / Resume on a real Meta campaign works.** Click the
      pause icon on any Meta campaign row in the campaigns table;
      Meta Ads Manager should reflect the pause within a few seconds.

**Failure surfaces to watch:**

- [ ] **Sync button works.** Click Sync — should hit Meta's
      `/me/adaccounts` and upsert into `meta_accounts`.
      Verify with: `select count(*) from meta_accounts where user_id =
      auth.uid();`
- [ ] **Long-lived token swap.** Inspect `expires_at` in the row —
      if it's ±2 hours from now, the long-lived swap failed in
      `exchangeCodeForToken`. Check `lib/meta/client.ts` — it chains
      short-lived → long-lived via `/oauth/access_token` with
      `grant_type=fb_exchange_token`.

---

## 5. Rollback / undo story

If something goes badly wrong and we want to roll back the test to
demo mode:

```bash
# 1. Clear the demo cookie + the real connection in DB:
psql $SUPABASE_URL \
     -c "update meta_connections set status='revoked',
                                 access_token=null,
                                 refresh_token=null,
                                 updated_at=now() where user_id=auth.uid();"

# 2. Set the demo cookie again so the dashboard reverts to mock data:
#    (In the browser devtools console, document.cookie won't work
#    because it's httpOnly — point the friend back at the Try demo
#    button.)
```

After rollback, the user sees the demo pill + mock data again. No
code changes required — the cookie-based demo + cleanup-on-callback
plumbing means we can flip between real and demo data per user
without a deploy.

---

## 6. Decision tree (when to ship, when to wait)

After the test, decide which follow-up to take:

```
✓ Token exchange + scope verify + DB upsert + dashboard re-render
  → Phase 3 is end-to-end live. Move to production deploy (Vercel)
    with her real environment variables.

✗ Token exchange worked but scope verify failed
  → Likely app-review pending. Try a different test user. If the
    friend has Business Manager access, use their Business Verification
    account.

✗ Token exchange failed at the short-lived step
  → Likely wrong App Secret or expired App Secret. Reset it
    in Meta app dashboard and retry.

✗ Token exchange worked but DB upsert failed
  → Service-role JWT expired or RLS misconfigured. Check the
    `meta_connections_safe` view in migration 0001.

✗ Everything worked but dashboard shows zero data
  → Likely the `meta_accounts` → `meta_campaigns` table writes
    from `syncInsightsImpl` need additional columns. Add a
    migration; restart from step 4.
```

---

## 7. Open questions your friend might answer

- Does she have a Meta Business Manager? → Required for
  `business_management` permission if we want to read
  brand-aware assets.
- Are her campaigns in **Nigerian Naira (NGN)** or USD? →
  Affects whether `currency` in `meta_accounts` is set correctly.
- Has she granted this Meta app access before? → A previously-
  granted user gets a silent auto-redirect instead of the permission
  dialog, which can confuse screenshot debugging.

---

## TL;DR for you (the dev)

Pre-test: `cp .env.local.example .env.local`, leave META_* blank,
restart, click Connect — confirm the env error toast. Done.

Test: paste her `META_APP_ID`/`SECRET`/redirect into `.env.local`,
restart, click Connect, walk her through the oauth dance.

Post-test: `select * from meta_connections where user_id = auth.uid();`
and `select count(*) from meta_accounts where user_id = auth.uid();`
to confirm the rows. The dashboard re-render is the user-visible proof.

---

## 8. Automated CI test (covers everything below the surface)

`tests/e2e/meta-oauth.spec.ts` drives the **same** roundtrip against
Facebook's Test User sandbox (developers.facebook.com → app → Roles →
Test Users → API) and runs on every PR + push to `main` via
`.github/workflows/e2e.yml`. When it passes, the only remaining
unknowns are the three app-config items above (Tester role, redirect
URI whitelisted, basic app settings filled in) — friend-test is only
worth escalating when the spec itself fails.

Run locally:

```bash
# Need a TEST Supabase project (NOT production) + a real Meta app
# whose Valid OAuth Redirect URIs includes http://localhost:3000/api/auth/meta/callback.
export NEXT_PUBLIC_SUPABASE_URL=https://<test-ref>.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=...
export SUPABASE_SERVICE_ROLE_KEY=...
export META_APP_ID=...
export META_APP_SECRET=...
# Optional:
export META_REDIRECT_URI=http://localhost:3000/api/auth/meta/callback
npm run e2e
```

The spec auto-skips (no red bar) when any of those env vars are
missing, so a vanilla dev shell stays green. Skipping is loud —
`test.skip()` reports why in the output.

What's covered:

1. Pre-flight `GET /api/health/meta` is ready + redirect URI matches.
2. Sign in to Supabase (using a freshly-admin-provisioned user so the
   callback isn't redirected to `/login`).
3. Create a Facebook test user (`POST /{appId}/accounts/test-users`)
   with `ads_read`, `ads_management`, `read_insights` pre-granted.
4. Drive the OAuth dialog through Playwright Chromium — sign in as
   the test user via `login_url`, click Connect, click the consent
   confirm button.
5. Assert the redirect lands on `/dashboard?meta_connect=ok`, the
   `meta_oauth_state` + `meta_demo` cookies are cleared, and the
   `meta_connections` row was written via service-role Supabase read
   (`meta_user_id` = test user FB id, `status` = `active`,
   `access_token.length > 100`).
6. Teardown: delete the Facebook test user + the Supabase user in
   `afterAll` (best-effort; CI cancellation mustn't leak orphan FB
   users).

What it does NOT cover:

- Tester/Developer role on the Meta app (this is a static,
  admin-side configuration; the test API auto-handles test users
  themselves).
- Redirect URI whitelist — pre-flight checks the configured value
  matches what the server reports, but only Meta can confirm the
  whitelist is real.
- The demo-mode flow (`connectDemoMeta`) — covered by the manual
  checklist.

---

## 9. Remote Dev Environments — ngrok / Cloudflare Tunnel / Vercel

If your dev server runs on a machine that isn't directly reachable
from the open internet (a Virtual Private Desktop / VDI, an
SSH-only box, an AWS EC2 with locked-down security-group ingress, or
most cloud dev sandboxes), `http://localhost:3000` — *and* your
machine's bare public IP, e.g. `http://198.105.126.188:3000` — **won't
work** as `META_REDIRECT_URI`. After you click "Allow" on the
Facebook consent screen, Meta's servers POST back to that URL, the
connection times out, and you'd see "Meta denied: …" or a stuck
loading spinner.

You need a public HTTPS URL that tunnels back to your local port.
Three options, ordered by ease:

### Option A — ngrok (~2 min, recommended for the friend-test)

```bash
# Install once (any package manager works).
brew install ngrok          # macOS
sudo apt install ngrok      # Debian/Ubuntu
winget install ngrok        # Windows

# Start the tunnel against your dev server.
ngrok http 3000

# Output:
#   Forwarding  https://abc1234.ngrok.app → http://localhost:3000
```

In `.env.local`:

```
META_REDIRECT_URI=https://abc1234.ngrok.app/api/auth/meta/callback
```

In your Meta app dashboard: **Facebook Login → Settings → Valid
OAuth Redirect URIs**, paste the same URL. Restart `npm run dev`.

Ngrok free tier generates a new URL per restart — fine for the
friend-test, but if you want URLs to stick across restarts, pay for a
reserved subdomain.

### Option B — Cloudflare Tunnel (~3 min, requires free account)

```bash
brew install cloudflared
# or: curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
cloudflared tunnel --url http://localhost:3000
# Output: https://<random>.trycloudflare.com
```

Same `.env.local` + Meta dashboard steps as ngrok. Cloudflare
reserves the URL within a single session for free; pay for a named
tunnel if you want URLs to stick.

### Option C — Deploy to Vercel (production-shape, ~30 min)

Best when you also want the rest of the app on a real domain. Set
the production `META_REDIRECT_URI` to your Vercel URL on the project's
env-vars page (Dashboard → Project → Settings → Environment
Variables). Same URL shape as ngrok but server-side — no tunnel
needed, and you'll have a public base URL for the rest of the spec,
docs, and demos.

---

**TL;DR:** the redirect URI must be reachable from `graph.facebook.com`.
Pick whichever of A / B / C matches your setup, paste the public
HTTPS URL into BOTH `.env.local.META_REDIRECT_URI` AND your Meta
app's *Valid OAuth Redirect URIs*, restart `npm run dev`, retry
Connect.
