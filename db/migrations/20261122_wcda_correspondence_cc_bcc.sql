-- WCDA Events correspondence: explicit To / CC / BCC recipients.
-- Existing records retain their original applicant/organiser recipient.
alter table public.wcda_ems_correspondence
  add column if not exists cc_emails text[] not null default '{}',
  add column if not exists bcc_emails text[] not null default '{}';

create or replace function public.wcda_ems_correspondence_action(
 p_action text,p_actor_id text,p_actor_email text,p_event_id uuid,
 p_message_id uuid,p_payload jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_row public.wcda_ems_correspondence%rowtype;
 v_event public.wcda_ems_events%rowtype;
 v_email text:=lower(btrim(coalesce(p_actor_email,'')));
 v_role text;
 v_recipient text;
 v_cc text[];
 v_bcc text[];
 v_status text;
 v_kind text;
begin
 if length(btrim(coalesce(p_actor_id,'')))<3 then raise exception 'Valid staff identity required' using errcode='42501'; end if;
 select role into v_role from public.wcda_ems_staff_access where email=v_email and active=true;
 if v_role is null then raise exception 'Active EMS appointment required' using errcode='42501'; end if;
 if p_action not in ('prepare','approve','claim','finish') then raise exception 'Unsupported correspondence action' using errcode='22023'; end if;
 if p_action='prepare' then
   if v_role not in ('registrar','manager','super_admin','executive','assessor','operations','compliance','finance','certificates') then
      raise exception 'This appointment cannot prepare external correspondence' using errcode='42501'; end if;
   select * into v_event from public.wcda_ems_events where id=p_event_id;
   if not found then raise exception 'Event does not exist' using errcode='22023'; end if;
   v_kind:=btrim(coalesce(p_payload->>'kind',''));
   if v_kind not in ('status_update','documents_requested','general','payment_notice')
    or length(btrim(coalesce(p_payload->>'subject',''))) not between 8 and 160
    or length(btrim(coalesce(p_payload->>'body',''))) not between 15 and 5000 then
      raise exception 'Complete the message kind, subject and body' using errcode='22023'; end if;
   v_recipient:=lower(btrim(coalesce(nullif(p_payload->>'recipient',''),nullif(btrim(v_event.applicant_contact_email),''),v_event.organiser_email,'')));
   if v_recipient !~ '^[^ @,;]+@[^ @,;]+\.[^ @,;]+$' then
      raise exception 'Enter a valid To recipient email address' using errcode='22023'; end if;
   select coalesce(array_agg(lower(btrim(x))),array[]::text[]) into v_cc
     from unnest(regexp_split_to_array(coalesce(p_payload->>'cc',''), '[,;[:space:]]+')) x where btrim(x)<>'';
   select coalesce(array_agg(lower(btrim(x))),array[]::text[]) into v_bcc
     from unnest(regexp_split_to_array(coalesce(p_payload->>'bcc',''), '[,;[:space:]]+')) x where btrim(x)<>'';
   if cardinality(v_cc)>20 or cardinality(v_bcc)>20
     or exists(select 1 from unnest(v_cc||v_bcc) x where x !~ '^[^ @,;]+@[^ @,;]+\.[^ @,;]+$')
     or (v_recipient=any(v_cc)) or (v_recipient=any(v_bcc))
     or exists(select 1 from unnest(v_cc) x group by x having count(*)>1)
     or exists(select 1 from unnest(v_bcc) x group by x having count(*)>1)
     or exists(select 1 from unnest(v_cc) x where x=any(v_bcc)) then
      raise exception 'CC/BCC must contain valid, unique email addresses (maximum 20 per field)' using errcode='22023'; end if;
   insert into public.wcda_ems_correspondence(event_id,kind,subject,body,recipient_email,cc_emails,bcc_emails,prepared_by_id,prepared_by_email)
   values(v_event.id,v_kind,btrim(p_payload->>'subject'),btrim(p_payload->>'body'),v_recipient,v_cc,v_bcc,p_actor_id,v_email)
   returning * into v_row;
 else
   select * into v_row from public.wcda_ems_correspondence where id=p_message_id for update;
   if not found then raise exception 'Correspondence record not found' using errcode='22023'; end if;
   if p_event_id is distinct from v_row.event_id then raise exception 'Case mismatch' using errcode='42501'; end if;
   if v_role not in ('manager','super_admin','executive') then raise exception 'Manager approval required' using errcode='42501'; end if;
   if p_action='approve' then
      if v_row.status<>'draft' then raise exception 'Only drafts can be approved' using errcode='22023'; end if;
      if v_row.prepared_by_id=p_actor_id or v_row.prepared_by_email=v_email then
        raise exception 'A different appointed manager must approve this message' using errcode='42501'; end if;
      update public.wcda_ems_correspondence set status='approved',approved_by_id=p_actor_id,
       approved_by_email=v_email,approved_at=now(),updated_at=now() where id=v_row.id returning * into v_row;
   elsif p_action='claim' then
      if v_row.status<>'approved' or v_row.approved_by_email is distinct from v_email then
        raise exception 'Only the approving manager may dispatch this message' using errcode='42501'; end if;
      update public.wcda_ems_correspondence set status='dispatching',dispatch_started_at=now(),
       dispatch_by_email=v_email,updated_at=now() where id=v_row.id returning * into v_row;
   elsif p_action='finish' then
      if v_row.status<>'dispatching' or v_row.dispatch_by_email is distinct from v_email then
        raise exception 'Message not owned by current dispatch' using errcode='42501'; end if;
      v_status:=p_payload->>'status';
      if v_status not in ('accepted','uncertain') then raise exception 'Invalid provider result' using errcode='22023'; end if;
      update public.wcda_ems_correspondence set status=v_status,
       accepted_at=case when v_status='accepted' then now() else null end,
       updated_at=now() where id=v_row.id returning * into v_row;
   end if;
 end if;
 insert into public.wcda_ems_audit_log(event_id,actor_id,actor_email,action,details)
 values(v_row.event_id,p_actor_id,v_email,'correspondence.'||p_action,
  jsonb_build_object('messageId',v_row.id,'status',v_row.status,'kind',v_row.kind,
   'to',v_row.recipient_email,'ccCount',cardinality(v_row.cc_emails),'bccCount',cardinality(v_row.bcc_emails)));
 return to_jsonb(v_row);
end;
$$;
revoke all on function public.wcda_ems_correspondence_action(text,text,text,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.wcda_ems_correspondence_action(text,text,text,uuid,uuid,jsonb) to service_role;
