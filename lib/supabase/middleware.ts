import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware session updater.
 *
 * This is intentionally conservative: it never throws out to Vercel. If
 * Supabase env vars are missing (project not provisioned yet) OR if the
 * Supabase API call fails for any reason, we silently fall through and
 * let the request proceed — the route/page itself can do further checks
 * via server components.
 *
 * The onboarding-redirect logic is intentionally NOT implemented here
 * (those query.sql calls belong in a server component, not edge middleware).
 */
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // --- Short-circuit paths that don't need auth at all ---
  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path === "/auth/callback"
  ) {
    return NextResponse.next({ request });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- If Supabase isn't configured, allow the request through ---
  // This is what the project needs to demo on Vercel BEFORE credentials
  // are set. The /dashboard route is itself server-component gated, so
  // unauthenticated users won't actually see real data — they'll just see
  // the page or get redirected by the layout.
  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  let supabase;
  try {
    supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    });
  } catch {
    // Failed to construct client — allow request through.
    return NextResponse.next({ request });
  }

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Network/auth error — allow request through (no auth gate applied).
    return NextResponse.next({ request });
  }

  const publicPaths = ["/", "/login", "/signup", "/onboarding"];
  const isPublic =
    publicPaths.includes(path) ||
    path.startsWith("/api/");

  // --- Helper: build a redirect that preserves any cookies set during auth refresh ---
  const redirectWithCookies = (to: string) => {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = to;
    const res = NextResponse.redirect(redirectUrl);
    // Copy refreshed session cookies from supabaseResponse so token refresh
    // survives the redirect.
    supabaseResponse.cookies.getAll().forEach((c) => {
      res.cookies.set(c);
    });
    return res;
  };

  // --- Redirect unauthenticated users away from protected routes ---
  if (!user && !isPublic) {
    return redirectWithCookies("/login");
  }

  // --- Redirect authenticated users away from auth pages ---
  if (user && (path === "/login" || path === "/signup")) {
    return redirectWithCookies("/dashboard");
  }

  // NOTE: Onboarding redirect (users without organization_id → /onboarding)
  // is intentionally handled by the server component at
  // app/(dashboard)/layout.tsx — not here. It needs a DB query, which is
  // expensive on every request and belongs on the server side, not in
  // edge middleware. The dashboard layout will redirect on first render.

  return supabaseResponse;
}
