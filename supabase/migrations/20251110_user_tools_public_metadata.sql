alter table if exists public.user_tools
  add column if not exists public_summary text,
  add column if not exists model_provider text,
  add column if not exists model_name text;

comment on column public.user_tools.public_summary is 'Optional public-facing summary that can be shown on published/remix pages.';
comment on column public.user_tools.model_provider is 'AI provider used to generate the initial tool (e.g. openai, gemini).';
comment on column public.user_tools.model_name is 'Raw model identifier captured at generation time (e.g. gpt-4o-mini, gemini-2.5-flash).';
