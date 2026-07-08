// lib/supabase/meta-connections.ts
//
// Phase 3.1 data access for the meta_connections table.
//
// Functions:
//   getMyMetaConnectionMeta     — read-only RLS-safe view (no secrets)
//   getMyMetaConnectionWithSecrets — service-role read WITH access_token
//   upsertMyMetaConnection      — service-role insert/update on OAuth callback
//   disconnectMyMetaConnection  — service-role that NILS out tokens at rest
//
// Security posture:
//   1. Base table is RLS-locked; users see only metadata columns via
//      meta_connections_safe view.
//   2. Column-level GRANT: the migration REFRESHes grant SELECT on
//      access_token + refresh_token FROM authenticated. So a
//      direct supabase.from("meta_connections").select("access_token, …")
//      from anon JS fails with a permissions error. The view is the
//      only safe-looking-but-not-required path.
//   3. WRITE / READ of secret columns uses createServiceClient() exclusively.
//   4. Tokens are stored plaintext at REST for the Phase-3 scaffold so
//      we can iterate on the OAuth flow without a Vault dependency.
//      THIS MUST BE MOVED TO SUPABASE VAULT before any production push.

import "server-only";
import { createClient as createAnonClient } from "./server";
import { createServiceClient } from "./server";

export interface MetaConnectionMeta {
  id: string;
  user_id: string;
  meta_user_id: string;
  meta_user_name: string | null;
  expires_at: string;
  scopes: string[];
  status: "active" | "revoked" | "expired";
  created_at: string;
  updated_at: string;
}

export interface MetaConnectionWithSecrets extends MetaConnectionMeta {
  access_token: string | null;
  refresh_token: string | null;
}

async function getAuthedUser(): Promise<{ id: string } | null> {
  const anon = createAnonClient();
  try {
    const r = await anon.auth.getUser();
    return r.data.user ? { id: r.data.user.id } : null;
  } catch {
    return null;
  }
}

/**
 * User-safe metadata — read from the RLS-exposed view. Never includes
 * access_token / refresh_token / explicit-any sensitive columns.
 */
export async function getMyMetaConnectionMeta(): Promise<MetaConnectionMeta | null> {
  const authed = await getAuthedUser();
  if (!authed) return null;

  // Re-create anon client per-call (cookies() can only be read in
  // request context; closure capture of `anon` works fine here).
  const anon = createAnonClient();
  const { data, error } = await anon
    .from("meta_connections_safe")
    .select("*")
    .eq("user_id", authed.id)
    .maybeSingle();
  if (error) {
    if (error.code === "PGRST205") return null; // view not migrated yet
    throw error;
  }
  return (data as MetaConnectionMeta | null) ?? null;
}

/**
 * Service-role read with secrets — used by server actions that need to
 * actually talk to Meta (Sync, pause/resume). This MUST NOT be called
 * from a route exposed to the client; only server actions.
 */
export async function getMyMetaConnectionWithSecrets(): Promise<MetaConnectionWithSecrets | null> {
  const authed = await getAuthedUser();
  if (!authed) return null;

  const service = createServiceClient();
  const { data, error } = await service
    .from("meta_connections")
    .select("*")
    .eq("user_id", authed.id)
    .maybeSingle();
  if (error) throw error;
  return (data as MetaConnectionWithSecrets | null) ?? null;
}

/**
 * Idempotent upsert by user_id. Called by the OAuth callback after the
 * Meta code-exchange (long-lived token) succeeds. Only service-role
 * writes — relies on RLS + REVOKEd column GRANT to lock the base table
 * to this path.
 */
export async function upsertMyMetaConnection(input: {
  meta_user_id: string;
  meta_user_name?: string;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  scopes: string[];
}): Promise<string | null> {
  const authed = await getAuthedUser();
  if (!authed) return null;

  const service = createServiceClient();
  const { data, error } = await service
    .from("meta_connections")
    .upsert(
      {
        user_id: authed.id,
        meta_user_id: input.meta_user_id,
        meta_user_name: input.meta_user_name ?? null,
        access_token: input.access_token,
        refresh_token: input.refresh_token ?? null,
        expires_at: input.expires_at,
        scopes: input.scopes,
        status: "active"
      },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();
  if (error) throw error;
  return data?.id ?? null;
}

/**
 * Disconnect: NIL the token columns AND set status = 'revoked'. This is
 * stronger than the prior Phase 3 draft which only set status and left
 * plaintext tokens in the audit row. The audit metadata
 * (meta_user_id, scopes, created_at, updated_at) is preserved.
 *
 * Eventually we want a real Meta /me/permissions revoke call; for now
 * we clear credentials at rest and let Meta's natural expiry handle
 * the remote-side invalidation.
 */
export async function disconnectMyMetaConnection(): Promise<void> {
  const authed = await getAuthedUser();
  if (!authed) return;

  const service = createServiceClient();
  await service
    .from("meta_connections")
    .update({
      access_token: null,
      refresh_token: null,
      status: "revoked",
      updated_at: new Date().toISOString()
    })
    .eq("user_id", authed.id);
}
