/**
 * Domain types for GrowthAds.
 *
 * Mirrors the Postgres schema in sections 4.2 of the product spec.
 * The current prototype uses mock data; in production these map 1:1
 * to tables queried via Supabase / Edge Functions.
 */

export type Platform = "meta" | "google" | "tiktok";

export interface Profile {
  id: string;
  fullName: string;
  businessName: string;
  businessType: string;
  phone: string;
  monthlyAdBudget: number;
  userType: "advertiser" | "influencer";
  avatar?: string;
}

export interface AdAccount {
  id: string;
  profileId: string;
  platform: Platform;
  platformAccountId: string;
  isActive: boolean;
  connectedAt: string;
}

export type CampaignStatus = "active" | "paused" | "completed";
export type CampaignObjective =
  | "awareness"
  | "traffic"
  | "leads"
  | "conversions"
  | "engagement";

export interface Campaign {
  id: string;
  adAccountId: string;
  name: string;
  platform: Platform;
  budget: number;
  status: CampaignStatus;
  objective: CampaignObjective;
  createdAt: string;
}

export interface CampaignMetric {
  id: string;
  campaignId: string;
  date: string; // ISO date
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface CampaignSummary extends Campaign {
  spend: number; // aggregated spend across the active budget window
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  ctr: number;
  trend: number[]; // last 7-day ctr/spend trend (mock sparkline data)
}

export type RecommendationStatus = "pending" | "applied" | "dismissed";
export type ImpactLevel = "high" | "medium" | "low";

export interface Recommendation {
  id: string;
  campaignId?: string;
  title: string;
  body: string;
  impact: ImpactLevel;
  estimatedSavings?: number;
  status: RecommendationStatus;
  createdAt: string;
}

export interface Report {
  id: string;
  profileId: string;
  pdfUrl?: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  title: string;
  size: string;
}

export interface Influencer {
  id: string;
  fullName: string;
  handle: string;
  niche: string[];
  city: string;
  followerCount: number;
  engagementRate: number;
  basePrice: number;
  platforms: ("instagram" | "tiktok" | "youtube" | "twitter")[];
  isVerified: boolean;
  rating: number;
  avatar: string;
  recentDelta: number; // % growth in engagement last 30d
}

export interface DashboardSummary {
  totalSpend: number;
  spendDelta: number;
  totalConversions: number;
  conversionsDelta: number;
  averageCpc: number;
  cpcDelta: number;
  roi: number;
  roiDelta: number;
  trend: { date: string; spend: number; conversions: number }[];
  platformBreakdown: { platform: Platform; spend: number; conversions: number }[];
}
