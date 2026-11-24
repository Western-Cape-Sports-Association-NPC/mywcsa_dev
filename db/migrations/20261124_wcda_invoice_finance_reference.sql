-- WCDA invoice references use the Finance Reference format printed on certificates.
-- Existing invoice references are intentionally preserved.
create sequence if not exists public.wcda_ems_finance_reference_seq
  as integer minvalue 100000 maxvalue 999999 start with 100000 no cycle;
alter table public.wcda_ems_invoices
  alter column reference set default ('ESC' || lpad(nextval('public.wcda_ems_finance_reference_seq')::text, 6, '0'));
