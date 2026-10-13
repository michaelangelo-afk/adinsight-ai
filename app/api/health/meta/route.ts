// app/api/health/meta/route.ts
//
// Meta-OAuth connection readiness pre-flight. Hit this URL in your
// browser BEFORE involving a friend in a real OAuth roundtrip — it
// returns exactly what the Next.js server loaded from .env.local,
// without leaking the secret values.
//
// Sample use:
//   $ curl http://localhost:3000/api/health/meta
//
// Returns JSON like:
//   {
//     "ready": true,
//     "node_env": "development",
//     "server_time": "2026-07-09T12:34:56.000Z",
//     "warnings": [],
//     "checks": {
//       "META_APP_ID_present": true,
//       "META_APP_ID_length": 16,
//       "META_APP_SECRET_present": true,
//       "META_APP_SECRET_length": 32,
//       "META_REDIRECT_URI_present": true,
//       "META_REDIRECT_URI_effective": "https://your-app.vercel.app/api/auth/meta/callback",
//       "META_REDIRECT_URI_reachable_by_meta": true,
//       "META_API_VERSION_effective": "v18.0"
//     }
//   }
//
// `warnings` is the pre-flight answer to "will the friend-test work?":
// a loopback redirect URI in production, or no explicit META_REDIRECT_URI
// at all, both appear there instead of failing mysteriously at the dialog.
//
// Trust-boundary decisions:
//   - NEVER echo the actual META_APP_ID or META_APP_SECRET values.
//     Only booleans + byte lengths — the diagnostic value is "did
//     Next.js actually load .env.local", not "what is the secret".
//   - Cache-Control: no-store so the response always reflects env
//     at request time, not a stale prerender from build.

import { readMetaEnv, isLoopbackRedirect } from "@/lib/meta/env";

// Belt-and-braces dynamic export — same reason as the OAuth callback
// route. Prevents Next.js from statically evaluating readMetaEnv()
// at build time and serving a stale diagnostic.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const id = process.env.META_APP_ID ?? "";
  const sec = process.env.META_APP_SECRET ?? "";
  const env = readMetaEnv();

  // Both `redirectUri` and `apiVersion` are populated on BOTH branches of
  // readMetaEnv() — the ok:false branch deliberately carries them so this
  // endpoint never has to guess. It used to hardcode
  // "(default) http://localhost:3000/..." whenever the app id/secret were
  // missing, which meant an operator who had correctly set
  // META_REDIRECT_URI to their public URL was told the app was still
  // pointing at localhost. That is the exact misreading this endpoint
  // exists to prevent, so it now reports what the runtime actually sees
  // plus whether the value was explicitly set.
  const explicitRedirect = (process.env.META_REDIRECT_URI ?? "").length > 0;
  const isProd = (process.env.NODE_ENV ?? "") === "production";
  const loopback = isLoopbackRedirect(env.redirectUri);

  // A localhost redirect URI in production is not a style issue: Meta's
  // servers POST back to this URL, so it can never complete. buildOAuthUrl()
  // throws for it at Connect time; surfacing it here moves the discovery
  // from "user reports a mystery failure" to "pre-flight says so".
  const warnings: string[] = [];
  if (isProd && loopback) {
    warnings.push(
      `META_REDIRECT_URI resolves to a loopback address (${env.redirectUri}) ` +
        `in a production deployment. Meta cannot reach it, so Connect will ` +
        `fail at the dialog. Set META_REDIRECT_URI to the public HTTPS URL ` +
        `of /api/auth/meta/callback and register the same URL under "Valid ` +
        `OAuth Redirect URIs" on the Meta app.`
    );
  }
  if (!explicitRedirect) {
    warnings.push(
      "META_REDIRECT_URI is not set, so the localhost development default " +
        "is in use. Set it explicitly in every deployed environment."
    );
  }

  return Response.json(
    {
      ready: env.ok,
      server_time: new Date().toISOString(),
      node_env: process.env.NODE_ENV ?? "unknown",
      warnings,
      checks: {
        META_APP_ID_present: id.length > 0,
        META_APP_ID_length: id.length,
        META_APP_SECRET_present: sec.length > 0,
        META_APP_SECRET_length: sec.length,
        META_REDIRECT_URI_present: explicitRedirect,
        META_REDIRECT_URI_effective: env.redirectUri,
        META_REDIRECT_URI_reachable_by_meta: !(isProd && loopback),
        META_API_VERSION_effective: env.apiVersion
      }
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
