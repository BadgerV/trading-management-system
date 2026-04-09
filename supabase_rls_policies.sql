-- Supabase Row Level Security (RLS) Policies
-- Scope: users, agents, sales, activities, targets, monthly_metrics

-- =====================================================
-- 1) AUTHENTICATION ASSUMPTIONS
-- =====================================================
-- A1) auth.uid() returns the authenticated user's UUID.
-- A2) public.users.id is the same UUID as auth.uid() (1:1 mapping).
-- A3) public.users.role = 'admin' grants full-table access.
-- A4) public.users.role = 'agent' is restricted to owned rows.
-- A5) Service role bypasses RLS automatically in Supabase.

-- =====================================================
-- 2) OWNERSHIP MODEL
-- =====================================================
-- users: owned by users.id = auth.uid()
-- agents: owned by agents.user_id = auth.uid()
-- sales/activities/targets/monthly_metrics: owned by agent_id that maps to auth.uid() via public.agents.user_id
-- created_by fields must equal auth.uid() for agent-created writes.

-- =====================================================
-- 3) HELPER FUNCTIONS (used by policies)
-- =====================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
      and u.status = 'active'
  );
$$;

create or replace function public.current_agent_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select a.id
  from public.agents a
  where a.user_id = auth.uid();
$$;

-- =====================================================
-- 4) ENABLE + FORCE RLS
-- =====================================================

alter table public.users enable row level security;
alter table public.users force row level security;

alter table public.agents enable row level security;
alter table public.agents force row level security;

alter table public.sales enable row level security;
alter table public.sales force row level security;

alter table public.activities enable row level security;
alter table public.activities force row level security;

alter table public.targets enable row level security;
alter table public.targets force row level security;

alter table public.monthly_metrics enable row level security;
alter table public.monthly_metrics force row level security;

-- =====================================================
-- 5) POLICIES: users
-- =====================================================

drop policy if exists users_select_admin_or_self on public.users;
create policy users_select_admin_or_self
on public.users
for select
using (
  public.is_admin()
  or id = auth.uid()
);

drop policy if exists users_insert_admin_only on public.users;
create policy users_insert_admin_only
on public.users
for insert
with check (
  public.is_admin()
);

drop policy if exists users_update_admin_or_self on public.users;
create policy users_update_admin_or_self
on public.users
for update
using (
  public.is_admin()
  or id = auth.uid()
)
with check (
  public.is_admin()
  or id = auth.uid()
);

drop policy if exists users_delete_admin_only on public.users;
create policy users_delete_admin_only
on public.users
for delete
using (
  public.is_admin()
);

-- =====================================================
-- 6) POLICIES: agents
-- =====================================================

drop policy if exists agents_select_admin_or_self on public.agents;
create policy agents_select_admin_or_self
on public.agents
for select
using (
  public.is_admin()
  or user_id = auth.uid()
);

drop policy if exists agents_insert_admin_only on public.agents;
create policy agents_insert_admin_only
on public.agents
for insert
with check (
  public.is_admin()
);

drop policy if exists agents_update_admin_or_self on public.agents;
create policy agents_update_admin_or_self
on public.agents
for update
using (
  public.is_admin()
  or user_id = auth.uid()
)
with check (
  public.is_admin()
  or user_id = auth.uid()
);

drop policy if exists agents_delete_admin_only on public.agents;
create policy agents_delete_admin_only
on public.agents
for delete
using (
  public.is_admin()
);

-- =====================================================
-- 7) POLICIES: sales
-- =====================================================

drop policy if exists sales_select_admin_or_owner on public.sales;
create policy sales_select_admin_or_owner
on public.sales
for select
using (
  public.is_admin()
  or agent_id = public.current_agent_id()
);

drop policy if exists sales_insert_admin_or_owner on public.sales;
create policy sales_insert_admin_or_owner
on public.sales
for insert
with check (
  public.is_admin()
  or (
    agent_id = public.current_agent_id()
    and created_by = auth.uid()
  )
);

drop policy if exists sales_update_admin_or_owner on public.sales;
create policy sales_update_admin_or_owner
on public.sales
for update
using (
  public.is_admin()
  or agent_id = public.current_agent_id()
)
with check (
  public.is_admin()
  or (
    agent_id = public.current_agent_id()
    and created_by = auth.uid()
  )
);

drop policy if exists sales_delete_admin_only on public.sales;
create policy sales_delete_admin_only
on public.sales
for delete
using (
  public.is_admin()
);

-- =====================================================
-- 8) POLICIES: activities
-- =====================================================

drop policy if exists activities_select_admin_or_owner on public.activities;
create policy activities_select_admin_or_owner
on public.activities
for select
using (
  public.is_admin()
  or agent_id = public.current_agent_id()
);

drop policy if exists activities_insert_admin_or_owner on public.activities;
create policy activities_insert_admin_or_owner
on public.activities
for insert
with check (
  public.is_admin()
  or (
    agent_id = public.current_agent_id()
    and created_by = auth.uid()
  )
);

drop policy if exists activities_update_admin_or_owner on public.activities;
create policy activities_update_admin_or_owner
on public.activities
for update
using (
  public.is_admin()
  or agent_id = public.current_agent_id()
)
with check (
  public.is_admin()
  or (
    agent_id = public.current_agent_id()
    and created_by = auth.uid()
  )
);

drop policy if exists activities_delete_admin_only on public.activities;
create policy activities_delete_admin_only
on public.activities
for delete
using (
  public.is_admin()
);

-- =====================================================
-- 9) POLICIES: targets
-- =====================================================

drop policy if exists targets_select_admin_or_owner on public.targets;
create policy targets_select_admin_or_owner
on public.targets
for select
using (
  public.is_admin()
  or agent_id = public.current_agent_id()
);

drop policy if exists targets_insert_admin_only on public.targets;
create policy targets_insert_admin_only
on public.targets
for insert
with check (
  public.is_admin()
);

drop policy if exists targets_update_admin_only on public.targets;
create policy targets_update_admin_only
on public.targets
for update
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

drop policy if exists targets_delete_admin_only on public.targets;
create policy targets_delete_admin_only
on public.targets
for delete
using (
  public.is_admin()
);

-- =====================================================
-- 10) POLICIES: monthly_metrics
-- =====================================================

drop policy if exists monthly_metrics_select_admin_or_owner on public.monthly_metrics;
create policy monthly_metrics_select_admin_or_owner
on public.monthly_metrics
for select
using (
  public.is_admin()
  or agent_id = public.current_agent_id()
);

drop policy if exists monthly_metrics_insert_admin_only on public.monthly_metrics;
create policy monthly_metrics_insert_admin_only
on public.monthly_metrics
for insert
with check (
  public.is_admin()
);

drop policy if exists monthly_metrics_update_admin_only on public.monthly_metrics;
create policy monthly_metrics_update_admin_only
on public.monthly_metrics
for update
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

drop policy if exists monthly_metrics_delete_admin_only on public.monthly_metrics;
create policy monthly_metrics_delete_admin_only
on public.monthly_metrics
for delete
using (
  public.is_admin()
);
