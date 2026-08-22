begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_control jsonb;
  v_receipt jsonb;
  v_scheduled text;
  v_live text;
  v_final text;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values (
    v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'fight-night-presentation-owner@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','FIGHT NIGHT PRESENTATION OWNER','historical_unclaimed',true)
  );
  perform public.register_unclaimed_pin_profile(v_owner,'FIGHT NIGHT PRESENTATION OWNER','FP');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,prelims_starts_at,locks_at,season,status
  ) values (
    'fight-night-presentation-test','UFC Fight Night Presentation Test','Presentation Red vs. Presentation Blue',
    'Test Arena','Dallas, Texas',now()+interval '6 hours',now()+interval '3 hours',
    now()+interval '3 hours',2199,'upcoming'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,locks_at
  ) values
    ('fight-night-presentation-test','presentation-scheduled',1,'Lightweight',
      'scheduled-red','Scheduled Red','scheduled-blue','Scheduled Blue',now()+interval '4 hours'),
    ('fight-night-presentation-test','presentation-live',2,'Welterweight',
      'live-red','Live Red','live-blue','Live Blue',now()+interval '4 hours'),
    ('fight-night-presentation-test','presentation-final',3,'Middleweight',
      'final-red','Final Red','final-blue','Final Blue',now()+interval '4 hours');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_control := public.get_pick_control_event('fight-night-presentation-test');
  if v_control is null then raise exception 'Fight Night control payload was not returned'; end if;
  if exists (
    select 1
    from jsonb_array_elements(v_control->'bouts') item
    where item->>'live_status' <> 'scheduled'
  ) then
    raise exception 'new Fight Night bouts did not project scheduled state';
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-presentation-test',
    jsonb_build_array(
      jsonb_build_object(
        'bout_id','presentation-live',
        'state','live',
        'provider','espn',
        'source_event_id','espn-presentation-event',
        'source_competition_id','espn-presentation-live',
        'winner_fighter_slug',null,
        'observed_at',clock_timestamp()
      ),
      jsonb_build_object(
        'bout_id','presentation-final',
        'state','final',
        'provider','espn',
        'source_event_id','espn-presentation-event',
        'source_competition_id','espn-presentation-final',
        'winner_fighter_slug',null,
        'observed_at',clock_timestamp()
      )
    )
  );
  if coalesce((v_receipt->>'bouts_updated')::integer,0) <> 2 then
    raise exception 'provider presentation states were not persisted';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_control := public.get_pick_control_event('fight-night-presentation-test');

  select item->>'live_status' into v_scheduled
  from jsonb_array_elements(v_control->'bouts') item
  where item->>'bout_id' = 'presentation-scheduled';
  select item->>'live_status' into v_live
  from jsonb_array_elements(v_control->'bouts') item
  where item->>'bout_id' = 'presentation-live';
  select item->>'live_status' into v_final
  from jsonb_array_elements(v_control->'bouts') item
  where item->>'bout_id' = 'presentation-final';

  if v_scheduled <> 'scheduled' or v_live <> 'live' or v_final <> 'final' then
    raise exception 'control payload did not project scheduled/live/final states: %, %, %',
      v_scheduled, v_live, v_final;
  end if;
  if v_control->>'status' <> 'upcoming' then
    raise exception 'Fight Night presentation changed the event lifecycle';
  end if;
  if (select result_status from public.pick_bouts
      where event_id='fight-night-presentation-test' and bout_id='presentation-final') <> 'pending' then
    raise exception 'unresolved final presentation invented an official result';
  end if;
end;
$$;

rollback;
