begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_member uuid := extensions.gen_random_uuid();
  v_receipt jsonb;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values (
    v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'fight-night-espn-lock-member@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','ESPN LOCK MEMBER','historical_unclaimed',true)
  );
  perform public.register_unclaimed_pin_profile(v_member,'ESPN Lock Member','EL');

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,prelims_starts_at,locks_at,season,status
  ) values (
    'fight-night-espn-lock-test','UFC Fight Night ESPN Lock Test','Estimate Red vs. Estimate Blue',
    'Test Arena','Dallas, Texas',now()+interval '6 hours',now()+interval '3 hours',
    now()+interval '3 hours',2199,'upcoming'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,locks_at
  ) values
    ('fight-night-espn-lock-test','espn-estimate-bout',1,'Lightweight',
      'estimate-red','Estimate Red','estimate-blue','Estimate Blue',now()-interval '5 minutes'),
    ('fight-night-espn-lock-test','legacy-deadline-bout',2,'Welterweight',
      'legacy-red','Legacy Red','legacy-blue','Legacy Blue',now()-interval '5 minutes');

  -- Once ESPN is attached, the listed UFC time is schedule guidance only. A
  -- scheduled fight remains editable even after that estimate has passed.
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-espn-lock-test',
    jsonb_build_array(jsonb_build_object(
      'bout_id','espn-estimate-bout',
      'state','scheduled',
      'provider','espn',
      'source_event_id','espn-lock-event',
      'source_competition_id','espn-lock-bout',
      'winner_fighter_slug',null,
      'observed_at',clock_timestamp()
    ))
  );
  if coalesce((v_receipt->>'bouts_updated')::integer,0) <> 1 then
    raise exception 'scheduled ESPN attachment was not persisted';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('fight-night-espn-lock-test','espn-estimate-bout','estimate-red');

  if not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member
      and event_id='fight-night-espn-lock-test'
      and bout_id='espn-estimate-bout'
      and fighter_slug='estimate-red'
  ) then
    raise exception 'elapsed UFC estimate incorrectly locked an ESPN-scheduled fight';
  end if;

  -- A fight without a trusted provider attachment keeps the legacy hard deadline
  -- fallback rather than becoming unbounded-open on provider mismatch.
  begin
    perform public.save_my_event_pick('fight-night-espn-lock-test','legacy-deadline-bout','legacy-red');
    raise exception 'unattached elapsed deadline did not retain the safety lock';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;

  -- The same ESPN-attached fight locks as soon as the trusted state advances live.
  perform set_config('request.jwt.claim.role','service_role',true);
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-espn-lock-test',
    jsonb_build_array(jsonb_build_object(
      'bout_id','espn-estimate-bout',
      'state','live',
      'provider','espn',
      'source_event_id','espn-lock-event',
      'source_competition_id','espn-lock-bout',
      'winner_fighter_slug',null,
      'observed_at',clock_timestamp()+interval '1 second'
    ))
  );
  if coalesce((v_receipt->>'bouts_updated')::integer,0) <> 1 then
    raise exception 'ESPN live transition was not persisted';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.save_my_event_pick('fight-night-espn-lock-test','espn-estimate-bout','estimate-blue');
    raise exception 'member edited after ESPN marked the fight live';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;

  if (select status from public.pick_events where event_id='fight-night-espn-lock-test') <> 'upcoming' then
    raise exception 'per-fight ESPN authority changed the event lifecycle';
  end if;
end;
$$;

rollback;
