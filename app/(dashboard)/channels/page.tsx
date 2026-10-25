import type { Metadata } from "next";
import { Topbar, type TopbarProfile } from "@/components/dashboard/topbar";
import { ChannelsBoard } from "@/components/channels/channels-board";
import { getCurrentUser } from "@/app/actions/auth";
import { resolveOrgName } from "@/lib/auth/user-profile";

export const metadata: Metadata = {
  title: "Channels · GrowthAds",
  description:
    "Every ad channel mapped by Nigerian reach, cost and access. Connect where an API exists; assisted publishing where it does not."
};

export default async function ChannelsPage() {
  const user = await getCurrentUser();
  const orgName = resolveOrgName(user?.profile?.organizations ?? null);
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
    businessName: orgName
  };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <Topbar profile={profile} />
      <ChannelsBoard defaultBusiness={orgName} />
    </div>
  );
}
