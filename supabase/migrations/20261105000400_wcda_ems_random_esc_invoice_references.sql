-- WCDA invoice references: non-sequential six-digit ESC identifiers.
create or replace function public.wcda_ems_next_reference()
returns text language plpgsql security definer set search_path = '' as $$
declare candidate text; attempts integer := 0;
begin
 loop
  candidate := 'ESC' || lpad((floor(random() * 900000)::integer + 100000)::text, 6, '0');
  if not exists (select 1 from public.wcda_ems_invoices where reference = candidate) then return candidate; end if;
  attempts := attempts + 1;
  if attempts >= 100 then raise exception 'Unable to allocate a unique invoice reference' using errcode='23505'; end if;
 end loop;
end; $$;
alter table public.wcda_ems_invoices alter column reference set default public.wcda_ems_next_reference();
