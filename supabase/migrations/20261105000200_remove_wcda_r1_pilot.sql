-- Remove the superseded internal R1 Paystack pilot invoice RPC.
-- Historical invoice rows remain for audit; the application no longer creates
-- or permits checkout for these legacy internal test invoices.
drop function if exists public.wcda_ems_prepare_r1_pilot(text, text, uuid);
