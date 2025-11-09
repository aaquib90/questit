create table if not exists public.user_tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  prompt text,
  title text,
  theme text,
  color_mode text,
  html text,
  css text,
  js text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_tools_user_id_idx on public.user_tools(user_id);

alter table public.user_tools enable row level security;

create policy "Users can manage their own tools" on public.user_tools
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
