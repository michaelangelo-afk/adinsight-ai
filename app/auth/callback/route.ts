import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Handles the OAuth/email confirmation redirect from Supabase Auth.
 * Exchanges the `code` query parameter for a session and redirects
 * to the dashboard (or onboarding for new users).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Redirect to login with error message
      const url = new URL("/login", origin);
      url.searchParams.set("error", "auth-failed");
      return NextResponse.redirect(url);
    }
  }

  // Redirect to the intended destination
  return NextResponse.redirect(new URL(next, origin));
}
