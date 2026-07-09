/**
 * Meta Graph API test-user lifecycle helpers.
 *
 * The Facebook Test Users API at
 *   POST   /{apiVersion}/{app_id}/accounts/test-users
 *   DELETE /{apiVersion}/{test_user_id}
 * lets a Meta app own a pool of pre-authorised test accounts so that
 * automated CI can drive the production-flavoured OAuth dialog without
 * burning a real Facebook login. Permissions requested at creation time
 * are auto-granted; the consent screen the test still has to click is
 * the "this app wants access" confirmation, not a real permission ask.
 *
 * Reference: developers.facebook.com → app → Roles → Test Users.
 */

export interface MetaTestUser {
  id: string;
  email: string;
  /** Pre-authenticated Facebook session URL. page.goto() this and the
   *  test user is signed into facebook.com without a password prompt. */
  loginUrl: string;
  /** Plaintext password (useful for manual debug; never logs it). */
  password: string;
  /** App-scoped access token for this test user (not needed in spec). */
  accessToken: string;
}

export interface CreateMetaTestUserOpts {
  appId: string;
  appSecret: string;
  apiVersion?: string;
  /** Pre-granted scopes. Default = the three our OAuth flow requests. */
  scopes?: readonly string[];
}

const DEFAULT_SCOPES = ["ads_read", "ads_management", "read_insights"] as const;

/**
 * Create a Facebook test user with the requested scopes auto-granted.
 * Throws on non-2xx with the raw response body so the failure message
 * tells you whether it was rate-limit, app-permission-denied, or
 * something else.
 */
export async function createMetaTestUser(
  opts: CreateMetaTestUserOpts
): Promise<MetaTestUser> {
  const apiVersion = opts.apiVersion ?? "v18.0";
  const appAccessToken = `${opts.appId}|${opts.appSecret}`;
  const url = new URL(
    `https://graph.facebook.com/${apiVersion}/${opts.appId}/accounts/test-users`
  );
  url.searchParams.set("installed", "true");
  url.searchParams.set(
    "permissions",
    (opts.scopes ?? DEFAULT_SCOPES).join(",")
  );
  url.searchParams.set("access_token", appAccessToken);

  const res = await fetch(url, { method: "POST", cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Meta test-users create failed: HTTP ${res.status} — ${body.slice(0, 300)}`
    );
  }
  const j = (await res.json()) as {
    id?: string;
    email?: string;
    login_url?: string;
    password?: string;
    access_token?: string;
  };
  if (!j.id || !j.login_url) {
    throw new Error(
      `Meta test-users create returned unexpected payload: ${JSON.stringify(j).slice(
        0,
        300
      )}`
    );
  }
  return {
    id: j.id,
    email: j.email ?? "",
    loginUrl: j.login_url,
    password: j.password ?? "",
    accessToken: j.access_token ?? ""
  };
}

/**
 * Delete a Facebook test user so the app's test-user pool doesn't grow
 * unbounded across CI runs. CI cancellations are a known source of
 * "we created but didn't delete" — callers should wrap this in
 * try/catch with a console.warn inside afterAll so cleanup failure
 * doesn't mask the actual test result.
 */
export async function deleteMetaTestUser(args: {
  appId: string;
  appSecret: string;
  testUserId: string;
  apiVersion?: string;
}): Promise<void> {
  const apiVersion = args.apiVersion ?? "v18.0";
  const appAccessToken = `${args.appId}|${args.appSecret}`;
  const url = new URL(
    `https://graph.facebook.com/${apiVersion}/${args.testUserId}`
  );
  url.searchParams.set("method", "delete");
  url.searchParams.set("access_token", appAccessToken);
  const res = await fetch(url, { method: "POST", cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Meta test-users delete ${args.testUserId} failed: HTTP ${res.status} — ${body.slice(
        0,
        200
      )}`
    );
  }
}
