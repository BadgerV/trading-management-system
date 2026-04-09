-- Sales Agent Performance Management Schema (PostgreSQL / Supabase)
-- Normalized for multi-month tracking, agent ownership, and leaderboard queries.

-- =====================================================
-- 1) ENUM DEFINITIONS
-- =====================================================

create type app_role as enum ('admin', 'agent');
create type user_status as enum ('active', 'inactive');

create type sale_status as enum ('won', 'lost', 'pending');
create type activity_type as enum ('call', 'meeting', 'email', 'proposal', 'follow_up');

create type target_metric as enum ('revenue', 'closed_deals', 'activities_count');

-- =====================================================
-- 2) TABLES
-- =====================================================

-- users: application-level users
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role app_role not null,
  status user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_chk check (position('@' in email) > 1)
);

-- agents: agent profile/ownership fields separated from generic user identity
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  manager_user_id uuid,
  employee_code text unique,
  team_name text not null,
  territory text,
  hire_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agents_user_fk
    foreign key (user_id) references public.users(id) on delete cascade,
  constraint agents_manager_fk
    foreign key (manager_user_id) references public.users(id) on delete set null
);

-- sales: transactional sales events
create table public.sales (
  id bigserial primary key,
  agent_id uuid not null,
  customer_name text,
  amount numeric(14,2) not null check (amount >= 0),
  status sale_status not null,
  occurred_at date not null,
  closed_at date,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_agent_fk
    foreign key (agent_id) references public.agents(id) on delete restrict,
  constraint sales_created_by_fk
    foreign key (created_by) references public.users(id) on delete restrict,
  constraint sales_closed_date_chk
    check (closed_at is null or closed_at >= occurred_at)
);

-- activities: sales execution logs
create table public.activities (
  id bigserial primary key,
  agent_id uuid not null,
  activity_type activity_type not null,
  activity_date date not null,
  notes text,
  related_sale_id bigint,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_agent_fk
    foreign key (agent_id) references public.agents(id) on delete restrict,
  constraint activities_related_sale_fk
    foreign key (related_sale_id) references public.sales(id) on delete set null,
  constraint activities_created_by_fk
    foreign key (created_by) references public.users(id) on delete restrict
);

-- targets: monthly/period targets by agent and metric
create table public.targets (
  id bigserial primary key,
  agent_id uuid not null,
  metric target_metric not null,
  period_month date not null,
  target_value numeric(14,2) not null check (target_value >= 0),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint targets_agent_fk
    foreign key (agent_id) references public.agents(id) on delete cascade,
  constraint targets_created_by_fk
    foreign key (created_by) references public.users(id) on delete restrict,
  constraint targets_period_month_chk
    check (period_month = date_trunc('month', period_month)::date),
  constraint targets_unique_agent_metric_month
    unique (agent_id, metric, period_month)
);

-- monthly_metrics: pre-aggregated leaderboard-friendly metrics
-- Derived from sales/activities/targets per agent + month.
create table public.monthly_metrics (
  id bigserial primary key,
  agent_id uuid not null,
  period_month date not null,
  won_revenue numeric(14,2) not null default 0 check (won_revenue >= 0),
  won_deals_count integer not null default 0 check (won_deals_count >= 0),
  activities_count integer not null default 0 check (activities_count >= 0),
  quota_attainment_pct numeric(7,2),
  conversion_rate_pct numeric(7,2),
  refreshed_at timestamptz not null default now(),
  constraint monthly_metrics_agent_fk
    foreign key (agent_id) references public.agents(id) on delete cascade,
  constraint monthly_metrics_period_month_chk
    check (period_month = date_trunc('month', period_month)::date),
  constraint monthly_metrics_unique_agent_month
    unique (agent_id, period_month),
  constraint monthly_metrics_quota_pct_chk
    check (quota_attainment_pct is null or (quota_attainment_pct >= 0 and quota_attainment_pct <= 99999.99)),
  constraint monthly_metrics_conversion_pct_chk
    check (conversion_rate_pct is null or (conversion_rate_pct >= 0 and conversion_rate_pct <= 100))
);

-- =====================================================
-- 3) INDEXES
-- =====================================================

-- users / agents lookup
create index idx_users_role_status on public.users(role, status);
create index idx_agents_manager_user_id on public.agents(manager_user_id);
create index idx_agents_team_name on public.agents(team_name);

-- sales query patterns: agent + month + status
create index idx_sales_agent_occurred_at on public.sales(agent_id, occurred_at);
create index idx_sales_status_occurred_at on public.sales(status, occurred_at);

-- activities query patterns: agent + date + type
create index idx_activities_agent_date on public.activities(agent_id, activity_date);
create index idx_activities_type_date on public.activities(activity_type, activity_date);

-- targets and leaderboard lookups
create index idx_targets_period_metric on public.targets(period_month, metric);
create index idx_monthly_metrics_period_revenue on public.monthly_metrics(period_month, won_revenue desc);
create index idx_monthly_metrics_period_attainment on public.monthly_metrics(period_month, quota_attainment_pct desc);

-- =====================================================
-- 4) EXAMPLE SEED DATA
-- =====================================================

insert into public.users (id, email, full_name, role, status)
values
  ('00000000-0000-0000-0000-000000000001', 'admin@sales.internal', 'Admin User', 'admin', 'active'),
  ('00000000-0000-0000-0000-000000000101', 'alice.agent@sales.internal', 'Alice Agent', 'agent', 'active'),
  ('00000000-0000-0000-0000-000000000102', 'bob.agent@sales.internal', 'Bob Agent', 'agent', 'active');

insert into public.agents (id, user_id, manager_user_id, employee_code, team_name, territory, hire_date)
values
  ('10000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'A-101', 'North Team', 'North', '2025-01-15'),
  ('10000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'A-102', 'North Team', 'North', '2025-02-10');

insert into public.targets (agent_id, metric, period_month, target_value, created_by)
values
  ('10000000-0000-0000-0000-000000000101', 'revenue', '2026-03-01', 50000, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000101', 'closed_deals', '2026-03-01', 12, '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000102', 'revenue', '2026-03-01', 42000, '00000000-0000-0000-0000-000000000001');

insert into public.sales (agent_id, customer_name, amount, status, occurred_at, closed_at, created_by)
values
  ('10000000-0000-0000-0000-000000000101', 'Acme Corp', 12000, 'won', '2026-03-08', '2026-03-08', '00000000-0000-0000-0000-000000000101'),
  ('10000000-0000-0000-0000-000000000101', 'Globex', 8000, 'lost', '2026-03-12', '2026-03-12', '00000000-0000-0000-0000-000000000101'),
  ('10000000-0000-0000-0000-000000000102', 'Initech', 15000, 'won', '2026-03-18', '2026-03-18', '00000000-0000-0000-0000-000000000102');

insert into public.activities (agent_id, activity_type, activity_date, notes, created_by)
values
  ('10000000-0000-0000-0000-000000000101', 'call', '2026-03-07', 'Initial qualification call', '00000000-0000-0000-0000-000000000101'),
  ('10000000-0000-0000-0000-000000000101', 'proposal', '2026-03-08', 'Submitted proposal to Acme Corp', '00000000-0000-0000-0000-000000000101'),
  ('10000000-0000-0000-0000-000000000102', 'meeting', '2026-03-15', 'Demo with Initech stakeholders', '00000000-0000-0000-0000-000000000102');

insert into public.monthly_metrics (
  agent_id, period_month, won_revenue, won_deals_count, activities_count, quota_attainment_pct, conversion_rate_pct
)
values
  ('10000000-0000-0000-0000-000000000101', '2026-03-01', 12000, 1, 2, 24.00, 50.00),
  ('10000000-0000-0000-0000-000000000102', '2026-03-01', 15000, 1, 1, 35.71, 100.00);
