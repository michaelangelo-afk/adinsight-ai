// app/api/auth/google-ads/callback/route.ts
//
// Google Ads OAuth return leg. Verifies the single-use CSRF state cookie,
// exchanges the code for tokens, and returns the customer accounts the user
// can reach. Nothing is persisted yet; storage needs a migration that has
// not been applied.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeGoogleAdsCode,
  listAccessibleCustomers,
  readGoogleAdsEnv
} from "@/lib/google-ads/client";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "google_ads_oauth_state";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const cookieStore = cookies();

  const expected = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (errorParam) {
    return NextResponse.json(
      { ok: false, error: `Google denied: ${errorParam}` },
      { status: 400 }
    );
  }
  if (!code || !state) {
    return NextResponse.json(
      { ok: false, error: "Google Ads callback missing code or state." },
      { status: 400 }
    );
  }
  if (!expected || expected !== state) {
    return NextResponse.json(
      { ok: false, error: "Google Ads OAuth state mismatch." },
      { status: 400 }
    );
  }

  const env = readGoogleAdsEnv();
  if (!env.ok) {
    return NextResponse.json(
      { ok: false, error: "Google Ads not configured", missing: env.missing },
      { status: 503 }
    );
  }

  try {
    const token = await exchangeGoogleAdsCode(code);
    const customers = await listAccessibleCustomers(token.access_token);
    return NextResponse.json({
      ok: true,
      expires_in: token.expires_in,
      customers
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Google Ads request failed"
      },
      { status: 502 }
    );
  }
}
