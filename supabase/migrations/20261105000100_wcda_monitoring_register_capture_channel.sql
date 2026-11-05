-- Allow WCDA staff to distinguish public-source monitoring-register leads
-- from applications received through the organiser portal or office intake.
alter table public.wcda_ems_events
  drop constraint if exists wcda_ems_capture_channel_check;

alter table public.wcda_ems_events
  add constraint wcda_ems_capture_channel_check
  check (
    capture_channel = any (
      array[
        'organiser_portal',
        'office_walk_in',
        'office_paper',
        'office_email',
        'staff_assisted',
        'monitoring_register'
      ]::text[]
    )
  );
