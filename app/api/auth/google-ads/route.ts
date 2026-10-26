// app/api/auth/google-ads/route.ts
//
// Starts the Google Ads OAuth flow: sets a single-use CSRF state cookie and
// redirects to the consent screen.

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import {
  buildGoogleAdsAuthUrl,
  readGoogleAdsEnv
} from "@/lib/google-ads/client";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!readGoogleAdsEnv().ok) {
    return NextResponse.json(
      { ok: false, error: "Google Ads not configured" },
      { status: 503 }
    );
  }
  const state = randomBytes(24).toString("hex");
  cookies().set("google_ads_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/"
  });
  return NextResponse.redirect(buildGoogleAdsAuthUrl(state));
}
