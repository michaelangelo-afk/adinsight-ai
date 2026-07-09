// lib/dashboard/nav.ts
//
// Single source of truth for the dashboard's route navigation. Both
// `components/dashboard/sidebar.tsx` (vertical rail, lg+) and
// `components/dashboard/topbar.tsx` (horizontal strip, md+) consume
// this so the two surfaces can't drift — same routes, same icon, same
// active-state via `isNavActive()`.
//
// Phase 6 — the horizontal Topbar strip is the fix for the user
// complaint: on tablets and narrow laptops the sidebar begins hidden
// below `lg` (1024px), so without this strip there was no route to
// /influencers / /recommendations / /reports / /billing.

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Users,
  Wallet,
  Settings
} from "lucide-react";

export interface NavItem {
  /** Visible label. Also used as the `aria-label` / `title` (Link tooltip). */
  label: string;
  /** Lucide icon used by both surfaces. */
  icon: LucideIcon;
  /** Real route OR `#" for not-yet-implemented stubs (rendered disabled). */
  href: string;
  /** Optional pill count (e.g. 3 new recommendations). */
  badge?: number;
  /** Stub marker — routes with no linked page yet (Settings today). */
  stub?: boolean;
}

/**
 * Authoritative dashboard nav list. Order = display order on BOTH
 * surfaces. Adding a route here automatically shows it in the sidebar
 * (lg+) AND in the topbar strip (md+) with consistent active state.
 */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  {
    label: "Recommendations",
    icon: Sparkles,
    href: "/recommendations",
    badge: 3
  },
  { label: "Reports", icon: FileText, href: "/reports" },
  {
    label: "Influencers",
    icon: Users,
    href: "/influencers",
    // Surface the creator marketplace count to make the entry-point
    // visually distinguishable from the other dashboard rail items;
    // matches the "12 vetted creators" copy on the /influencers hero.
    badge: 12
  },
  { label: "Billing", icon: Wallet, href: "/billing" },
  { label: "Settings", icon: Settings, href: "#", stub: true }
];

/**
 * Is `href` the currently active route? Strips a trailing slash so
 * `/influencers/` matches `/influencers`. Stubs (`href === "#"`)
 * never match. Used by BOTH sidebar and topbar — keep the predicate
 * identical on both surfaces so the active state lights up the same
 * link everywhere.
 */
export function isNavActive(
  pathname: string | null | undefined,
  href: string
): boolean {
  if (!pathname || href === "#") return false;
  const path = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (path === target) return true;
  // Prefix match on "/segment" so /influencers?c=foo still highlights
  // the Influencers nav entry instead of going dead.
  return path.startsWith(target + "/");
}
