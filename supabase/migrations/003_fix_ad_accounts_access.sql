-- =============================================================================
-- GrowthAds — Migration 003: Fix ad_accounts access
-- Idempotent — safe to re-run.
--
-- BACKGROUND:
-- Migration 001 created an `ad_accounts_public` view that omits the
-- `encrypted_token` column with `security_invoker = true`.
-- Migration 002 deliberately had NO SELECT policy on the `ad_accounts`
-- base table (so encrypted_token would never leak).
--
-- BUG: With security_invoker=true and no SELECT policy on the base table,
-- the view silently returns zero rows. We attempted to fix it with a
-- CREATE POLICY on the view, but some Postgres configurations reject
-- RLS policies on views (error: \"ad_accounts_public\" is not a table).
--
-- FIX (the proper Postgres column-level GRANTs pattern):
-- 1. Drop the broken view.
-- 2. Add a SELECT policy on ad_accounts scoped by organization.
-- 3. Revoke default SELECT, then GRANT SELECT on specific columns only.
--    This hides encrypted_token from non-service_role without needing
--    a view wrapper.
--
-- Failure modes:
-- * service_role BYPASSES RLS and is not affected by the REVOKE/GRANT
--   cycle (it has full decrypted-token access for Edge Functions).
-- * anon has no table-level GRANTs by default; the REVOKE is belt-and-
--   suspenders. We exclude it explicitly too.
-- * If 003 is interrupted between REVOKE and GRANT, the auth'd role has
--   zero SELECT on ad_accounts until the migration is re-applied.
-- =============================================================================

-- 1. Drop the broken view (idempotent)
drop view if exists ad_accounts_public;

-- 2. Drop the SELECT policy if it already exists (for idempotency), then re-create
drop policy if exists "Users can read own ad_accounts" on ad_accounts;
create policy "Users can read own ad_accounts"
  on ad_accounts for select
  to authenticated
  using (
    organization_id = (
      select organization_id from users where id = auth.uid()
    )
  );

-- 3. Column-level security: hide encrypted_token
-- Revoke any prior column-level GRANTs first (in case 003 was partially
-- applied on a previous run), then revoke the default public SELECT,
-- then re-grant only the safe columns to the authed role.
revoke select on ad_accounts from authenticated;
revoke select on ad_accounts from public;
grant select (
  id,
  organization_id,
  platform,
  platform_account_id,
  platform_account_name,
  is_active,
  token_expires_at,
  connected_at
) on ad_accounts to authenticated;
