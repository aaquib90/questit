-- Supabase schema for Questit

create table if not exists public.tool_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  license text,
  repo_url text,
  created_at timestamptz not null default now(),
  json_spec jsonb
);

create table if not exists public.tool_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.tool_templates(id) on delete set null,
  owner_ref text,
  status text default 'active',
  limits jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  version text,
  source_repo text,
  license text
);

create table if not exists public.tool_data (
  instance_id uuid references public.tool_instances(id) on delete cascade,
  key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  primary key (instance_id, key)
);

create table if not exists public.scope_gate_decisions (
  id uuid primary key default gen_random_uuid(),
  prompt_hash text not null,
  decision text not null,
  reasons jsonb,
  metrics jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tool_selftest_results (
  instance_id uuid references public.tool_instances(id) on delete cascade,
  pass boolean not null,
  details jsonb,
  run_at timestamptz not null default now()
);

-- RLS placeholders (enable and add policies as needed)
-- alter table public.tool_templates enable row level security;
-- alter table public.tool_instances enable row level security;
-- alter table public.tool_data enable row level security;
-- alter table public.scope_gate_decisions enable row level security;
-- alter table public.tool_selftest_results enable row level security;


