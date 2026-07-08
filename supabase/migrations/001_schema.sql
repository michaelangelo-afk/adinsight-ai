-- =============================================================================
-- GrowthAds — Database Schema (Phase 1)
-- Run via: supabase db push / supabase migration up
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto" with schema public;
create extension if not exists "pgsodium" with schema extensions;
create extension if not exists "pg_cron" with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type campaign_objective as enum (
  'awareness', 'traffic', 'leads', 'conversions', 'engagement'
);

create type campaign_status as enum (
  'active', 'paused', 'completed'
);

create type platform_type as enum (
  'meta', 'google', 'tiktok'
);

create type user_role as enum (
  'advertiser', 'admin'
);

create type recommendation_status as enum (
  'pending', 'applied', 'dismissed'
);

create type impact_level as enum (
  'high', 'medium', 'low'
);

create type subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled'
);

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create table organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  monthly_ad_budget integer not null default 0,
  primary_objective campaign_objective default 'conversions',
  paystack_customer_code text,
  created_at    timestamptz not null default now()
);

-- Enable RLS
alter table organizations enable row level security;

create policy "Users can read their own org"
  on organizations for select
  using (
    id = (select organization_id from users where id = auth.uid())
  );

create policy "Users can update their own org"
  on organizations for update
  using (
    id = (select organization_id from users where id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- users — extends auth.users with profile + org membership
-- ---------------------------------------------------------------------------
create table users (
  id              uuid primary key references auth.users on delete cascade,
  organization_id uuid references organizations on delete set null,
  role            user_role not null default 'advertiser',
  full_name       text not null,
  phone           text,
  avatar          text,
  created_at      timestamptz not null default now()
);

alter table users enable row level security;

create policy "Users can read own record"
  on users for select
  using (id = auth.uid());

create policy "Users can update own record"
  on users for update
  using (id = auth.uid());

-- Auto-create user record on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', 'User'));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid not null references organizations on delete cascade,
  plan_code               text not null,
  status                  subscription_status not null default 'trialing',
  current_period_end      timestamptz not null,
  paystack_subscription_code text,
  created_at              timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "Users can read own org subscription"
  on subscriptions for select
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- ad_accounts
-- ---------------------------------------------------------------------------
create table ad_accounts (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations on delete cascade,
  platform            platform_type not null,
  platform_account_id text not null,
  platform_account_name text,
  encrypted_token     text, -- pgsodium encrypted at app layer
  is_active           boolean not null default true,
  token_expires_at    timestamptz,
  connected_at        timestamptz not null default now()
);

alter table ad_accounts enable row level security;

-- Expose columns except encrypted_token to authenticated users.
-- The base table has NO SELECT policy for authenticated users — they must
-- query ad_accounts_public instead. Only service_role can read the base table.
create view ad_accounts_public as
  select id, organization_id, platform, platform_account_id,
         platform_account_name, is_active, token_expires_at, connected_at
  from ad_accounts;

alter view ad_accounts_public set (security_invoker = true);

-- Deny direct SELECT on base table for authenticated users
-- (service_role bypasses RLS, so Edge Functions can still read encrypted_token)

create policy "Users can insert own ad_accounts"
  on ad_accounts for insert
  with check (
    organization_id = (select organization_id from users where id = auth.uid())
  );

create policy "Users can update own ad_accounts"
  on ad_accounts for update
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
create table campaigns (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  ad_account_id   uuid references ad_accounts on delete set null,
  external_id     text, -- platform's campaign ID (e.g. Meta campaign ID)
  name            text not null,
  platform        platform_type not null,
  status          campaign_status not null default 'active',
  objective       campaign_objective not null default 'conversions',
  budget          integer not null default 0, -- NGN
  created_at      timestamptz not null default now()
);

alter table campaigns enable row level security;

create policy "Tenant isolation on campaigns"
  on campaigns for all
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  );

create index idx_campaigns_org on campaigns (organization_id);
create index idx_campaigns_external on campaigns (external_id);

-- ---------------------------------------------------------------------------
-- campaign_metrics
-- ---------------------------------------------------------------------------
create table campaign_metrics (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns on delete cascade,
  date        date not null,
  spend       integer not null default 0, -- NGN (stored as integer, not float)
  impressions integer not null default 0,
  clicks      integer not null default 0,
  conversions integer not null default 0,
  unique (campaign_id, date)
);

alter table campaign_metrics enable row level security;

create policy "Tenant isolation on campaign_metrics"
  on campaign_metrics for select
  using (
    campaign_id in (
      select id from campaigns
      where organization_id = (
        select organization_id from users where id = auth.uid()
      )
    )
  );

create index idx_metrics_campaign on campaign_metrics (campaign_id);
create index idx_metrics_date on campaign_metrics (date);

-- ---------------------------------------------------------------------------
-- recommendations
-- ---------------------------------------------------------------------------
create table recommendations (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations on delete cascade,
  campaign_id       uuid references campaigns on delete set null,
  title             text not null,
  body              text not null,
  impact            impact_level not null default 'medium',
  estimated_savings integer,
  status            recommendation_status not null default 'pending',
  created_at        timestamptz not null default now()
);

alter table recommendations enable row level security;

create policy "Tenant isolation on recommendations"
  on recommendations for all
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  );

create index idx_recs_org on recommendations (organization_id);

-- ---------------------------------------------------------------------------
-- reports
-- ---------------------------------------------------------------------------
create table reports (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  pdf_url         text,
  date_range_start date not null,
  date_range_end  date not null,
  title           text not null,
  size            text,
  created_at      timestamptz not null default now()
);

alter table reports enable row level security;

create policy "Tenant isolation on reports"
  on reports for all
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- pg_cron: daily meta-sync job
-- (Requires the supabase_functions schema and the net extension)
-- ---------------------------------------------------------------------------
-- Uncomment and adjust once your Edge Function is deployed:
--
-- select cron.schedule(
--   'meta-daily-sync',
--   '0 1 * * *',  -- 1am WAT daily
--   $$
--   select net.http_post(
--     url := 'https://<PROJECT>.supabase.co/functions/v1/meta-sync',
--     headers := '{"Authorization": "Bearer <ANON_KEY>"}'::jsonb
--   )
--   $$
-- );
