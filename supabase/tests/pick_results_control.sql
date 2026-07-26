begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  control_event jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'pick-control-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CONTROL OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'pick-control-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CONTROL MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'Control Owner','CO');
  perform public.register_unclaimed_pin_profile(v_member_id,'Control Member','CM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status)
  values('pick-results-control-test','UFC Control Test','Red vs. Blue','Test Arena','Dallas, Texas',
    now()+interval '1 hour',now()-interval '1 minute',2199,'upcoming');

  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name)
  values
    ('pick-results-control-test','control-main',1,'Lightweight','control-red','Control Red','control-blue','Control Blue'),
    ('pick-results-control-test','control-co-main',2,'Welterweight','second-red','Second Red','second-blue','Second Blue');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.record_official_pick_bout_result('pick-results-control-test','control-main','red_win');
    raise exception 'non-owner recorded an official result';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  begin
    perform public.get_pick_control_event();
    raise exception 'non-owner loaded Fight Night Control';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  control_event := public.get_pick_control_event();
  if control_event #>> '{event_id}' <> 'pick-results-control-test'
    or control_event #>> '{status}' <> 'upcoming'
    or control_event #>> '{can_lock}' <> 'true' then
    raise exception 'owner control projection is incorrect before lock: %',control_event;
  end if;

  perform public.transition_pick_event('pick-results-control-test','locked');
  if (select status from public.pick_events where event_id='pick-results-control-test') <> 'locked' then
    raise exception 'owner could not lock the event';
  end if;

  perform public.record_official_pick_bout_result('pick-results-control-test','control-main','red_win');
  if (select result_status from public.pick_bouts where event_id='pick-results-control-test' and bout_id='control-main') <> 'red_win' then
    raise exception 'owner could not record the result';
  end if;

  control_event := public.get_pick_control_event();
  if control_event #>> '{bouts,0,result_status}' <> 'red_win'
    or control_event #>> '{can_complete}' <> 'false' then
    raise exception 'control projection did not refresh the resolved bout: %',control_event;
  end if;

  perform public.record_official_pick_bout_result('pick-results-control-test','control-main','pending');
  if (select result_status from public.pick_bouts where event_id='pick-results-control-test' and bout_id='control-main') <> 'pending' then
    raise exception 'owner could not clear the result';
  end if;

  perform public.record_official_pick_bout_result('pick-results-control-test','control-main','red_win');
  begin
    perform public.transition_pick_event('pick-results-control-test','complete');
    raise exception 'event completed with a pending bout';
  exception when others then
    if sqlerrm not like '%all bout results must be resolved before completion%' then raise; end if;
  end;

  perform public.record_official_pick_bout_result('pick-results-control-test','control-co-main','cancelled');
  control_event := public.get_pick_control_event();
  if control_event #>> '{can_complete}' <> 'true' then
    raise exception 'fully resolved event was not completable: %',control_event;
  end if;

  perform public.transition_pick_event('pick-results-control-test','complete');
  if (select status from public.pick_events where event_id='pick-results-control-test') <> 'complete' then
    raise exception 'owner could not complete the event';
  end if;

  begin
    perform public.record_official_pick_bout_result('pick-results-control-test','control-main','blue_win');
    raise exception 'completed result was changed';
  exception when others then
    if sqlerrm not like '%completed event results are immutable%' then raise; end if;
  end;

  if has_table_privilege('authenticated','public.pick_control_owners','SELECT') then
    raise exception 'browser role can read the private control owner table';
  end if;
end $$;

rollback;
