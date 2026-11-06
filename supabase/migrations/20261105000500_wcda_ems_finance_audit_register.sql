create table if not exists public.wcda_ems_finance_audit (
 id uuid primary key default gen_random_uuid(),
 entity_type text not null check(entity_type in ('catalogue','quotation','invoice')),
 entity_id uuid not null,
 event_id uuid,
 action text not null,
 actor_email text not null,
 reason text,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists wcda_ems_finance_audit_entity_idx on public.wcda_ems_finance_audit(entity_type,entity_id,created_at desc);
create index if not exists wcda_ems_finance_audit_actor_idx on public.wcda_ems_finance_audit(actor_email,created_at desc);
alter table public.wcda_ems_finance_audit enable row level security;
drop policy if exists wcda_ems_finance_audit_service_role on public.wcda_ems_finance_audit;
create policy wcda_ems_finance_audit_service_role on public.wcda_ems_finance_audit for all to service_role using (true) with check (true);
