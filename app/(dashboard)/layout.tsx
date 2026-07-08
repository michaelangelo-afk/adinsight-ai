import * as React from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentUser, resolveOrgName } from "@/app/actions/auth";

/**
 * Dashboard route group layout.
 *
 * Two responsibilities:
 * 1. Auth — redirect to /login if no session, to /onboarding if user has no org.
 * 2. Shell — render <Sidebar> with the org name + main flex shell.
 *
 * The dashboard page only renders the dashboard widgets (Topbar + grids),
 * NOT a second Sidebar — that was a regression in Phase 2 wire-up.
 */
export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.profile?.organization_id) {
    redirect("/onboarding");
  }

  const orgName = resolveOrgName(user.profile.organizations);

  return (
    <div className="min-h-screen flex bg-ink-950">
      <Sidebar orgName={orgName} />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
