create table if not exists public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  prompt_length integer,
  prompt_index integer,
  session_entry_id text,
  user_id uuid,
  user_plan text,
  request_kind text,
  is_retry boolean default false,
  created_at timestamptz not null default now()
);

comment on table public.ai_usage_events is 'Server-side record of AI token usage per tool generation.';

create index if not exists ai_usage_events_created_at_idx on public.ai_usage_events(created_at);

alter table public.ai_usage_events enable row level security;

create policy "Service role manages usage events"
  on public.ai_usage_events
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
