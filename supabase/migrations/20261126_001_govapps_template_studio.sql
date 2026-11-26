begin;
create table if not exists public.govapps_document_templates (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(btrim(name)) between 3 and 140),
 category text not null default 'General' check (char_length(btrim(category)) between 2 and 60),
 description text not null default '' check (char_length(description) <= 500),
 content_html text not null default '<p></p>' check (char_length(content_html) <= 200000),
 fields jsonb not null default '[]'::jsonb check (jsonb_typeof(fields) = 'array'),
 status text not null default 'draft' check (status in ('draft','published','archived')),
 version integer not null default 1 check (version > 0),
 created_by text not null, updated_by text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists govapps_document_templates_status_updated_idx on public.govapps_document_templates(status,updated_at desc);
alter table public.govapps_document_templates enable row level security;
revoke all on public.govapps_document_templates from anon,authenticated;
grant select,insert,update,delete on public.govapps_document_templates to service_role;
create table if not exists public.govapps_brand_assets (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(btrim(name)) between 2 and 120),
 asset_type text not null check (asset_type in ('primary_logo','secondary_logo','letterhead','signature','seal','icon','other')),
 file_name text not null, storage_path text not null unique,
 mime_type text not null check (mime_type in ('image/png','image/jpeg','image/webp')),
 size_bytes bigint not null check (size_bytes between 1 and 5242880),
 is_default boolean not null default false, uploaded_by text not null, created_at timestamptz not null default now()
);
create index if not exists govapps_brand_assets_type_idx on public.govapps_brand_assets(asset_type,created_at desc);
alter table public.govapps_brand_assets enable row level security;
revoke all on public.govapps_brand_assets from anon,authenticated;
grant select,insert,update,delete on public.govapps_brand_assets to service_role;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('govapps-brand-assets','govapps-brand-assets',false,5242880,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
commit;