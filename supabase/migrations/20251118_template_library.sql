create table if not exists public.template_library (
  id uuid primary key default gen_random_uuid(),
  template_key text unique,
  slug text unique,
  name text not null,
  summary text,
  category text,
  category_description text,
  tags text[] default '{}',
  audience text[] default '{}',
  quick_tweaks text[] default '{}',
  descriptor text,
  prompt text,
  html text,
  css text,
  js text,
  preview_html text,
  preview_css text,
  preview_js text,
  hero_image text,
  popularity integer not null default 0,
  model_provider text,
  model_name text,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.template_library is 'Questit template catalog with pre-rendered HTML/CSS/JS bundles.';
comment on column public.template_library.template_key is 'Deterministic key derived from source CSV to make re-imports idempotent.';
comment on column public.template_library.slug is 'Human-friendly slug for URLs.';
comment on column public.template_library.preview_html is 'Optional lightweight preview markup; falls back to html.';

create index if not exists template_library_status_idx on public.template_library(status);
create index if not exists template_library_category_idx on public.template_library(category);

create or replace function public.template_library_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists template_library_updated_at on public.template_library;
create trigger template_library_updated_at
before update on public.template_library
for each row execute procedure public.template_library_set_updated_at();

alter table public.template_library enable row level security;

create policy "Templates are public" on public.template_library
  for select using (status = 'published');

create policy "Service role manages templates" on public.template_library
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
