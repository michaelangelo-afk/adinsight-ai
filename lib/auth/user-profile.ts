/**
 * Public shape of a user's joined profile, returned from getCurrentUser.
 *
 * `organizations` is typed as either a single object (1:1 join) OR an
 * array (Supabase 1:N join behavior) — callers should resolve via
 * `resolveOrgName()` below.
 *
 * Lives in `lib/auth/user-profile.ts` (NOT `app/actions/auth.ts`)
 * because the parent file is marked `"use server"`, which requires
 * every export to be an async function. A synchronous helper like
 * `resolveOrgName` and the type definitions are kept here in a
 * normal (non-server) module so the Next.js build accepts them.
 */
export interface CurrentUserProfile {
  id: string;
  organization_id: string | null;
  full_name: string;
  phone: string | null;
  avatar: string | null;
  organizations:
    | { name: string }
    | Array<{ name: string }>
    | null;
}

/**
 * Coerce the joined `organizations` field — Supabase returns it as either
 * a single object or an array depending on the join cardinality. Returns
 * a defensive default string when no org is found.
 *
 * Used in both `app/(dashboard)/layout.tsx` and the dashboard page so
 * the org-name coercion lives in exactly ONE place.
 */
export function resolveOrgName(
  organizations: CurrentUserProfile["organizations"]
): string {
  if (!organizations) return "My Business";
  if (Array.isArray(organizations)) return organizations[0]?.name ?? "My Business";
  return organizations.name ?? "My Business";
}
