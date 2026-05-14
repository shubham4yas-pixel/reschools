alter table public.schools
add column if not exists settings jsonb not null default '{}'::jsonb;

comment on column public.schools.settings is
'Per-school feature customisation flags, for example {"profile_picture": true, "transport_module": false}.';
