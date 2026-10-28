begin;
do $$
declare
  v_key text := 'source-guard-' || gen_random_uuid()::text;
begin
  insert into public.ufc_pick_prep_packages
    (source_event_key,source_url,event_id,event_name,event_kind,card_scope,starts_at,status,payload)
  values
    (v_key,'https://www.ufc.com/event/test',v_key,'Test','fight-night','main',
     now()+interval '7 days','review-needed',
     '{"spotlights":[{"source":"UFCStats"}],"verification_notes":["Research citation"]}'::jsonb);

  begin
    update public.ufc_pick_prep_packages
    set payload=jsonb_set(payload,'{spotlights,0,source}',to_jsonb('UFC.com research citation'::text))
    where source_event_key=v_key;
    raise exception 'Invalid source accepted';
  exception when check_violation then null;
  end;

  begin
    update public.ufc_pick_prep_packages
    set payload=jsonb_set(payload,'{spotlights,0}','{}'::jsonb)
    where source_event_key=v_key;
    raise exception 'Missing source accepted';
  exception when check_violation then null;
  end;

  if (select payload #>> '{spotlights,0,source}' from public.ufc_pick_prep_packages
      where source_event_key=v_key) <> 'UFCStats' then
    raise exception 'Rejected write changed the prep';
  end if;
  update public.ufc_pick_prep_packages
  set payload=jsonb_set(payload,'{verification_notes}','["New citation"]'::jsonb)
  where source_event_key=v_key;
end $$;
rollback;
