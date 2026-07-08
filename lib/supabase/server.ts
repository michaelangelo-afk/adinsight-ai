import { createServerClient } from "@supabase/ssr";
import { createClient as createSupaClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server Component / Server Action client.
 * Uses cookie-based session for RLS-authenticated queries.
 */
export function createClient() {
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
}

/**
 * Service-role client for privileged operations (Edge Functions, token decryption).
 * Uses the vanilla @supabase/supabase-js client directly — no cookies needed
 * because the service_role key bypasses RLS entirely.
 *
 * DO NOT expose this to the client — use only in server actions or route handlers.
 */
export function createServiceClient() {
  return createSupaClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
