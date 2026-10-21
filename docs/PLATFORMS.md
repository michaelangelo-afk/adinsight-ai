# GrowthAds — Platform Integration Matrix

**Status:** research note, updated 2026-10-19. Desk research from each platform's own
developer/help pages. Nothing here is integrated yet.

**See also:** [`FREE-AD-PLATFORMS-NIGERIA.md`](./FREE-AD-PLATFORMS-NIGERIA.md) for
Nigerian traffic figures, zero-naira playbooks, the 2026 API changes and the
Playwright verdict. The machine-readable matrix is
[`lib/platforms/catalog.json`](../lib/platforms/catalog.json).

**Question this answers:** can GrowthAds reach ~15 advertising channels, and can
we use headless-browser automation (Playwright/Chromium) for the ones without
an API?

**Short answer:** 15+ real read/write integrations are achievable — but they
cannot all be free, and browser automation must **not** be used for third-party
posting. See §2.

---

## 1. The three findings that shape everything

1. **"Free + read/write API" is a small set, and it grew in 2026.** The genuine
   members are Google Business Profile, Google Merchant Center free listings,
   Torano's own promoted listings, **Snapchat** (open Marketing API), **Google
   Ads Explorer** (free production access, 2,880 ops/day) and **WhatsApp Cloud**
   (free API, metered messages). Everything else free has **no API**; everything
   else with an API **costs money or verification**.
2. **Cheap ≠ free, and that's fine.** Ad networks like Adsterra, PropellerAds
   and MGID have real, documented **write** APIs and cost only ad spend. They
   are the volume tier.
3. **Browser automation for posting is out.** §2 explains why, and §6 gives the
   legally clean replacement concept.

---

## 2. Browser automation (Playwright/Chromium) — verdict: do not build

The proposal was: where a platform has no API, drive its web UI with Playwright
and post ads automatically. This is rejected, for four independent reasons.

### 2.1 Platform Terms of Service prohibit it

Automated access and posting is banned by every major platform — Meta, Google,
TikTok, LinkedIn, X, Jiji, Nairaland, OLX. Breaching a ToS is a **contract**
matter, not automatically a criminal one. But the enforcement is immediate and
severe: **account termination**.

### 2.2 The US case law does not cover this

Do not over-read these:

| Case | What it actually decided |
|---|---|
| *hiQ Labs v. LinkedIn* (9th Cir.) | Scraping **public** pages **without authenticating** is not a CFAA violation |
| *Meta v. Bright Data* (2024) | Same — public data, no auth bypass; ToS breach alone isn't CFAA |
| *Van Buren v. United States* (2021) | CFAA is "gates-up-or-down": misusing *authorized* access isn't a federal crime |

None of these authorise **writing content into a password-protected account via
an automated browser**. Scraping public data and posting into an account are
different acts. Extrapolating from these cases is a mistake.

### 2.3 Nigerian legal exposure

- **Cybercrimes (Prohibition, Prevention, etc.) Act 2015, as amended 2024** —
  s.6 concerns unauthorised access. Account-holder authorisation is a defence,
  but the 2024 amendments broaden the terrain and this has not been tested for
  this fact pattern.
- **Nigeria Data Protection Act 2023 (NDPA)** applies if personal data moves
  through the automation.
- **Contract / tortious interference** with the platform's business is the more
  realistic claim.

> Not legal advice. Get Nigerian counsel before shipping anything in this space.

### 2.4 It fails technically and commercially anyway

- **Nairaland already runs an aggressive anti-spam bot that bans users for
  posting ads.** There are public threads of users banned outright. This is the
  single clearest demonstration of the failure mode.
- Jiji runs anti-fraud. Then: CAPTCHA, 2FA, device fingerprinting, IP bans, and
  silent layout changes with no notice.
- **The commercial killer:** GrowthAds charges an SME ~₦25,000/month. If the bot
  gets *their* Facebook or Jiji account banned, that is a refund, a reputation
  fire, and an unwinnable support conversation. The customer pays for the
  damage, not the platform.
- You would own **15 brittle scrapers forever**, each breaking on a third
  party's schedule.

**Conclusion:** automation is a liability multiplier, not a channel strategy.

---

## 3. Tier 1 — free, with a genuine read/write API

The cleanest matches to "free + read/write API", with no business-entity gate.
Snapchat and Google Ads Explorer also qualify but sit in Tier 3 because their
onboarding is different.

| Platform | Read | Write | Cost | Nigerian reach | Gate | Build effort |
|---|---|---|---|---|---|---|
| **Google Business Profile API** | ✅ | ✅ Posts (Updates / **Offers** / Events), hours, photos, review replies | **Free** | **High** — Search + Maps | API access-request approval form | Low–Med |
| **Google Merchant Center** (Merchant API) | ✅ | ✅ Product feeds → free listings across Search, Maps, YouTube | **Free listings** | Med–High | Merchant Center account approval | Med |
| **Torano promoted listings** | ✅ | ✅ | **Free** | Your own users only | **None** — you own it | Low |

**Notes**
- Google Business Profile is the standout: free, official, read/write, and
  almost universally neglected by Nigerian SMEs. Ships with zero legal exposure.
- **`Content API for Shopping` is deprecated** — its successor is the
  **Merchant API**. Free listings are on by default in Merchant Center Next.
- Torano promoted listings needs no third party, no review, and no gate. It is
  the strategic moat — see the feasibility note.

---

## 4. Tier 2 — real read/write APIs, cheap but not free

This is the volume tier. Every entry has a documented write surface.

| Platform | Read | Write | Cost | Nigerian reach | Gate | Build effort |
|---|---|---|---|---|---|---|
| **Adsterra** | ✅ | ✅ REST Ads API v3 — create Popunder/CPM campaigns, edit bids, update creatives, blacklist/whitelist placements | Ad spend only (min deposit) | Global, incl. NG traffic | Account + API token | Low |
| **PropellerAds** | ✅ | ✅ API opened to **all** advertisers | Ad spend only | Global | Account | Low |
| **MGID** | ✅ | ✅ REST API — "retrieve, **add**, and modify"; native ads | Ad spend only | Global | Account | Low–Med |
| **Microsoft Advertising** | ✅ | ✅ Full API (REST; SOAP deprecated 2027-01-31) | Cheap PPC | Works in NG; low competition | Developer token; **up to 5 business days** for third-party approval | Med |
| **Opera Ads** | ✅ | ⚠️ **Read-only** | Ad spend only ($100 minimum at launch) | **Very high** — 14.23% of Nigerian browser share, #2 after Chrome | Token issued by Opera (contact them) | Med |
| **Outbrain / Teads** | ✅ | ✅ Amplify API | Mid spend | Low in NG | Account | Med |
| **Adform** | ✅ | ✅ Campaigns Management API | Mid spend | Low in NG | Account | Med |

**Important nuance on Opera Ads:** it is the best *local-reach* channel available
— Opera has one of the largest browser footprints in Nigeria. But its documented
APIs are **reporting/measurement** (Report API for daily delivery; Marketing API
for server-to-server conversion events). No documented campaign-creation API was
found. Writes happen in the Opera Ad Manager console. So Opera is
**integrate-for-reporting, post-via-console**.

---

## 5. Tier 3 — real APIs, but gated

| Platform | Write API | The gate | Build effort |
|---|---|---|---|
| **Google Ads** | ✅ | **Developer tokens sunset 2026-09-09.** Access now belongs to the Google Cloud project: **Test** (15,000 ops/day, test accounts) → **Explorer** (production, 2,880 ops/day, auto-approved in most cases; no account creation, user management, planning or billing) → **Basic** (15,000 ops/day, needs **brand verification**) → **Standard** (unlimited, **manual audit with demo sign-in**, ~10 business days, plus "permissible use" = ad creation/management) | Med |
| **Meta** | ✅ | Two-tier: **Limited** (default, 60 points/300s) vs **Full** (9,000 points). Full needs 500+ Marketing API calls in 15 days, error rate <15%, **App Review**, and **Business Verification** (legal-entity documents). Previously "Ads Management Standard Access" / "Advanced Access"; renamed 2026-05-04. | Med–High |
| **TikTok** | ✅ | **Business verification** (business certificate + photo ID of legal representative) **then** industry qualification review | Med–High |
| **Pinterest** | ✅ | Developer app + review | Med |
| **Snapchat** | ✅ | **Open to all developers.** Business account + OAuth app; campaign creation, creatives, audiences and reporting. No general app-review queue documented as of 2026-10. | **Low–Med** |
| **Reddit** | ✅ | Ads API access request | Low–Med |
| **X** | ✅ | **No free tier.** Pay-per-use API; writes **$0.015/post** from 2026-04-20. Legacy $200 Basic is closed to new subscribers. Ads API is separate and restricted. | Med (paid) |
| **LinkedIn** | ✅ | **Partner-gated** — approved Marketing Partner agreement | High |
| **Amazon Ads** | ✅ | Account + review | High (low NG relevance) |
| **Apple Search Ads** | ✅ | API user + roles | Med (low NG relevance) |
| **Quora** | ✅ | Ads API access | Low–Med |

**Reality check:** Tier 3 is where the *marketing* promises live ("one-click
deploy to Meta, Google and TikTok"). It is not uniformly hard in 2026: **Snapchat
is open**, and **Google Ads Explorer is auto-approved** and enough for SME
campaign creation. **Meta Full and TikTok still require business verification**
— i.e. a registered legal entity. This is the same ~₦11,000 CAC Business Name
registration already priced for Torano's payment rail. **One registration
unlocks both.**

---

## 6. Tier 4 — free, NO API. Assisted posting, never automation

These are the platforms Playwright was proposed for. Instead, use **assisted
posting**: GrowthAds generates the creative and copy, then hands the user a
prefilled deep link or one-click copy and **the human presses publish**. Same
time saved for the SME, zero ToS exposure, no scapers to maintain.

| Channel | API | Notes |
|---|---|---|
| **Jiji** | ❌ none official | Nigeria's largest classifieds: **6.1M visits/month, 2.47M from Nigeria** (Semrush, Sep 2026). Every "Jiji API" on the market (Apify, Parse.bot) is a scraper. Terms 7.14 prohibit software interference. Free to post manually; Boost/Pro Sales are paid. |
| **Nairaland** | ❌ none | **5.57M visits/month, 2.65M from Nigeria** (Semrush, Sep 2026), 10m38s average session. No API, but there is a legitimate self-serve ad console: `/campaign`, 318×106 banner, ₦5,000 minimum credit, six advertiser slots per section. **Aggressive anti-spam bot bans users for posting ads.** Paid section banners are the route. |
| **OLX** | ⚠️ Partner API exists — **but not documented for Nigeria** | Official read+write Partner API (post/manage adverts) exists for Poland/Romania. No NG availability documented. |
| **VConnect** | ❌ | Business directory, form submission |
| **NigeriaGalleria** | ❌ | Directory |
| **BusinessList** | ❌ | Directory |
| **Finelib** | ❌ | Directory |
| **Adverts.ng** | ❌ | Classifieds |
| **Obszone** | ❌ | Classifieds |
| **MarketDayLive** | ❌ | Classifieds |
| **Jumia / Konga seller centres** | ❌ (seller portals) | Marketplace listings, not ad buying |

---

## 7. Tier 5 — Nigerian ad-tech (sales-led, no self-serve API)

Partnership conversations, not integrations. No documented self-serve APIs.

**Terragon** · **Sponge** · **GetSeen** (trygetseen.com advertises a
self-serve interface — worth investigating) · **Upspeedads** · **Cybertron Ads**

---

## 8. Ranking — build effort vs Nigerian reach

Prioritised build order. "Effort" is integration + gate, not marketing.

| # | Platform | Effort | NG reach | Why here |
|---|---|---|---|---|
| 1 | Google Business Profile | **Low** | High | Free, read/write, no business-entity gate, neglected by SMEs |
| 2 | Google Merchant Center | Med | Med–High | Free listings, no entity gate, one feed |
| 3 | Torano promoted listings | **Low** | Own users | Zero gate, zero dependency — the moat |
| 4 | WhatsApp Cloud | Med | **Highest** (96.5% of internet users) | Free API; 1,000 free service messages; ₦9 utility messages |
| 5 | Snapchat | **Low** | High (23.0M, young) | Open Marketing API; easiest major write integration |
| 6 | Meta | Med–High | **Very high** (38.0M) | Needs Business Verification for Full; Limited can still manage ads |
| 7 | Google Ads | Med | **Very high** | Explorer is auto-approved and enough for SME campaign creation |
| 8 | TikTok | Med–High | High (47.8M claimed) | Business verification + industry review |
| 9 | Nairaland | **Low** | 5.57M visits | Cheap fixed section banners; assisted only |
| 10 | Jiji | **Low** | 6.1M visits | Free listings + Boost; assisted only |
| 11 | Opera Ads (reporting) | Med | **Very high** (14.23% browser share) | Read-only API, console for writes |
| 12 | Adsterra | **Low** | Global | Real write API, open to all advertisers |
| 13 | PropellerAds | **Low** | Global | API open to all advertisers |
| 14 | Microsoft Advertising | Med | Med | Real API, weak competition in NG |
| 15 | MGID | Low–Med | Global | Documented add/modify API |

**Recommended first wave (free, no CAC):** Google Business Profile · Google
Merchant Center · Torano promoted listings · WhatsApp Cloud API · Jiji assisted ·
Nairaland assisted · Facebook Marketplace assisted.

**Second wave (one CAC registration unlocks the majors):** Meta · Google Ads ·
TikTok · Snapchat · Opera Ads (read) · Adsterra · PropellerAds · MGID.

Deferred: X (paid API), LinkedIn (partner-gated), Pinterest, Reddit, Amazon,
Apple Search Ads, Quora, Adform, Transsion, Terragon.

---

## 9. The white-label option — own the API instead of borrowing 15

If the goal is "15 channels with a read/write API", there is a cheaper path than
15 integrations: **become a channel.** Stand up your own self-serve ad network
and you own the read/write API outright.

| Vendor | Model | Cost |
|---|---|---|
| **AdButler** | Hosted, white-label self-serve advertiser portal with payments + reporting; full API | **from $179/month** |
| **Kevel** | Ad-serving **infrastructure APIs** — Management API creates advertisers, campaigns, ads. Build custom portals, sponsored listings, native ads | Enterprise quote |
| **DanAds** | Self-serve ad platform (partnered with Kevel); powers Opera Ad Manager | Enterprise quote |

This is also the natural home for **promoted listings inside Torano**, and for a
Nigerian SME ad exchange no global tool covers.

---

## 10. What this means for the product

- The **free tier** (Google Business Profile + Merchant Center + Torano) is
  shippable immediately with **no business registration and no reviews**.
- The **cheap tier** (Adsterra, PropellerAds, MGID) is shippable at low cost with
  just account signups.
- The **gated tier** (Meta Full, TikTok, Google Ads Basic) requires **one CAC
  registration** — the same one Torano's payment rail needs. That single
  registration is the highest-leverage task on the board. Google Ads Explorer
  and Snapchat do **not** wait for it.
- **No Playwright.** Assisted posting for Tier 4; a white-label engine if you
  want to own a channel.

---

## Sources

**Tier 1**
- Google Business Profile APIs — https://developers.google.com/my-business
- Create Posts (Updates/Offers/Events) — https://developers.google.com/my-business/content/posts-data
- Merchant API (Content API successor) — https://support.google.com/merchants/answer/16494522
- Content API for Shopping (deprecated) — https://developers.google.com/shopping-content/guides/quickstart

**Tier 2**
- Adsterra Ads API v3 — https://adsterra.com/blog/api-v3/
- PropellerAds API for all advertisers — https://propellerads.com/blog/adv-propellerads-opens-up-its-api-to-all-advertisers/
- MGID REST API for advertisers — https://help.mgid.com/api-advertisers
- Microsoft Advertising API evolution (SOAP deprecation) — https://about.ads.microsoft.com/en/blog/post/april-2026/evolving-the-microsoft-advertising-api-platform
- Microsoft Advertising API FAQ — https://learn.microsoft.com/en-us/advertising/guides/faq
- Opera Ads Report API — https://doc.adx.opera.com/advertiser/report-api
- Opera Ads Marketing API (events) — https://doc.adx.opera.com/advertiser/events-integration/server-to-server-marketing-api
- Outbrain Amplify API — https://www.outbrain.com/help/advertisers/amplify-api/
- Adform Campaigns Management API — https://www.adformhelp.com/hc/en-us/articles/37431221718417-Create-Campaigns-With-API

**Tier 3**
- Google Ads API access levels — https://developers.google.com/google-ads/api/docs/api-policy/access-levels
- Google Ads developer token sunset (2026-09-09) — https://developers.google.com/google-ads/api/docs/api-policy/developer-token
- Meta: Marketing API Access Tier rename + thresholds — https://developers.meta.com/blog/updates-to-ads-management-standard-access-feature/
- TikTok API for Business — https://business-api.tiktok.com/portal/docs
- TikTok business verification — https://ads.tiktok.com/resources/help/article/about-business-verification
- Snapchat Marketing API (open to all developers) — https://developers.snap.com/marketing-api/home
- X API pricing (pay-per-use) — https://docs.x.com/x-api/getting-started/pricing
- LinkedIn Marketing API — https://learn.microsoft.com/en-us/linkedin/marketing/

**Tier 4**
- Jiji Terms of Use, clause 7.14 — https://jiji.ng/rules.html
- Jiji selling FAQ (no developer API) — https://jiji.ng/faq/how-to-sell
- Nairaland ad rates (Sep 2026) — https://www.nairaland.com/adrates
- Nairaland how to place ads — https://www.nairaland.com/howtoplaceads
- Nairaland anti-bot bans on ad posting — https://www.nairaland.com/8477164/aggressive-bot-ban-when-upload
- OLX Developer Hub (Partner API) — https://developer.olxgroup.com/
- OLX Partner API 2.0 docs (RO) — https://developer.olx.ro/api/doc

**Traffic**
- Semrush Nigeria top sites, Sep 2026 — https://www.semrush.com/trending-websites/ng/all
- Semrush jiji.ng — https://www.semrush.com/website/jiji.ng/overview/
- Semrush nairaland.com — https://www.semrush.com/website/nairaland.com/overview/
- Statcounter Nigeria browser share, Sep 2026 — https://gs.statcounter.com/browser-market-share/all/nigeria
- DataReportal Digital 2026: Nigeria — https://datareportal.com/reports/digital-2026-nigeria

**White-label**
- AdButler self-serve portal — https://adbutler.com/self-serve-portal/
- AdButler vs Kevel (pricing from $179/mo) — https://adbutler.com/compare/kevel
- Kevel ad APIs — https://kevel.com/blog/what-are-ad-apis
- DanAds for developers — https://danads.com/for-developers/

**Legal**
- hiQ v. LinkedIn (White & Case) — https://www.whitecase.com/insight-our-thinking/web-scraping-website-terms-and-cfaa-hiqs-preliminary-injunction-affirmed-again
- EFF on automated access — https://www.eff.org/deeplinks/2018/04/scraping-just-automated-access-and-everyone-does-it
