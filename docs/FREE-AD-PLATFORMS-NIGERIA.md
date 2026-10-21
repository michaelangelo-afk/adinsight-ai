# Free and low-cost ad channels in Nigeria

**Status:** research note, 19 October 2026. Desk research plus live traffic data.
Companion to [`PLATFORMS.md`](./PLATFORMS.md), which covers the wider integration
matrix. The machine-readable version of this note is
[`lib/platforms/catalog.json`](../lib/platforms/catalog.json); the tables can be
regenerated with `node tools/platform_catalog_check.mjs --markdown`.

**The question:** where can a Nigerian SME get reach for free or near-free, what
traffic do those channels actually have, which ones expose a sanctioned API, and
can Playwright become our own posting API?

**The short answer**

1. **Free reach exists, but it is local and manual.** Google Business Profile,
   Merchant Center free listings, Facebook Marketplace/groups, Jiji free listings
   and WhatsApp status are the zero-naira stack. None of them is a scalable ad
   API.
2. **The cheapest measured paid reach is still Meta** at roughly **₦1,995 CPM /
   ₦160 CPC** in Nigeria. A cheap Nairaland section (Health, ₦9,927/mo) beats
   that above ~5,000 impressions a month; Business and Top Pages need far more.
   Jiji Boost is fixed-price; Opera's self-serve floor was **$100 (≈₦133,000)**
   at launch — confirm the current minimum.
3. **"Free API" means no API fee, not no ad spend.** The genuine free write APIs
   are Google Business Profile, Merchant Center, Google Ads (Explorer), Snapchat,
   WhatsApp Cloud (messages metered) and the ad-spend-only networks. Meta, TikTok,
   LinkedIn and X all gate writes behind verification, partnership or payment.
4. **Playwright cannot be the posting API.** **0 of 25 channels** permit
   automated browser posting. Every major platform has an official API or a ban;
   the Nigerian platforms without an API (Jiji, Nairaland, Marketplace) enforce
   that with account bans. Our own API should be an adapter layer over official
   APIs, with assisted publishing where no API exists.

---

## 1. The Nigerian audience, by channel

Two different numbers matter:

- **Ad reach** — who the platform says you can target. Useful for planning, but
  self-reported and not the same as monthly active users.
- **Site visits** — clickstream estimates for the web property. Useful for
  relative scale, but badly undercounts app-only behaviour (WhatsApp, TikTok,
  Instagram) and Nigerian mobile traffic.

| Channel | Nigerian signal | Sep 2026 visits | Date | Caveat |
|---|---:|---:|---|---|
| WhatsApp | **96.5%** of internet users 16+ | 16.69M (web) | 2025–26 | Survey-based; app usage is far larger than web visits |
| Facebook | **38.0M** ad reach | 31.24M | Oct 2025 / Sep 2026 | Most credible broad reach figure |
| YouTube | **30.5M** ad reach | 41.7M | Oct 2025 / Sep 2026 | Reach updated only every 3–6 months |
| TikTok | **47.8M** ad reach (18+) | 11.51M | Oct 2025 / Sep 2026 | Equals total NG social identities — treat as a ceiling, not a forecast |
| Instagram | **10.0M** ad reach | 12.82M | Oct 2025 / Sep 2026 | Overlaps Facebook heavily |
| Snapchat | **23.0M** ad reach | — | Oct 2025 | Young, camera-first; verify engagement before budgeting |
| X | **6.95M** ad reach | 15.96M | Oct 2025 / Sep 2026 | Male-skewed, Lagos/Abuja professional core |
| LinkedIn | **13.0M** members | — | Oct 2025 | Registered members, not monthly actives |
| Google Search | 322.91M google.com visits | 322.91M | Sep 2026 | Demand signal, not an ads audience |
| Jiji | 6.1M visits (2.47M from NG) | 6.1M | Sep 2026 | 9m29s average session; app traffic undercounted |
| Nairaland | 5.57M visits (2.65M from NG) | 5.57M | Sep 2026 | 10m38s session, 38.6% bounce |
| Jumia | 6.69M visits | 6.69M | Sep 2026 | Marketplace, not ad inventory |
| Konga | 3.13M visits | 3.13M | Sep 2026 | Marketplace, not ad inventory |
| Opera | **14.23%** browser share | — | Sep 2026 | #2 browser after Chrome (69.1%) |
| Facebook Marketplace | **835,000** new NG listings/month | — | Oct 2026 | Electronics alone >180,000/month |
| Reddit | 811k ad reach | — | Oct 2025 | Negligible Nigerian scale |

**Context:** 109M internet users, 47.8M social-media identities, 165M mobile
connections, median age 18.1 (DataReportal, Digital 2026 Nigeria, data from
October 2025). Nigeria is mobile-first: the top local sites run 86–99% mobile.

**Momentum, October 2024 → October 2025:** TikTok **+43.4%**, Snapchat **+30.2%**,
LinkedIn **+18.2%**, YouTube **+13.0%**, Facebook **+6.9%**, Instagram **−6.1%**,
X **−10.7%**, Reddit **+95.1%** from a tiny base. These are changes in *ad reach*
reported by the platforms, not audited MAU; Meta and TikTok both revise their
estimates, so direction is more reliable than the exact percentage.

**How to read the reach numbers.** TikTok's 47.8M is exactly the total social
identity figure, which is a methodology artefact rather than a coincidence.
Facebook's 38.0M is the most defensible broad number. Snapchat's 23.0M and
Instagram's 10.0M are ad-tool estimates, not audited users. Use these for
relative prioritisation; never put them in a forecast as if they were addressable
users.

---

## 2. The zero-naira stack

Ranked by return per hour of setup, not by reach.

| # | Channel | What is free | What it costs | Best for | Hard limit |
|---|---|---|---|---|---|
| 1 | **Google Business Profile** | Profile, hours, photos, Posts, Offers, review replies | Free | Local services, walk-in retail | API access needs approval; posts are not ads |
| 2 | **Google Merchant Center** | Product listings across Search, Maps, YouTube | Free listings | Physical products with a feed | Feed quality; confirm Nigerian eligibility |
| 3 | **Facebook Marketplace + buy/sell groups** | Listings and group posts | Free | Classifieds, electronics, furniture, cars | No listing API; group rules ban spam |
| 4 | **Jiji free listings** | Up to the category's free listing allowance | Free; Boost optional | Physical goods, services | No public API; Boost/Pro Sales are paid |
| 5 | **WhatsApp Business** | Status, catalogue, 1,000 service messages/number/month | Marketing template ≈ **₦69**; utility ≈ **₦9** | Reorders, COD confirmation, customer service | Not discovery; template approval |
| 6 | **Nairaland section banners** | — | From **₦3,219/mo** (Fashion) to **₦878,687/mo** (Top Pages) | Local services, B2B, health, education | Fixed slots (6 per section); no API |
| 7 | **Directories** | Bing Places, Apple Business Connect, VConnect, BusinessList, NigeriaGalleria, Finelib | Free | NAP consistency and long-tail search | Low traffic; duplicate listings hurt |
| 8 | **Opera Ad Manager** | — | **$100 ≈ ₦133,000** self-serve floor | Broad mobile reach | Not free; console-only writes |

### The Nairaland maths

Nairaland sells banners by section, with six advertiser slots per section. Rates
move with demand. September 2026 examples:

| Section | Monthly | Break-even vs Meta CPM |
|---|---:|---:|
| Fashion | ₦3,219 | ~1,614 impressions |
| Health | ₦9,927 | ~4,977 impressions |
| Adverts | ₦34,662 | ~17,374 impressions |
| Business | ₦333,908 | ~167,372 impressions |
| Top Pages | ₦878,687 | ~440,445 impressions |

Break-even = monthly rate ÷ Meta's ≈₦1,995 CPM × 1,000. Above the break-even
impression count, the fixed placement is cheaper per impression than Meta; below
it, Meta wins. Ask Nairaland for section impressions before renewing — the rate
card does not publish them.

**Do not** try to post ads in Nairaland forum boards. The site runs an
anti-spam bot that bans accounts, and the legitimate route is `/campaign` with
prepaid credit (₦5,000 minimum) and an approved 318×106 banner.

### The WhatsApp maths

Meta's 1 October 2026 rate card for Nigerian recipients:

- Marketing template: **$0.0516** ≈ **₦69** per delivered message.
- Utility, authentication and service: **$0.0067** ≈ **₦9** per delivered message.
- 1,000 free service messages per business number per month.
- Messages in the 72 hours after a customer arrives from a Click-to-WhatsApp ad
  are free (except Meta Business Agent tokens).

That makes WhatsApp the best reorder and COD-confirmation channel in the country
and a poor cold-acquisition channel. Keep marketing templates for real offers;
put order updates on utility templates.

---

## 3. Paid reach: what a naira buys

| Channel | Entry | 2026 Nigerian benchmark | Notes |
|---|---|---|---|
| Meta (FB/IG) | No minimum | **CPM ≈ $1.50 (₦1,995); CPC ≈ $0.12 (₦160)** | Third-party benchmark, not Meta-reported; creative quality moves it 2–3× |
| TikTok | No minimum | Usually below Meta CPM | Creative production is the real cost |
| Google Search | No minimum | Auction; CPC usually above ₦160 | Exact-match local intent converts best |
| YouTube | No minimum | Auction, view-based | 6s bumpers cheapest for reach |
| Snapchat | No minimum documented | Cheap reach, weak lower-funnel intent | Test with one creative set |
| X | Ads account; X API paid | High CPC relative to reach | Organic + deep link first |
| LinkedIn | No minimum documented | Highest CPC of the majors | B2B lead gen only |
| Jiji | Free listings; Boost; Pro Sales ₦2,500 balance | Fixed package | Cheapest paid visibility for goods |
| Nairaland | ₦5,000 credit | Fixed section rate | See break-even table above |
| Opera | $100 ≈ ₦133,000 | CPC or CPM | Broad mobile, weaker targeting |
| Adsterra / PropellerAds / MGID | Deposit varies | Cheap CPM, low intent | App-install and sweepstake offers only |

**Budget ladder for an SME**

| Budget | Stack | Expected job |
|---|---|---|
| **₦0** | GBP + Merchant Center + Marketplace + Jiji free + WhatsApp status + directories | Get found, prove the offer, collect first 20 customers |
| **₦10,000/mo** | Nairaland Health/Family/Fashion placement + Jiji Pro Sales ₦2,500 + boosted posts | Local density in one category |
| **₦50,000/mo** | Meta ads (₦30k) + Nairaland (₦10k) + Jiji Boost (₦10k) | Repeatable lead flow; measure CPC by creative |
| **₦150,000/mo** | Add Google Search (₦50k) + TikTok (₦30k) | Capture demand and test short-form |
| **₦500,000/mo+** | Add Opera (₦133k floor) + YouTube + retargeting | Broad reach and brand; only with creative production |

Do not treat the benchmark CPM as a promise. Nigerian auction prices move with
seasonality (Detty December, back-to-school), election cycles and the naira.

---

## 4. Official APIs: what is actually free

"Free API" in this market usually means **no per-call fee**, with the real cost
sitting in ad spend or verification. The genuine free read/write surfaces:

| Channel | Read | Write | Gate | API cost | Quota | Effort |
|---|---|---|---|---|---|---|
| **Google Business Profile** | ✅ | ✅ posts, offers, hours, photos, review replies | Access request | Free | Project quota after approval | S |
| **Google Merchant Center** | ✅ | ✅ product feed | Account approval | Free | Merchant API quotas | M |
| **Google Ads** | ✅ | ✅ campaigns, ads, keywords | Cloud project access level | Free | Explorer 2,880 ops/day; Basic 15,000; Standard unlimited | M |
| **Meta** | ✅ | ✅ campaigns, ads, insights | App review + business verification for Full | Free | Limited 60 pts/300s; Full 9,000 | M |
| **TikTok** | ✅ | ✅ campaigns, creatives, reporting | Business verification + industry review | Free | Per-app | M |
| **Snapchat** | ✅ | ✅ campaigns, creatives, audiences | Business account + OAuth app | Free | Per-app | S |
| **WhatsApp Cloud** | ✅ | ✅ templates, messages | Business verification | Free API; messages metered | Per-number limits | M |
| **Microsoft Advertising** | ✅ | ✅ | Developer token; up to 5-day third-party approval | Free | Standard | M |
| **Pinterest** | ✅ | ✅ | Developer app review | Free | v5 quotas | M |
| **Reddit** | ✅ | ✅ | Ads API access request | Free | Standard | M |
| **X** | ✅ | ✅ | App review | **Paid** pay-per-use | $0.015/post writes | M |
| **LinkedIn** | ✅ | ✅ | **Partner program** | Included with ads account | Partner agreement | L |
| **Opera Ads** | ✅ | ⚠️ read-only | Token from Opera | Free | Report API | M |
| **Adsterra / PropellerAds / MGID** | ✅ | ✅ | Account | Ad spend only | Account tier | S–M |
| **Jiji** | ❌ | ❌ assisted | Account | Free | No API | S |
| **Nairaland** | ❌ | ❌ assisted | Account + prepaid | ₦5,000 credit | No API | S |
| **Facebook Marketplace** | ❌ | ❌ assisted | Account | Free | No API | S |

### The three changes that matter in 2026

1. **Google Ads developer tokens were sunset on 9 September 2026.** Access is now
   tied to the Google Cloud project. Enabling the API grants **Test** (15,000
   ops/day, test accounts only); **Explorer** is auto-approved in most cases and
   gives **2,880 production ops/day** — enough for SME campaign creation.
   Explorer blocks account creation, user management, keyword planning and
   billing, but not ad creation or management. **Basic** needs brand
   verification; **Standard** needs a manual audit.
2. **Meta renamed its tiers.** Ads Management Standard Access is now the
   **Marketing API Access Tier**: **Limited** (default, 60 points/300s) and
   **Full** (9,000 points). Full needs 500+ Marketing API calls in 15 days,
   error rate under 15%, app review and **business verification**.
3. **The X API has no free tier.** Pay-per-use replaced subscriptions; organic
   writes are **$0.015/post** from 20 April 2026. The old $200 Basic plan is only
   for existing subscribers. The Ads API is a separate, restricted surface. Do
   not plan a free X integration.

**Snapchat is the surprise.** Snap's docs describe the Marketing API as open to
all developers, with campaign creation, creatives, audiences and reporting. In
practice you need a Snap business account and an OAuth app, but no general
app-review queue is documented (as of October 2026). It is the easiest major
write integration after Google Business Profile.

---

## 5. Automation: the honest answer

### 5.1 Official API does not mean "anything goes"

Every platform draws the same line: **programmatic access is allowed through the
API, on the API's terms.** Reads and writes through OAuth are sanctioned.
Driving the web UI with a headless browser is not.

| Channel | Official API | Browser automation | What enforcement looks like |
|---|---|---|---|
| Meta | ✅ | **Prohibited** | App/account restriction, ad account shutdown |
| Google Ads / YouTube | ✅ | **Prohibited** | Account suspension, API project ban |
| TikTok | ✅ | **Prohibited** | Account and developer-app termination |
| Snapchat | ✅ | **Not sanctioned** | App and ad-account review |
| X | ✅ paid | **Prohibited** | Developer-app suspension, account lock |
| LinkedIn | ✅ partner-only | **Prohibited** | Account restriction |
| Pinterest / Reddit | ✅ | **Prohibited** | App and account suspension |
| WhatsApp | ✅ Cloud API | **Prohibited** | Number ban; unofficial clients are explicitly unsupported |
| Opera Ads | ⚠️ read-only | **Not sanctioned** | Console-only writes |
| Jiji | ❌ | **Prohibited** (Terms 7.14) | Listing removal, account block |
| Nairaland | ❌ | **Prohibited in practice** | Anti-spam bot bans ad posters |
| Facebook Marketplace | ❌ | **Prohibited** | Listing removal, account restriction |
| Jumia / Konga | ❌ | **Not sanctioned** | Seller account review |
| Transsion / Terragon | ❌ | **No self-serve surface** | Sales-led |

**Result: 0 of 25 channels permit Playwright posting.**
`tools/platform_catalog_check.mjs` fails if anyone marks a channel
`assisted-only` on the Playwright verdict; `catalogStats()` reports the count as
zero.

### 5.2 Why the answer is not "just be careful"

Four independent reasons, any one of which is enough:

1. **Contract.** Automated access is banned by the terms of every major platform.
   A breach is a contract matter, not automatically a crime — but the remedy is
   immediate: the customer's ad account is terminated.
2. **Law.** Nigeria's Cybercrimes Act 2015 (as amended 2024) and the NDPA 2023
   apply if credentials or personal data move through the automation. The US
   scraping cases (*hiQ v. LinkedIn*, *Meta v. Bright Data*) concern **public,
   unauthenticated reads**; they do not authorise writing into a password-
   protected ad account.
3. **Technics.** CAPTCHA, 2FA, device fingerprinting, IP reputation and silent
   layout changes. You would own 25 brittle scrapers forever.
4. **Commerce.** GrowthAds charges an SME ~₦25,000/month. If the bot gets their
   Facebook or Jiji account banned, that is a refund, a reputation fire and an
   unwinnable support conversation. The customer pays for the damage.

### 5.3 Where Playwright is legitimate

- **QA and screenshots of our own surfaces** — the existing `tools/design_probe.mjs`
  and `tools/contrast_check.mjs` pattern.
- **Public-page monitoring** that respects `robots.txt`, with no login and no
  bypass of CAPTCHA, 2FA or device checks.
- **Regression tests** in CI.

Not posting. Not scraping logged-in dashboards. Not "reading the client's Ads
Manager for them" — that is what OAuth is for.

---

## 6. What "our own API" should be instead

The product should expose **one GrowthAds API** over four transports:

1. **Official read** — nightly insights pull (Meta, Google, TikTok, Snap).
2. **Official write** — campaign creation where the platform allows it.
3. **Assisted launch** — prefill the creative and copy, open the platform's own
   composer with a deep link, the human presses publish, we track the result with
   a UTM or a unique phone number.
4. **Owned inventory** — Torano promoted listings and any future white-label
   network, where we own the read/write API outright.

The contract is already in [`lib/platforms/catalog.ts`](../lib/platforms/catalog.ts):

```ts
interface ChannelAdapter {
  connect(...): Promise<ConnectionRef>;
  pull(connection, range): Promise<MetricRow[]>;
  push(connection | null, draft): Promise<PublishResult>;
  assistedLaunch(draft): PublishResult; // returns needs-human + deep link
}
```

Non-negotiables for the runtime:

- **Token vault.** Store refresh tokens encrypted, never in the browser. One
  connection per organisation per channel.
- **Rate-limit governor.** Meta's points, Google's operations and TikTok's
  per-app quotas are different units. The adapter owns the budget, not the UI.
- **Idempotency keys.** A retried `push` must not create two campaigns.
- **Audit log.** Who changed budget, when, on which channel, from which IP.
- **Capability registry.** The UI reads `CHANNELS`; it never hardcodes "Meta,
  Google, TikTok". A channel is shown as connectable only if `api.write === "full"`;
  otherwise it shows "Assisted publish".
- **No credential sharing.** The SME authorises through OAuth. We never ask for
  a username and password, and we never store one.

### Build order

| Wave | Channels | Gate | Why now |
|---|---|---|---|
| **1** | Google Business Profile, Merchant Center, WhatsApp, Jiji, Nairaland, Marketplace | Account / access request | No CAC, no app review; immediate SME value |
| **2** | Meta, Google Ads, TikTok, Snapchat, Opera (read), Adsterra, PropellerAds | Verification / app review | The reach and the write APIs that matter |
| **3** | YouTube, Microsoft, X, LinkedIn, Pinterest, MGID, Jumia | Partner / payment | Add when a client segment demands it |
| **4** | Reddit, Konga, Transsion, Terragon | Sales-led | Partnerships, not code |

**One CAC Business Name registration (~₦11,000)** unlocks Meta Full, TikTok
business verification and Google Ads Basic. It is still the highest-leverage
task on the board.

---

## 7. Playbooks by business type

| Business | ₦0 stack | First ₦50k | What to measure |
|---|---|---|---|
| **Local service** (plumber, salon, laundry, mechanic) | GBP with photos and hours, Marketplace/groups, Jiji free, WhatsApp status | Meta reach in a 5km radius + Nairaland Health/Family banner | Calls, WhatsApp opens, GBP direction requests |
| **Retail / physical goods** | Merchant Center feed, Marketplace, Jiji free, WhatsApp catalogue | Meta catalogue ads + Jiji Boost | Cost per add-to-cart, Jiji views→chats |
| **Food / events** | Instagram + TikTok organic, WhatsApp status, Marketplace | Meta Reels + Nairaland Events (₦1,197/mo) | Saves/shares, WhatsApp orders, code redemptions |
| **B2B / professional** | LinkedIn organic, GBP, directories, Nairaland Business/Investment | Google Search exact-match + LinkedIn retargeting | Qualified calls, proposal requests |
| **App / digital product** | TikTok/Reels organic, Reddit niche, Product Hunt | Meta app-install + Adsterra/Propeller | CPI, D1 retention, not installs alone |

**Assisted publishing is the product, not a compromise.** The SME does not want
another dashboard; they want the listing written, the banner sized, the caption
proofread and the deep link opened. A human pressing "publish" is a feature:
it keeps the account safe and keeps the platform's terms intact.

---

## 8. Measurement without platform APIs

Jiji and Nairaland give views and clicks but no conversion API. Use:

- **Unique landing URLs** per channel (`?utm_source=nairaland&utm_campaign=health_oct`).
- **Unique phone numbers** per channel (a cheap second SIM or a virtual number).
- **WhatsApp deep links** with a prefilled message that names the channel.
- **Redemption codes** for offline offers.

For Meta and Google, pull insights nightly and store them; do not rely on the
platform UI for month-over-month comparisons after an account change.

---

## 9. Open questions for the next pass

1. **Opera's current minimum** — $100 was the 2021 launch figure; confirm with
   Opera before publishing it as a product constraint.
2. **Snapchat review gate** — the docs say open to all developers, but the
   business help page requires activation. Confirm with a live app submission.
3. **Jiji Boost pricing** — package prices are shown in-app, not on the public
   site. Capture the current tiers for each category.
4. **TikTok Nigerian CPM** — no credible public benchmark; pull it from a live
   account before using it in forecasting.
5. **Google Merchant Center Nigeria** — Nigeria appears on third-party supported-
   country lists; confirm in a live Merchant Center account before promising it.

---

## Sources

**Audience and traffic**

- DataReportal, *Digital 2026: Nigeria* (published 8 Nov 2025; data October 2025)
  — https://datareportal.com/reports/digital-2026-nigeria
- Semrush, *Most Visited Websites in Nigeria, September 2026*
  — https://www.semrush.com/trending-websites/ng/all
- Semrush, `jiji.ng` traffic, September 2026
  — https://www.semrush.com/website/jiji.ng/overview/
- Semrush, `nairaland.com` traffic, September 2026
  — https://www.semrush.com/website/nairaland.com/overview/
- Statcounter, *Browser Market Share Nigeria, September 2026*
  — https://gs.statcounter.com/browser-market-share/all/nigeria
- Nigeria Communications Week, *Facebook Marketplace marks 10 years* (Oct 2026)
  — https://nigeriacommunicationsweek.com.ng/2026/10/12/facebook-marketplace-marks-10-years-reveals-nigerians-top-selling-categories
- Statista / Krestel Digital, *Social Media Statistics in Nigeria 2026*
  — https://kresteldigital.com/resources/social-media-statistics-in-nigeria-2026-data-report/

**Costs and rates**

- Adamigo, *Meta Ads CPM & CPC benchmarks by country 2026* (Nigeria $1.50 CPM,
  $0.12 CPC) — https://www.adamigo.ai/blog/meta-ads-cpm-cpc-benchmarks-by-country-2026
- Nairaland ad rates, September 2026 — https://www.nairaland.com/adrates
- Nairaland, *How to place targeted ads* — https://www.nairaland.com/howtoplaceads
- Jiji, *Pro Sales setup* (₦2,500 minimum balance)
  — https://jiji.ng/faq/pro-sales-setup
- Jiji, *Premium services* — https://jiji.ng/faq/premium-services-types
- Meta, *WhatsApp Business Platform pricing* (1 Oct 2026 rate card; Nigeria
  marketing $0.0516, utility/service $0.0067)
  — https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- Flowcall, *WhatsApp Business API pricing, October 2026* (rate-card summary)
  — https://www.flowcall.co/blog/whatsapp-business-api-pricing
- Opera Ad Manager — https://admanager.opera.com/
- Opera Ad Manager launch, $100 minimum (2021)
  — https://blogs.opera.com/news/2021/09/opera-ad-manager/

**API access**

- Google Ads API access levels (Test / Explorer / Basic / Standard)
  — https://developers.google.com/google-ads/api/docs/api-policy/access-levels
- Google Ads developer token sunset, 9 September 2026
  — https://developers.google.com/google-ads/api/docs/api-policy/developer-token
- Meta Marketing API Access Tier rename and thresholds (4 May 2026)
  — https://developers.meta.com/blog/updates-to-ads-management-standard-access-feature/
- Meta Marketing API rate limits (Limited 60 points / Full 9,000)
  — https://developers.facebook.com/docs/marketing-api/overview/rate-limiting
- TikTok API for Business — https://business-api.tiktok.com/portal/docs
- TikTok business verification
  — https://ads.tiktok.com/resources/help/article/about-business-verification
- Snapchat Marketing API — https://developers.snap.com/marketing-api/home
- Google Business Profile APIs — https://developers.google.com/my-business
- Merchant API — https://developers.google.com/merchant/api
- WhatsApp Cloud API — https://developers.facebook.com/docs/whatsapp/cloud-api
- X API pricing (pay-per-use; writes $0.015/post)
  — https://docs.x.com/x-api/getting-started/pricing
- LinkedIn Marketing API — https://learn.microsoft.com/en-us/linkedin/marketing/
- Microsoft Advertising API — https://learn.microsoft.com/en-us/advertising/guides/
- Pinterest API — https://developers.pinterest.com/docs/api/v5/
- Reddit Ads API — https://ads-api.reddit.com/docs/
- Adsterra Ads API v3 — https://adsterra.com/blog/api-v3/
- PropellerAds API — https://propellerads.com/blog/adv-propellerads-opens-up-its-api-to-all-advertisers/
- MGID advertiser API — https://help.mgid.com/api-advertisers

**Terms and enforcement**

- Jiji Terms of Use, clause 7.14 (no software interference)
  — https://jiji.ng/rules.html
- TikTok Terms of Service (automated systems, scraping)
  — https://www.tiktok.com/legal/page/us/terms-of-service/en
- TikTok, *How we combat unauthorized data scraping*
  — https://www.tiktok.com/privacy/blog/how-we-combat-scraping/en
- Meta Platform Terms — https://developers.facebook.com/terms/
- LinkedIn User Agreement — https://www.linkedin.com/legal/user-agreement
- Nairaland anti-spam ban thread
  — https://www.nairaland.com/8477164/aggressive-bot-ban-when-upload
- Nigeria Cybercrimes Act 2015 (as amended 2024); Nigeria Data Protection Act 2023
  — https://www.cbn.gov.ng/ (regulatory copies) and https://ndpc.gov.ng/

*Not legal advice. Get Nigerian counsel before shipping any automation that
touches a third-party account.*
