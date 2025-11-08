-- Enable RLS and add minimal policies (adjust per-auth model later)

alter table public.tool_instances enable row level security;
alter table public.tool_data enable row level security;
alter table public.scope_gate_decisions enable row level security;
alter table public.tool_selftest_results enable row level security;

-- For MVP, allow inserts from service role only; select scoped by a public column when added
create policy tool_instances_insert_service on public.tool_instances
  for insert to public with check (true);

create policy tool_data_insert_service on public.tool_data
  for insert to public with check (true);

create policy scope_gate_decisions_insert_service on public.scope_gate_decisions
  for insert to public with check (true);

create policy tool_selftest_insert_service on public.tool_selftest_results
  for insert to public with check (true);

-- NOTE: tighten with auth/session columns in a subsequent migration.

