-- EMS references must always use exactly five random digits, with no zero padding.
create or replace function public.wcda_ems_random_case_number(p_year integer)
returns bigint
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_candidate bigint;
  v_attempt integer := 0;
begin
  if p_year < 2026 or p_year > 2200 then
    raise exception 'Invalid EMS reference year' using errcode='22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('wcda-ems-case-reference-' || p_year::text));

  loop
    -- 10,000 through 99,999 inclusive: exactly five digits, never padded.
    v_candidate := floor(random() * 90000)::bigint + 10000;

    if not exists (
      select 1
      from public.wcda_ems_events
      where sequence_year = p_year
        and sequence_number = v_candidate
    ) then
      return v_candidate;
    end if;

    v_attempt := v_attempt + 1;
    if v_attempt >= 100 then
      raise exception 'Unable to allocate a unique EMS case reference' using errcode='23505';
    end if;
  end loop;
end;
$function$;
