"use server";

import { createClient } from "@/lib/supabase/server";
import type { AdAccount, DashboardSummary, CampaignSummary, Recommendation } from "@/lib/types";
import {
  dashboardSummary as mockSummary,
  campaigns as mockCampaigns,
  recommendations as mockRecommendations,
  connectedAccounts as mockAccounts
} from "@/lib/mock-data";

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

/**
 * Fetches the dashboard summary from Supabase or falls back to mock data.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  if (USE_MOCK) return mockSummary;

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get organization_id
  const { data: userRecord } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  const orgId = userRecord?.organization_id;
  if (!orgId) throw new Error("No organization found");

  // Aggregate campaign metrics for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: metrics, error } = await supabase
    .from("campaign_metrics")
    .select("spend, conversions, date, campaigns!inner(platform)")
    .gte("date", thirtyDaysAgo.toISOString().slice(0, 10))
    .eq("campaigns.organization_id", orgId);

  if (error) throw new Error(`Failed to fetch metrics: ${error.message}`);

  // Compute aggregates
  let totalSpend = 0;
  let totalConversions = 0;
  const platformMap = new Map<string, { spend: number; conversions: number }>();
  const trendMap = new Map<string, { spend: number; conversions: number }>();

  for (const m of metrics ?? []) {
    totalSpend += m.spend;
    totalConversions += m.conversions;

    const platform = (m.campaigns as unknown as { platform: string }).platform;
    const existing = platformMap.get(platform) ?? { spend: 0, conversions: 0 };
    platformMap.set(platform, {
      spend: existing.spend + m.spend,
      conversions: existing.conversions + m.conversions
    });

    const dateExisting = trendMap.get(m.date) ?? { spend: 0, conversions: 0 };
    trendMap.set(m.date, {
      spend: dateExisting.spend + m.spend,
      conversions: dateExisting.conversions + m.conversions
    });
  }

  const trend = Array.from(trendMap.entries())
    .map(([date, vals]) => ({ date, ...vals }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const platformBreakdown = Array.from(platformMap.entries()).map(
    ([platform, vals]) => ({
      platform: platform as DashboardSummary["platformBreakdown"][number]["platform"],
      ...vals
    })
  );

  return {
    totalSpend,
    spendDelta: 0,    // computed historically (previous period comparison)
    totalConversions,
    conversionsDelta: 0,
    averageCpc: totalSpend / Math.max(1, totalConversions),
    cpcDelta: 0,
    roi: 2.5,         // placeholder — computed from revenue data
    roiDelta: 0,
    trend,
    platformBreakdown
  };
}

/**
 * Fetches campaigns from Supabase or falls back to mock data.
 */
export async function getCampaigns(): Promise<CampaignSummary[]> {
  if (USE_MOCK) return mockCampaigns;

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: userRecord } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*, metrics:campaign_metrics(spend, impressions, clicks, conversions)")
    .eq("organization_id", userRecord?.organization_id);

  if (error) throw new Error(`Failed to fetch campaigns: ${error.message}`);

  return (campaigns ?? []).map((c: Record<string, unknown>) => {
    const metrics = (c.metrics as Array<Record<string, unknown>> | undefined) ?? [];
    const totalSpend = metrics.reduce((s, m) => s + (Number(m.spend) || 0), 0);
    const totalClicks = metrics.reduce((s, m) => s + (Number(m.clicks) || 0), 0);
    const totalImpressions = metrics.reduce((s, m) => s + (Number(m.impressions) || 0), 0);
    const totalConversions = metrics.reduce((s, m) => s + (Number(m.conversions) || 0), 0);

    return {
      id: c.id as string,
      adAccountId: c.ad_account_id as string,
      name: c.name as string,
      platform: c.platform as CampaignSummary["platform"],
      budget: c.budget as number,
      status: c.status as CampaignSummary["status"],
      objective: c.objective as CampaignSummary["objective"],
      createdAt: c.created_at as string,
      spend: totalSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      conversions: totalConversions,
      cpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
      ctr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      trend: metrics.slice(-7).map((m) => Number(m.spend) || 0)
    };
  });
}

/**
 * Fetches recommendations from Supabase or falls back to mock data.
 */
export async function getRecommendations(): Promise<Recommendation[]> {
  if (USE_MOCK) return mockRecommendations;

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: userRecord } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("recommendations")
    .select("*")
    .eq("organization_id", userRecord?.organization_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch recommendations: ${error.message}`);

  return (data ?? []).map((r) => ({
    id: r.id,
    campaignId: r.campaign_id,
    title: r.title,
    body: r.body,
    impact: r.impact,
    estimatedSavings: r.estimated_savings,
    status: r.status,
    createdAt: r.created_at
  }));
}

/**
 * Fetches the connected ad accounts (Meta/Google/TikTok OAuth tokens) for
 * the user's organization. RLS via migration 003 hides the encrypted_token
 * column automatically — we just query the safe columns here.
 */
export async function getConnectedAccounts(): Promise<AdAccount[]> {
  if (USE_MOCK) return mockAccounts;

  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: userRecord } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();
  const orgId = userRecord?.organization_id;
  if (!orgId) throw new Error("No organization found");

  // column-level GRANTs from migration 003 make this safe — we cannot read
  // encrypted_token even if we tried (the role lacks that column privilege).
  const { data, error } = await supabase
    .from("ad_accounts")
    .select(
      "id, organization_id, platform, platform_account_id, platform_account_name, is_active, token_expires_at, connected_at"
    )
    .eq("organization_id", orgId)
    .order("connected_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch accounts: ${error.message}`);

  return (data ?? []).map((a) => ({
    id: a.id,
    profileId: a.organization_id,
    platform: a.platform as AdAccount["platform"],
    platformAccountId: a.platform_account_id,
    isActive: a.is_active,
    connectedAt: a.connected_at
  }));
}
