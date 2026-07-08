-- =============================================================================
-- GrowthAds — Database Schema (Part 1: Tables + Enums only)
-- Run BEFORE 002_policies.sql — this file creates all tables, FKs, and
-- constraints. RLS policies, triggers, and indexes are added in part 2.
--
-- This two-pass approach avoids a chicken-and-egg problem: organizations RLS
-- policies reference the users table, but users RLS references auth.users.
-- By splitting, we let Postgres resolve all cross-references in part 2.
--
-- Run via: Supabase Dashboard SQL Editor (recommended)
--       or:  Management API POST /v1/projects/{ref}/database/query
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- pg_cron + pgsodium are pre-installed on Supabase Cloud but we
-- create-if-not-exists as a safety net. Schema is omitted so Postgres places
-- each extension in its conventional location (pgsodium in `pgsodium`,
-- pg_cron in `extensions`, pgcrypto in `public`).
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "pgsodium";
create extension if not exists "pg_cron";

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

-- Authenticated users query this view (no encrypted_token column). Only
-- service_role queries the base ad_accounts table directly to avoid leaking
-- OAuth tokens.
create view ad_accounts_public as
  select id, organization_id, platform, platform_account_id,
         platform_account_name, is_active, token_expires_at, connected_at
  from ad_accounts;

alter view ad_accounts_public set (security_invoker = true);

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
