-- =============================================================================
-- GrowthAds — Database Schema (Part 2: RLS + Triggers + Indexes)
-- Run AFTER 001_schema.sql — this is where the cross-table RLS policies,
-- the on-signup trigger, and all performance indexes live.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- RLS: enable on every multi-tenant table
-- ---------------------------------------------------------------------------
alter table organizations      enable row level security;
alter table users              enable row level security;
alter table subscriptions      enable row level security;
alter table ad_accounts        enable row level security;
alter table campaigns          enable row level security;
alter table campaign_metrics   enable row level security;
alter table recommendations    enable row level security;
alter table reports            enable row level security;

-- ---------------------------------------------------------------------------
-- RLS policies: tenant isolation via users.organization_id
-- ---------------------------------------------------------------------------

-- organizations — only your own
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

-- users — own record only
create policy "Users can read own record"
  on users for select
  using (id = auth.uid());

create policy "Users can update own record"
  on users for update
  using (id = auth.uid());

create policy "Users can insert own record (signup)"
  on users for insert
  with check (id = auth.uid());

-- subscriptions — via org
create policy "Users can read own org subscription"
  on subscriptions for select
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  );

-- ad_accounts — insert/update via org, all SELECTs go through
-- ad_accounts_public view only (no SELECT policy on base table)
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

create policy "Users can delete their own ad_accounts"
  on ad_accounts for delete
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  );

-- campaigns — full CRUD scoped to org
create policy "Tenant isolation on campaigns"
  on campaigns for all
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  )
  with check (
    organization_id = (select organization_id from users where id = auth.uid())
  );

-- campaign_metrics — read via parent campaign's org
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

create policy "Tenant isolation on campaign_metrics write"
  on campaign_metrics for all
  using (
    campaign_id in (
      select id from campaigns
      where organization_id = (
        select organization_id from users where id = auth.uid()
      )
    )
  )
  with check (
    campaign_id in (
      select id from campaigns
      where organization_id = (
        select organization_id from users where id = auth.uid()
      )
    )
  );

-- recommendations
create policy "Tenant isolation on recommendations"
  on recommendations for all
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  )
  with check (
    organization_id = (select organization_id from users where id = auth.uid())
  );

-- reports
create policy "Tenant isolation on reports"
  on reports for all
  using (
    organization_id = (select organization_id from users where id = auth.uid())
  )
  with check (
    organization_id = (select organization_id from users where id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Trigger: auto-create public.users row when someone signs up via auth.users
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'User')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Indexes — every foreign key + the date column on metrics
-- ---------------------------------------------------------------------------
create index idx_users_org on users (organization_id);
create index idx_subscriptions_org on subscriptions (organization_id);
create index idx_ad_accounts_org on ad_accounts (organization_id);
create index idx_ad_accounts_external on ad_accounts (platform, platform_account_id);
create index idx_campaigns_org on campaigns (organization_id);
create index idx_campaigns_external on campaigns (external_id);
create index idx_metrics_campaign on campaign_metrics (campaign_id);
create index idx_metrics_date on campaign_metrics (date);
create index idx_recs_org on recommendations (organization_id);
create index idx_reports_org on reports (organization_id);

-- ---------------------------------------------------------------------------
-- pg_cron: daily Meta-sync job (uncomment once Edge Function is deployed)
-- ---------------------------------------------------------------------------
--
-- select cron.schedule(
--   'meta-daily-sync',
--   '0 1 * * *',  -- 1am WAT daily
--   $$
--   select net.http_post(
--     url := 'https://dyfeolrotkjmeauiknbx.supabase.co/functions/v1/meta-sync',
--     headers := '{"Authorization": "Bearer <ANON_KEY>"}'::jsonb
--   )
--   $$
-- );
