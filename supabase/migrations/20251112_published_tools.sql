-- Published tools metadata for standalone viewer

create table if not exists public.published_tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  tool_id uuid not null,
  owner_id uuid not null,
  title text not null,
  summary text,
  html text,
  css text,
  js text,
  visibility text not null default 'public', -- public | private | passphrase
  passphrase_hash text,
  tags text[],
  view_count bigint not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.published_tools is 'Immutable bundle metadata for published Questit tools.';
comment on column public.published_tools.slug is 'Stable slug used for /tools/:slug route.';
comment on column public.published_tools.passphrase_hash is 'Optional hashed passphrase required for semi-private sharing.';
comment on column public.published_tools.tags is 'Optional tags shown on the Tool Viewer hero.';

create table if not exists public.tool_views (
  id bigserial primary key,
  published_tool_id uuid not null references public.published_tools(id) on delete cascade,
  viewer_id uuid,
  session_id text,
  user_agent text,
  view_date date not null default current_date,
  created_at timestamptz not null default now()
);

comment on table public.tool_views is 'Optional per-view logging for analytics rollups.';

create index if not exists tool_views_published_tool_id_view_date_idx
  on public.tool_views (published_tool_id, view_date);

alter table public.published_tools enable row level security;
alter table public.tool_views enable row level security;

-- Owners can manage their own published tools; public read enabled via policy tied to visibility.

create policy "Owners can manage published tools"
  on public.published_tools
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Public can read visible published tools"
  on public.published_tools
  for select
  using (
    visibility = 'public'
    or (visibility = 'private' and auth.uid() = owner_id)
  );

create policy "Passphrase gated published tools"
  on public.published_tools
  for select
  using (
    visibility = 'passphrase'
    and coalesce(current_setting('request.jwt.claim.passphrase_ok', true), 'false') = 'true'
  );

-- Allow service role to log view analytics

create policy "Service role can insert tool views"
  on public.tool_views
  for insert
  to public
  with check (true);

create policy "Owners can read tool views"
  on public.tool_views
  for select
  using (
    exists (
      select 1
      from public.published_tools pt
      where pt.id = tool_views.published_tool_id
        and pt.owner_id = auth.uid()
    )
  );
