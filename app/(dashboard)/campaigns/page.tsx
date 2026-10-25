import type { Metadata } from "next";
import { Topbar, type TopbarProfile } from "@/components/dashboard/topbar";
import { CampaignsWorkspace } from "@/components/campaigns/campaigns-workspace";
import { getCampaigns } from "@/app/actions/dashboard";
import { getCurrentUser } from "@/app/actions/auth";
import { resolveOrgName } from "@/lib/auth/user-profile";

export const metadata: Metadata = {
  title: "Campaigns · GrowthAds",
  description:
    "Monitor and manage every campaign across Meta, Google and TikTok from one workspace."
};

export default async function CampaignsPage() {
  const [user, campaigns] = await Promise.all([getCurrentUser(), getCampaigns()]);

  const fullName = user?.profile?.full_name ?? "User";
  const profile: TopbarProfile = {
    avatar:
      user?.profile?.avatar ||
      fullName
        .split(" ")
        .map((part: string) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "?",
    fullName,
    businessName: resolveOrgName(user?.profile?.organizations ?? null)
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <Topbar profile={profile} />
      <CampaignsWorkspace campaigns={campaigns ?? []} />
    </div>
  );
}
