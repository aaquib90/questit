-- RLS hardening for core tables
-- Adds ownership columns and tightens access policies

-- tool_templates: add owner and RLS
alter table if exists public.tool_templates
  add column if not exists owner_id uuid;

comment on column public.tool_templates.owner_id is 'Owner of the template (nullable for system templates).';

alter table public.tool_templates enable row level security;

drop policy if exists "Public can read templates" on public.tool_templates;
create policy "Public can read templates"
  on public.tool_templates
  for select
  using (true);

drop policy if exists "Owners can manage templates" on public.tool_templates;
create policy "Owners can manage templates"
  on public.tool_templates
  for all
  using (auth.uid() = owner_id or owner_id is null)
  with check (auth.uid() = owner_id or owner_id is null);

-- tool_instances: add owner and RLS
alter table if exists public.tool_instances
  add column if not exists owner_id uuid;

comment on column public.tool_instances.owner_id is 'Owner of this tool instance.';

alter table public.tool_instances enable row level security;

drop policy if exists "Owners can manage instances" on public.tool_instances;
create policy "Owners can manage instances"
  on public.tool_instances
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- tool_data: tie access to owning instance
alter table public.tool_data enable row level security;

drop policy if exists "Owner can read tool data" on public.tool_data;
create policy "Owner can read tool data"
  on public.tool_data
  for select
  using (
    exists (
      select 1 from public.tool_instances i
      where i.id = tool_data.instance_id
        and i.owner_id = auth.uid()
    )
  );

drop policy if exists "Owner can modify tool data" on public.tool_data;
create policy "Owner can modify tool data"
  on public.tool_data
  for all
  using (
    exists (
      select 1 from public.tool_instances i
      where i.id = tool_data.instance_id
        and i.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tool_instances i
      where i.id = tool_data.instance_id
        and i.owner_id = auth.uid()
    )
  );

-- scope_gate_decisions: restrict to service role
alter table public.scope_gate_decisions enable row level security;

drop policy if exists "Service role full access (scope gate)" on public.scope_gate_decisions;
create policy "Service role full access (scope gate)"
  on public.scope_gate_decisions
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- tool_selftest_results: service role insert, owner read
alter table public.tool_selftest_results enable row level security;

drop policy if exists "Service role can insert selftests" on public.tool_selftest_results;
create policy "Service role can insert selftests"
  on public.tool_selftest_results
  for insert
  to public
  with check (auth.role() = 'service_role');

drop policy if exists "Owners can read selftests" on public.tool_selftest_results;
create policy "Owners can read selftests"
  on public.tool_selftest_results
  for select
  using (
    exists (
      select 1
      from public.tool_instances i
      where i.id = tool_selftest_results.instance_id
        and i.owner_id = auth.uid()
    )
  );


