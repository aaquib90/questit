-- Seed helper for local/testing scenarios.
-- Insert a placeholder tool instance so self-test reports
-- (POST /api/selftest/report) pass the foreign key constraint.

insert into public.tool_instances (
  id,
  status,
  owner_ref,
  version,
  source_repo,
  license,
  created_at
) values (
  'tool-mhofnej7-o1sloinj',
  'active',
  'local-dev',
  '2025.11.05',
  null,
  'Unknown',
  now()
)
on conflict (id) do nothing;
