-- Tool memory storage for Questit

create table if not exists public.tool_memories (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null,
  user_id uuid,
  session_id text,
  memory_key text not null,
  memory_value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tool_memories is 'Per-tool memory values persisted for device sessions or authenticated users.';
comment on column public.tool_memories.session_id is 'Opaque identifier for device-scoped memory (stored client-side).';
comment on column public.tool_memories.memory_key is 'Creator-defined key (e.g., settings, history) within a tool.';

create index if not exists tool_memories_tool_user_idx
  on public.tool_memories (tool_id, user_id, memory_key);

create index if not exists tool_memories_tool_session_idx
  on public.tool_memories (tool_id, session_id);

alter table public.tool_memories enable row level security;

-- For now we rely on service-role mediated access from Workers.

create policy "Service role full access"
  on public.tool_memories
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
