import type {
  AdAccount,
  Campaign,
  CampaignMetric,
  CampaignSummary,
  DashboardSummary,
  Influencer,
  Profile,
  Recommendation,
  Report
} from "./types";

// ============================================================================
// Mock profile (the "logged-in user")
// ============================================================================
export const currentProfile: Profile = {
  id: "u_001",
  fullName: "Adaeze Okafor",
  businessName: "Lagos Bites",
  businessType: "Restaurant / Hospitality",
  phone: "+234 803 555 0123",
  monthlyAdBudget: 350_000,
  userType: "advertiser",
  avatar: "AO"
};

// ============================================================================
// Connected ad accounts
// ============================================================================
export const connectedAccounts: AdAccount[] = [
  {
    id: "acc_meta",
    profileId: "u_001",
    platform: "meta",
    platformAccountId: "act_8472901234",
    isActive: true,
    connectedAt: "2026-05-12T09:14:21Z"
  },
  {
    id: "acc_google",
    profileId: "u_001",
    platform: "google",
    platformAccountId: "ga_47281",
    isActive: true,
    connectedAt: "2026-06-04T16:22:08Z"
  },
  {
    id: "acc_tiktok",
    profileId: "u_001",
    platform: "tiktok",
    platformAccountId: "tt_99123",
    isActive: true,
    connectedAt: "2026-07-01T11:08:00Z"
  }
];

// ============================================================================
// Campaigns (aggregated view for the campaigns table)
// ============================================================================
export const campaigns: CampaignSummary[] = [
  {
    id: "c_lagos_launch",
    adAccountId: "acc_meta",
    objective: "conversions",
    createdAt: "2026-06-12T09:14:00Z",
    name: "Lagos Summer Launch",
    platform: "meta",
    status: "active",
    spend: 142_600,
    budget: 200_000,
    impressions: 312_704,
    clicks: 9_842,
    conversions: 312,
    cpc: 14.49,
    ctr: 0.0315,
    trend: [3, 7, 5, 8, 12, 9, 11]
  },
  {
    id: "c_abuja_b2b",
    adAccountId: "acc_meta",
    objective: "leads",
    createdAt: "2026-06-22T10:00:00Z",
    name: "Abuja B2B Outreach",
    platform: "meta",
    status: "active",
    spend: 71_840,
    budget: 100_000,
    impressions: 158_330,
    clicks: 3_402,
    conversions: 48,
    cpc: 21.12,
    ctr: 0.0215,
    trend: [4, 4, 5, 6, 5, 4, 5]
  },
  {
    id: "c_search_leadgen",
    adAccountId: "acc_google",
    objective: "leads",
    createdAt: "2026-06-04T16:22:08Z",
    name: "Search — Lead Gen",
    platform: "google",
    status: "active",
    spend: 95_240,
    budget: 120_000,
    impressions: 89_204,
    clicks: 4_201,
    conversions: 92,
    cpc: 22.67,
    ctr: 0.0471,
    trend: [6, 7, 6, 8, 10, 9, 8]
  },
  {
    id: "c_video_awareness",
    adAccountId: "acc_tiktok",
    objective: "awareness",
    createdAt: "2026-05-30T12:00:00Z",
    name: "TikTok — Awareness",
    platform: "tiktok",
    status: "paused",
    spend: 38_900,
    budget: 80_000,
    impressions: 514_220,
    clicks: 7_104,
    conversions: 22,
    cpc: 5.48,
    ctr: 0.0138,
    trend: [9, 8, 6, 4, 3, 2, 1]
  },
  {
    id: "c_retargeting",
    adAccountId: "acc_meta",
    objective: "conversions",
    createdAt: "2026-06-08T08:30:00Z",
    name: "Meta Retargeting",
    platform: "meta",
    status: "active",
    spend: 52_180,
    budget: 70_000,
    impressions: 41_832,
    clicks: 2_188,
    conversions: 144,
    cpc: 23.85,
    ctr: 0.0523,
    trend: [8, 9, 10, 11, 12, 13, 14]
  },
  {
    id: "c_jollof_launch",
    adAccountId: "acc_meta",
    objective: "engagement",
    createdAt: "2026-05-02T10:00:00Z",
    name: "Jollof Tuesdays",
    platform: "meta",
    status: "completed",
    spend: 88_000,
    budget: 88_000,
    impressions: 220_113,
    clicks: 6_842,
    conversions: 248,
    cpc: 12.86,
    ctr: 0.031,
    trend: [10, 12, 11, 9, 8, 6, 3]
  }
];

// ============================================================================
// 30-day trend for the hero chart
// ============================================================================
function generateTrend() {
  // Deterministic pseudo-random for SSR consistency
  const today = new Date("2026-07-04");
  const series: DashboardSummary["trend"] = [];
  let spend = 12_000;
  let conv = 18;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Pseudo seed
    const seed = Math.sin(i * 1.3 + 7) * 0.5 + 0.5;
    const seed2 = Math.cos(i * 0.9 + 2) * 0.5 + 0.5;
    spend = Math.max(6_500, spend * (0.95 + seed * 0.15));
    conv = Math.max(6, Math.round(conv * (0.92 + seed2 * 0.2)));
    series.push({
      date: d.toISOString().slice(0, 10),
      spend: Math.round(spend),
      conversions: conv + 6
    });
  }
  return series;
}

export const dashboardSummary: DashboardSummary = {
  totalSpend: 488_760,
  spendDelta: -12.4,
  totalConversions: 866,
  conversionsDelta: 18.2,
  averageCpc: 16.42,
  cpcDelta: -8.7,
  roi: 3.62,
  roiDelta: 22.4,
  trend: generateTrend(),
  platformBreakdown: [
    { platform: "meta", spend: 274_620, conversions: 504 },
    { platform: "google", spend: 95_240, conversions: 92 },
    { platform: "tiktok", spend: 38_900, conversions: 22 }
  ]
};

// ============================================================================
// AI recommendations
// ============================================================================
export const recommendations: Recommendation[] = [
  {
    id: "r_001",
    campaignId: "c_lagos_launch",
    title: "Reallocate ₦50,000 from Abuja to Lagos",
    body:
      "Your Lagos campaign has a 40% lower CPC than Abuja. Shifting budget should net an additional ~28 conversions at the same spend.",
    impact: "high",
    estimatedSavings: 78_000,
    status: "pending",
    createdAt: "2026-07-04T07:14:00Z"
  },
  {
    id: "r_002",
    campaignId: "c_video_awareness",
    title: "Pause TikTok Awareness — performance has collapsed 71% in 14 days",
    body:
      "Cost-per-conversion has risen from ₦1,200 to ₦4,300 with no offsetting improvement. We recommend pausing and reallocating the ₦41k remainder to Meta Retargeting.",
    impact: "high",
    estimatedSavings: 41_000,
    status: "pending",
    createdAt: "2026-07-04T07:14:00Z"
  },
  {
    id: "r_003",
    campaignId: "c_retargeting",
    title: "Your testimonial creative drives 45% more engagement",
    body:
      "UGC testimonials outperform product shots across all placements. We've queued 4 new testimonial variants into your retargeting ad set.",
    impact: "medium",
    estimatedSavings: 28_500,
    status: "pending",
    createdAt: "2026-07-03T07:14:00Z"
  },
  {
    id: "r_004",
    campaignId: "c_search_leadgen",
    title: "Cost-per-conversion 45% above category average",
    body:
      "Try these 3 targeting tweaks: narrow to 25–44 age band in Lagos + Abuja, exclude Gmail/Hotmail users, and bid up on 'restaurant near me' variants.",
    impact: "medium",
    estimatedSavings: 32_000,
    status: "applied",
    createdAt: "2026-07-01T07:14:00Z"
  },
  {
    id: "r_005",
    campaignId: "c_lagos_launch",
    title: "Instagram Stories placement is delivering zero conversions",
    body:
      "₦20,000 spent → 0 conversions in 14 days. Pause this placement and reallocate to Feed.",
    impact: "low",
    status: "dismissed",
    createdAt: "2026-06-28T07:14:00Z"
  }
];

// ============================================================================
// Reports history
// ============================================================================
export const reports: Report[] = [
  {
    id: "rep_2026_07_01",
    profileId: "u_001",
    pdfUrl: "#",
    dateRangeStart: "2026-06-25",
    dateRangeEnd: "2026-07-01",
    title: "Weekly Performance · Week 26",
    size: "1.2 MB"
  },
  {
    id: "rep_2026_06_24",
    profileId: "u_001",
    pdfUrl: "#",
    dateRangeStart: "2026-06-18",
    dateRangeEnd: "2026-06-24",
    title: "Weekly Performance · Week 25",
    size: "1.1 MB"
  },
  {
    id: "rep_2026_06_17",
    profileId: "u_001",
    pdfUrl: "#",
    dateRangeStart: "2026-06-11",
    dateRangeEnd: "2026-06-17",
    title: "Weekly Performance · Week 24",
    size: "1.4 MB"
  }
];

// ============================================================================
// Influencer marketplace
// ============================================================================
export const influencers: Influencer[] = [
  {
    id: "inf_1",
    fullName: "Tomi Ogunleye",
    handle: "@tomi.eats",
    niche: ["Food", "Lifestyle"],
    city: "Lagos",
    followerCount: 38_400,
    engagementRate: 0.062,
    basePrice: 145_000,
    platforms: ["instagram", "tiktok"],
    isVerified: true,
    rating: 4.9,
    avatar: "TO",
    recentDelta: 0.18
  },
  {
    id: "inf_2",
    fullName: "Ifeanyi Iroegbu",
    handle: "@ifeanyi.tech",
    niche: ["Tech", "B2B"],
    city: "Lagos",
    followerCount: 12_800,
    engagementRate: 0.087,
    basePrice: 95_000,
    platforms: ["twitter", "instagram"],
    isVerified: true,
    rating: 4.8,
    avatar: "II",
    recentDelta: 0.24
  },
  {
    id: "inf_3",
    fullName: "Bisi Adeyemi",
    handle: "@bisi.speaks",
    niche: ["Education", "Career"],
    city: "Abuja",
    followerCount: 22_600,
    engagementRate: 0.054,
    basePrice: 78_000,
    platforms: ["instagram", "youtube"],
    isVerified: true,
    rating: 4.7,
    avatar: "BA",
    recentDelta: 0.09
  },
  {
    id: "inf_4",
    fullName: "Chidinma Nwosu",
    handle: "@chidi.beauty",
    niche: ["Beauty", "Fashion"],
    city: "Lagos",
    followerCount: 47_900,
    engagementRate: 0.045,
    basePrice: 165_000,
    platforms: ["instagram", "tiktok"],
    isVerified: true,
    rating: 4.6,
    avatar: "CN",
    recentDelta: 0.06
  },
  {
    id: "inf_5",
    fullName: "Olalekan Bello",
    handle: "@ola.fits",
    niche: ["Fitness", "Wellness"],
    city: "Ibadan",
    followerCount: 8_400,
    engagementRate: 0.094,
    basePrice: 60_000,
    platforms: ["instagram", "twitter"],
    isVerified: false,
    rating: 4.5,
    avatar: "OB",
    recentDelta: 0.31
  },
  {
    id: "inf_6",
    fullName: "Aisha Mohammed",
    handle: "@aisha.travels",
    niche: ["Travel", "Lifestyle"],
    city: "Abuja",
    followerCount: 19_200,
    engagementRate: 0.071,
    basePrice: 110_000,
    platforms: ["instagram", "youtube", "tiktok"],
    isVerified: true,
    rating: 4.9,
    avatar: "AM",
    recentDelta: 0.14
  }
];

// Re-export the Campaign type summary used by table view
export type { CampaignSummary };
