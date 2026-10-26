// app/api/auth/snapchat/callback/route.ts
//
// Snapchat OAuth return leg. Verifies the single-use CSRF state cookie,
// exchanges the code for tokens, and returns the organizations and ad
// accounts the user can reach. Nothing is persisted yet; storage needs a
// migration that has not been applied.

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeSnapchatCode,
  fetchSnapchatOrganizations,
  readSnapchatEnv
} from "@/lib/snapchat/client";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "snapchat_oauth_state";

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
      { ok: false, error: `Snapchat denied: ${errorParam}` },
      { status: 400 }
    );
  }
  if (!code || !state) {
    return NextResponse.json(
      { ok: false, error: "Snapchat callback missing code or state." },
      { status: 400 }
    );
  }
  if (!expected || expected !== state) {
    return NextResponse.json(
      { ok: false, error: "Snapchat OAuth state mismatch." },
      { status: 400 }
    );
  }

  const env = readSnapchatEnv();
  if (!env.ok) {
    return NextResponse.json(
      { ok: false, error: "Snapchat not configured", missing: env.missing },
      { status: 503 }
    );
  }

  try {
    const token = await exchangeSnapchatCode(code);
    const organizations = await fetchSnapchatOrganizations(token.access_token);
    return NextResponse.json({
      ok: true,
      expires_in: token.expires_in,
      organizations
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Snapchat request failed"
      },
      { status: 502 }
    );
  }
}
