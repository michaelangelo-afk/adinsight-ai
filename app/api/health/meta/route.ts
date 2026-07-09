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
//     "checks": {
//       "META_APP_ID_present": true,
//       "META_APP_ID_length": 16,
//       "META_APP_SECRET_present": true,
//       "META_APP_SECRET_length": 32,
//       "META_REDIRECT_URI_effective": "http://localhost:3000/api/auth/meta/callback",
//       "META_API_VERSION_effective": "v18.0"
//     }
//   }
//
// Trust-boundary decisions:
//   - NEVER echo the actual META_APP_ID or META_APP_SECRET values.
//     Only booleans + byte lengths — the diagnostic value is "did
//     Next.js actually load .env.local", not "what is the secret".
//   - Cache-Control: no-store so the response always reflects env
//     at request time, not a stale prerender from build.

import { readMetaEnv } from "@/lib/meta/env";

// Belt-and-braces dynamic export — same reason as the OAuth callback
// route. Prevents Next.js from statically evaluating readMetaEnv()
// at build time and serving a stale diagnostic.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const id = process.env.META_APP_ID ?? "";
  const sec = process.env.META_APP_SECRET ?? "";
  const env = readMetaEnv();

  return Response.json(
    {
      ready: env.ok,
      server_time: new Date().toISOString(),
      node_env: process.env.NODE_ENV ?? "unknown",
      checks: {
        META_APP_ID_present: id.length > 0,
        META_APP_ID_length: id.length,
        META_APP_SECRET_present: sec.length > 0,
        META_APP_SECRET_length: sec.length,
        META_REDIRECT_URI_effective: env.ok
          ? env.redirectUri
          : "(default) http://localhost:3000/api/auth/meta/callback",
        META_API_VERSION_effective: env.ok ? env.apiVersion : "v18.0 (default)"
      }
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
