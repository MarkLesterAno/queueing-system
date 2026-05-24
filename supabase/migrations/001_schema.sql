-- Organizations (tenants)
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz default now()
);

-- Users (admins and operators)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'operator')),
  created_at timestamptz default now()
);

-- Invitations for onboarding new tenants
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  token text unique not null,
  status text default 'pending',
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);

-- Offices per organization
create table if not exists offices (
  id text not null,
  org_id uuid references organizations(id) on delete cascade,
  name text not null,
  abbreviation text not null,
  prefix text not null,
  color text not null,
  counters int default 1,
  pin text not null,
  primary key (id, org_id)
);

-- Operator assignments
create table if not exists operators (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  email text not null,
  office_id text not null,
  pin text not null,
  created_at timestamptz default now()
);

-- Organization settings (theme, display, kiosk config)
create table if not exists org_settings (
  org_id uuid primary key references organizations(id) on delete cascade,
  settings jsonb default '{}'::jsonb
);

-- Indexes
create index if not exists idx_organizations_slug on organizations(slug);
create index if not exists idx_users_org_id on users(org_id);
create index if not exists idx_users_email on users(email);
create index if not exists idx_offices_org_id on offices(org_id);
create index if not exists idx_operators_org_id on operators(org_id);
create index if not exists idx_invitations_token on invitations(token);
