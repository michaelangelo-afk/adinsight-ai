import { createServerClient } from "@supabase/ssr";
import { createClient as createSupaClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Server Component / Server Action client.
 * Uses cookie-based session for RLS-authenticated queries.
 *
 * Wrapped in `cache()` so repeated calls in the same request resolve
 * to the same instance. Without this, the OAuth callback + sync
 * action had each DAO call creating a fresh client — and since
 * `getUser()` returns expires_at info on every call, that pattern
 * could spuriously trigger a token-refresh in the middle of an
 * active mutation, racing the action's own cookies().set() call.
 */
export const createClient = cache(() => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // SetAll can be called from a Server Component —
            // ignore if middleware already set the cookie.
          }
        }
      }
    }
  );
});

/**
 * Service-role client for privileged operations (Edge Functions, token decryption).
 * Uses the vanilla @supabase/supabase-js client directly — no cookies needed
 * because the service_role key bypasses RLS entirely.
 *
 * DO NOT expose this to the client — use only in server actions or route handlers.
 *
 * Wrapped in `cache()` for the same reason as `createClient` above: avoid
 * creating duplicate service-role clients inside a single request.
 */
export const createServiceClient = cache(() => {
  return createSupaClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
});
