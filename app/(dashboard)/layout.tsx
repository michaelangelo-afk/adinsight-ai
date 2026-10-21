import * as React from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/app/actions/auth";
import { resolveOrgName } from "@/lib/auth/user-profile";
import { isAuthDisabled } from "@/lib/auth/auth-disabled";

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
  // Temporary bypass for reviewing the dashboard without a session —
  // see lib/auth/auth-disabled.ts. Auth is enforced again as soon as
  // NEXT_PUBLIC_DISABLE_AUTH is unset.
  const authDisabled = isAuthDisabled();

  if (!user && !authDisabled) {
    redirect("/login");
  }

  if (user && !user.profile?.organization_id && !authDisabled) {
    redirect("/onboarding");
  }

  const orgName = authDisabled && !user
    ? "Demo workspace"
    : resolveOrgName(user?.profile?.organizations ?? null);

  return (
    <div className="min-h-screen flex bg-ink-950">
      <Sidebar orgName={orgName} />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
