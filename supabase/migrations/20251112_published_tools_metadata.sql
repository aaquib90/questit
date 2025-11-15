alter table if exists public.published_tools
  add column if not exists theme text,
  add column if not exists color_mode text,
  add column if not exists model_provider text,
  add column if not exists model_name text;

comment on column public.published_tools.theme is 'Theme key applied when rendering the published tool.';
comment on column public.published_tools.color_mode is 'Preferred color mode (light, dark, or system) for the published tool.';
comment on column public.published_tools.model_provider is 'AI provider used to generate the tool.';
comment on column public.published_tools.model_name is 'Model identifier captured at generation time.';
