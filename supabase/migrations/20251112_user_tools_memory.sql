alter table if exists public.user_tools
  add column if not exists memory_mode text default 'none',
  add column if not exists memory_retention text default 'indefinite';

comment on column public.user_tools.memory_mode is 'Preferred memory scope for the tool (none, device, account).';
comment on column public.user_tools.memory_retention is 'Retention policy (indefinite, session, custom).';
