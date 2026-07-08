-- 0001_meta_tables.sql — Phase 3: Meta OAuth + connection storage.
--
-- Run against the project with one of:
--   psql "$SUPABASE_DB_URL" -f supabase/migrations/0001_meta_tables.sql
--   supabase db push --file supabase/migrations/0001_meta_tables.sql
--   Or pasted via the Supabase SQL editor at:
--     https://supabase.com/dashboard/project/dyfeolrotkjmeauiknbx/sql/new

-- ============================================================================
-- meta_connections: per-user Meta Marketing API connection.
-- Plaintext tokens at rest (RLS-scoped). For production, migrate to
-- Supabase Vault or a dedicated KMS in a follow-up; see the Phase-3
-- commit message for the dev-only disclaimer.
-- ============================================================================
create table if not exists public.meta_connections (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  meta_user_id     text not null,
  meta_user_name   text,
  access_token     text not null,
  refresh_token    text,
  expires_at       timestamptz not null,
  scopes           text[] not null default '{}',
  status           text not null default 'active'
                       check (status in ('active', 'revoked', 'expired')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- A user has at most one active Meta connection at a time.
  unique (user_id)
);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists meta_connections_touch_updated_at on public.meta_connections;
create trigger meta_connections_touch_updated_at
  before update on public.meta_connections
  for each row
  execute function public.touch_updated_at();

-- ============================================================================
-- Row Level Security — tokens are sensitive. The user can only read their
-- own connection's NON-token columns; the service_role key (server actions)
-- is the only path that can write or read the access_token.
-- ============================================================================
alter table public.meta_connections enable row level security;

-- User can read their own connection's metadata (NOT the access_token).
-- We expose a view below that hides access_token + refresh_token so the
-- client never sees them over the wire.
drop policy if exists "users read own meta_connections" on public.meta_connections;
create policy "users read own meta_connections"
  on public.meta_connections
  for select
  using (auth.uid() = user_id);

-- No direct insert/update/delete from the client — the callback route uses
-- the service_role key exclusively. This blocks a malicious client from
-- tampering via the auto-generated Supabase JS client.

-- A safe view that hides the secret columns. Reads from this view in dashboards.
create or replace view public.meta_connections_safe
  with (security_invoker = true) as
  select
    id,
    user_id,
    meta_user_id,
    meta_user_name,
    expires_at,
    scopes,
    status,
    created_at,
    updated_at
  from public.meta_connections;

grant select on public.meta_connections_safe to authenticated;
-- Service role gets full access (used by the OAuth callback route + Sync).
-- We do not grant `authenticated` insert/update/delete on the base table.

-- ============================================================================
-- meta_accounts: ad accounts belonging to a connected Meta user.
-- Powers the AccountsStrip card display.
-- ============================================================================
create table if not exists public.meta_accounts (
  id                  uuid primary key default gen_random_uuid(),
  connection_id       uuid not null references public.meta_connections(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  meta_account_id     text not null,
  name                text not null,
  account_status      integer not null default 1,
  currency            text,
  is_active           boolean not null default true,
  last_synced_at      timestamptz,
  unique (connection_id, meta_account_id)
);

create index if not exists meta_accounts_user_id_idx on public.meta_accounts(user_id);

alter table public.meta_accounts enable row level security;
drop policy if exists "users read own meta_accounts" on public.meta_accounts;
create policy "users read own meta_accounts"
  on public.meta_accounts
  for select
  using (auth.uid() = user_id);

-- Synced campaigns (mirror of Meta state, for Phase 3 dashboard snippets).
create table if not exists public.meta_campaigns (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  account_id          uuid not null references public.meta_accounts(id) on delete cascade,
  meta_campaign_id    text not null,
  name                text not null,
  status              text not null default 'ACTIVE'
                          check (status in ('ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED')),
  objective           text,
  updated_at          timestamptz not null default now(),
  unique (account_id, meta_campaign_id)
);

alter table public.meta_campaigns enable row level security;
drop policy if exists "users read own meta_campaigns" on public.meta_campaigns;
create policy "users read own meta_campaigns"
  on public.meta_campaigns
  for select
  using (auth.uid() = user_id);

-- ============================================================================
-- Column-level GRANT hardening on meta_connections.
--
-- Even with RLS on the base table, a row-level SELECT policy on
-- meta_connections lets the authenticated user SELECT ALL columns of
-- their own row, including access_token + refresh_token. That defeats
-- the purpose of the meta_connections_safe view.
--
-- We revoke SELECT on the secret columns from `authenticated` AND
-- `anon`, then grant back SELECT on only the safe columns. The view
-- still works because it reads from the service-role path (and via
-- RLS-on-the-base-table for security_invoker=true).
-- ============================================================================
revoke select on public.meta_connections from authenticated, anon;

-- Schema-level GRANT: re-grant SELECT only on the safe columns.
-- New columns added to meta_connections later MUST be added here, OR
-- they will be invisible to the client. The view will be updated to
-- include them too; view + grant stay in lockstep.
grant select (
  id, user_id, meta_user_id, meta_user_name,
  expires_at, scopes, status,
  created_at, updated_at
) on public.meta_connections to authenticated;

-- Anon role can read the safe columns only if signed in. The meta
-- OAuth callback writes via service role regardless of the user's
-- auth state, so even an anon call is meaningless here — we don't
-- grant SELECT to anon at all.
-- Phase-4 TODO: also gate meta_accounts + meta_campaigns on a similar
-- pattern if we ever expose campaign-budget or spend columns.
