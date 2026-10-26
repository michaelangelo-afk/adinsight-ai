// app/api/auth/snapchat/route.ts
//
// Starts the Snapchat OAuth flow: sets a single-use CSRF state cookie and
// redirects to the consent screen.

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { buildSnapchatAuthUrl, readSnapchatEnv } from "@/lib/snapchat/client";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!readSnapchatEnv().ok) {
    return NextResponse.json(
      { ok: false, error: "Snapchat not configured" },
      { status: 503 }
    );
  }
  const state = randomBytes(24).toString("hex");
  cookies().set("snapchat_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/"
  });
  return NextResponse.redirect(buildSnapchatAuthUrl(state));
}
