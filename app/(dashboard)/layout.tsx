import * as React from "react";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { getCurrentUser } from "@/app/actions/auth";

/**
 * Dashboard route group layout.
 *
 * Performs server-side checks that don't belong in edge middleware:
 * 1. Auth — redirect to /login if no session
 * 2. Onboarding — redirect to /onboarding if user has no organization
 *
 * The sidebar + main-shell render happens after these checks pass.
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

  // If the user has no organization linked, send them to the onboarding wizard.
  // This is a no-op when user.profile is null (e.g. unprovisioned/incomplete
  // Supabase setup) because of the early redirect above.
  if (!user.profile?.organization_id) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen flex bg-ink-950">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
