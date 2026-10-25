/**
 * Workspace theme policy.
 *
 * The product surface is a dark operator tool. The marketing page keeps its
 * own light/dark shell (`.shell` tokens in globals.css), but everything inside
 * the app is dark regardless of the visitor's stored preference.
 *
 * Why enforce it at the <html> level instead of writing `dark:` classes
 * everywhere: the app is built from ~70 components and hundreds of `dark:`
 * utilities that were audited against the dark theme. Forcing the class means
 * every one of them resolves correctly, the charts (which are drawn for a dark
 * stock) stay legible, and there is exactly one theme to design and verify.
 *
 * `app/flash-theme.tsx` inlines the same prefix list before hydration, and
 * `app/theme-provider.tsx` keeps it applied during client-side navigation, so
 * entering the workspace never flashes a light frame.
 */

export type Theme = "light" | "dark";

/** Paths (and their children) that belong to the dark product surface. */
export const WORKSPACE_PREFIXES = [
  "/dashboard",
  "/campaigns",
  "/channels",
  "/recommendations",
  "/reports",
  "/influencers",
  "/billing",
  "/login",
  "/signup",
  "/onboarding",
  "/channels-preview"
] as const;

/** The theme every workspace route renders in. */
export const WORKSPACE_THEME = "dark" as const;

export function isWorkspacePath(
  pathname: string | null | undefined
): boolean {
  if (!pathname) return false;
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/") return false;
  return WORKSPACE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}
