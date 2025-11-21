alter table if exists public.template_library
  add column if not exists descriptor text;
