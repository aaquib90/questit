alter table if exists public.published_tools
  add column if not exists memory_mode text default 'none',
  add column if not exists memory_retention text default 'indefinite';

comment on column public.published_tools.memory_mode is 'Memory scope advertised on the share page (none, device, account).';
comment on column public.published_tools.memory_retention is 'Retention policy shown to viewers (indefinite, session, custom).';
