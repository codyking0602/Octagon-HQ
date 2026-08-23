begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_state jsonb;
  v_inbox jsonb;
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
    'fight-night-live-window-owner@login.octagon-hq.app','',now(),now(),now(),
    jsonb_build_object('display_name','FIGHT NIGHT LIVE WINDOW OWNER','historical_unclaimed',true)
  );
  perform public.register_unclaimed_pin_profile(v_owner,'Fight Night Live Window Owner','FW');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,prelims_starts_at,locks_at,season,status
  ) values (
    'fight-night-monitoring-live-window-test','UFC Fight Night Monitoring Window','Window Red vs. Window Blue',
    'Test Arena','Dallas, Texas',now()-interval '1 hour',now()-interval '4 hours',
    now()-interval '1 hour',2199,'upcoming'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,locks_at
  ) values (
    'fight-night-monitoring-live-window-test','window-bout',1,'Middleweight',
    'window-red','Window Red','window-blue','Window Blue',now()-interval '1 hour'
  );

  -- The old master/event deadline has passed, but the published Fight Night must
  -- remain the canonical monitoring event while ESPN's 12-hour live window is open.
  v_state := public.get_pick_monitoring_event_state();
  if v_state #>> '{current,event_id}' is distinct from 'fight-night-monitoring-live-window-test' then
    raise exception 'published Fight Night disappeared from service monitoring after its legacy deadline';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_inbox := public.get_pick_monitoring_inbox();
  if v_inbox #>> '{monitored_event,event_id}' is distinct from 'fight-night-monitoring-live-window-test' then
    raise exception 'owner inbox disagreed with the canonical post-deadline monitored event';
  end if;

  -- A manually master-locked card is still active for ESPN final/result monitoring.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set status = 'locked'
  where event_id = 'fight-night-monitoring-live-window-test';

  v_state := public.get_pick_monitoring_event_state();
  if v_state #>> '{current,event_id}' is distinct from 'fight-night-monitoring-live-window-test' then
    raise exception 'locked Fight Night was removed from ESPN monitoring';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_inbox := public.get_pick_monitoring_inbox();
  if v_inbox #>> '{monitored_event,event_id}' is distinct from 'fight-night-monitoring-live-window-test' then
    raise exception 'owner inbox removed a locked Fight Night still inside the ESPN live window';
  end if;

  -- Match shouldPollEspnLiveFightState(): after the 12-hour tail the card is no
  -- longer monitorable, preventing stale events from owning future scheduler wakes.
  perform set_config('request.jwt.claim.role','service_role',true);
  update public.pick_events
  set starts_at = now()-interval '13 hours',
      prelims_starts_at = now()-interval '16 hours',
      locks_at = now()-interval '13 hours'
  where event_id = 'fight-night-monitoring-live-window-test';

  v_state := public.get_pick_monitoring_event_state();
  if jsonb_typeof(v_state->'current') = 'object' then
    raise exception 'expired Fight Night survived beyond the bounded ESPN live window';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_inbox := public.get_pick_monitoring_inbox();
  if jsonb_typeof(v_inbox->'monitored_event') = 'object' then
    raise exception 'owner inbox retained an expired Fight Night beyond the live window';
  end if;
end;
$$;

rollback;
