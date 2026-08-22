begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_live_at timestamptz := now() - interval '2 minutes';
  v_final_at timestamptz;
  v_ambiguous_final_at timestamptz := now() - interval '1 minute';
  v_receipt jsonb;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming','locked');

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data
  )
  values
    (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'fight-night-auto-owner@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','FIGHT NIGHT AUTO OWNER','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'fight-night-auto-member@login.octagon-hq.app','',now(),now(),now(),
      jsonb_build_object('display_name','FIGHT NIGHT AUTO MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner,'Fight Night Auto Owner','FA');
  perform public.register_unclaimed_pin_profile(v_member,'Fight Night Auto Member','FM');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,prelims_starts_at,locks_at,season,status
  ) values (
    'fight-night-automation-test','UFC Fight Night Automation Test','Auto Red vs. Auto Blue',
    'Test Arena','Dallas, Texas',now()+interval '6 hours',now()+interval '3 hours',
    now()+interval '3 hours',2199,'upcoming'
  );

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,blue_fighter_slug,blue_fighter_name,locks_at
  ) values
    ('fight-night-automation-test','auto-result-bout',1,'Lightweight',
      'auto-red','Auto Red','auto-blue','Auto Blue',now()+interval '4 hours'),
    ('fight-night-automation-test','ambiguous-final-bout',2,'Welterweight',
      'draw-red','Draw Red','draw-blue','Draw Blue',now()+interval '4 hours'),
    ('fight-night-automation-test','later-bout',3,'Middleweight',
      'later-auto-red','Later Auto Red','later-auto-blue','Later Auto Blue',now()+interval '5 hours');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('fight-night-automation-test','auto-result-bout','auto-red');
  perform public.save_my_event_pick('fight-night-automation-test','ambiguous-final-bout','draw-red');
  perform public.save_my_event_pick('fight-night-automation-test','later-bout','later-auto-red');

  -- A trusted start locks this fight immediately even though its planned deadline
  -- remains hours away. No event-wide lifecycle transition is allowed here.
  perform set_config('request.jwt.claim.role','service_role',true);
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-automation-test',
    jsonb_build_array(jsonb_build_object(
      'bout_id','auto-result-bout',
      'state','live',
      'provider','espn',
      'source_event_id','espn-event-1',
      'source_competition_id','espn-bout-1',
      'winner_fighter_slug',null,
      'observed_at',v_live_at
    ))
  );
  if coalesce((v_receipt->>'bouts_updated')::integer,0) <> 1 then
    raise exception 'live transition was not persisted exactly once';
  end if;
  if (select status from public.pick_events where event_id='fight-night-automation-test') <> 'upcoming' then
    raise exception 'live transition finalized or locked the whole event';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.save_my_event_pick('fight-night-automation-test','auto-result-bout','auto-blue');
    raise exception 'member edited a pick after the provider confirmed fight start';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;

  -- Cody/owner still reopens through the existing canonical deadline owner. The
  -- audit action, not a second automation mutation path, is the durable override.
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.adjust_pick_bout_lock_time(
    'fight-night-automation-test','auto-result-bout',now()+interval '30 minutes'
  );
  if (select count(*) from public.pick_card_change_actions
      where event_id='fight-night-automation-test'
        and bout_id='auto-result-bout'
        and action_type='adjust_bout_lock_time') <> 1 then
    raise exception 'live owner reopen did not use the canonical audited deadline owner';
  end if;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('fight-night-automation-test','auto-result-bout','auto-blue');
  if not exists (
    select 1 from public.profile_event_picks
    where profile_id=v_member
      and event_id='fight-night-automation-test'
      and bout_id='auto-result-bout'
      and fighter_slug='auto-blue'
  ) then
    raise exception 'explicit owner reopen did not restore member editing';
  end if;

  -- Model the final provider observation after the explicit live reopen. The
  -- recorder should re-lock through the live-state boundary before delegating to
  -- the canonical result owner.
  v_final_at := clock_timestamp();

  -- A final observation with one unambiguous winner routes through the canonical
  -- official-result owner. Result state is the existing Picks grading input.
  perform set_config('request.jwt.claim.role','service_role',true);
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-automation-test',
    jsonb_build_array(jsonb_build_object(
      'bout_id','auto-result-bout',
      'state','final',
      'provider','espn',
      'source_event_id','espn-event-1',
      'source_competition_id','espn-bout-1',
      'winner_fighter_slug','auto-red',
      'observed_at',v_final_at
    ))
  );
  if coalesce((v_receipt->>'official_results_applied')::integer,0) <> 1 then
    raise exception 'confirmed final winner did not dispatch the canonical official result';
  end if;
  if (select result_status from public.pick_bouts
      where event_id='fight-night-automation-test' and bout_id='auto-result-bout') <> 'red_win'
    or (select winner_fighter_slug from public.pick_bouts
      where event_id='fight-night-automation-test' and bout_id='auto-result-bout') <> 'auto-red' then
    raise exception 'automatic official winner was not recorded canonically';
  end if;
  if (select status from public.pick_events where event_id='fight-night-automation-test') <> 'upcoming' then
    raise exception 'automatic final result changed the event lifecycle';
  end if;

  -- Repeating the same final is idempotent: it does not rewrite the official result.
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-automation-test',
    jsonb_build_array(jsonb_build_object(
      'bout_id','auto-result-bout',
      'state','final',
      'provider','espn',
      'source_event_id','espn-event-1',
      'source_competition_id','espn-bout-1',
      'winner_fighter_slug','auto-red',
      'observed_at',v_final_at + interval '1 minute'
    ))
  );
  if coalesce((v_receipt->>'official_results_already_recorded')::integer,0) <> 1 then
    raise exception 'repeated final result was not treated idempotently';
  end if;

  -- A later provider correction is retained as provider evidence but never
  -- overwrites the official result. Cody's existing correction flow remains owner.
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-automation-test',
    jsonb_build_array(jsonb_build_object(
      'bout_id','auto-result-bout',
      'state','final',
      'provider','espn',
      'source_event_id','espn-event-1',
      'source_competition_id','espn-bout-1',
      'winner_fighter_slug','auto-blue',
      'observed_at',v_final_at + interval '2 minutes'
    ))
  );
  if coalesce((v_receipt->>'official_result_conflicts')::integer,0) <> 1 then
    raise exception 'provider result disagreement was not surfaced as a conflict';
  end if;
  if (select result_status from public.pick_bouts
      where event_id='fight-night-automation-test' and bout_id='auto-result-bout') <> 'red_win' then
    raise exception 'provider correction overwrote the canonical official result';
  end if;

  -- An older/regressive provider response cannot move a final fight back to live.
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-automation-test',
    jsonb_build_array(jsonb_build_object(
      'bout_id','auto-result-bout',
      'state','live',
      'provider','espn',
      'source_event_id','espn-event-1',
      'source_competition_id','espn-bout-1',
      'winner_fighter_slug',null,
      'observed_at',v_live_at
    ))
  );
  if coalesce((v_receipt->>'stale_observations_skipped')::integer,0) <> 1
    or (select live_status from public.pick_bouts
      where event_id='fight-night-automation-test' and bout_id='auto-result-bout') <> 'final' then
    raise exception 'stale provider response regressed trusted final state';
  end if;

  -- Final-without-winner is fail-closed for draw/NC/incomplete evidence: lock the
  -- fight, keep the official result pending, and let the owner use existing control.
  v_receipt := public.record_pick_bout_live_states(
    'fight-night-automation-test',
    jsonb_build_array(jsonb_build_object(
      'bout_id','ambiguous-final-bout',
      'state','final',
      'provider','espn',
      'source_event_id','espn-event-1',
      'source_competition_id','espn-bout-2',
      'winner_fighter_slug',null,
      'observed_at',v_ambiguous_final_at
    ))
  );
  if coalesce((v_receipt->>'final_results_unresolved')::integer,0) <> 1
    or (select result_status from public.pick_bouts
      where event_id='fight-night-automation-test' and bout_id='ambiguous-final-bout') <> 'pending' then
    raise exception 'ambiguous final evidence invented an official result';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.save_my_event_pick('fight-night-automation-test','ambiguous-final-bout','draw-blue');
    raise exception 'member edited a final unresolved fight without owner override';
  exception when others then
    if sqlerrm not like '%pick is locked for this fight%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  perform public.adjust_pick_bout_lock_time(
    'fight-night-automation-test','ambiguous-final-bout',now()+interval '30 minutes'
  );
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  perform public.save_my_event_pick('fight-night-automation-test','ambiguous-final-bout','draw-blue');

  -- Unrelated later fights remain open and the existing Watch Moment/manual
  -- finalization path is untouched.
  perform public.save_my_event_pick('fight-night-automation-test','later-bout','later-auto-blue');
  if (select status from public.pick_events where event_id='fight-night-automation-test') <> 'upcoming'
    or (select result_status from public.pick_bouts
      where event_id='fight-night-automation-test' and bout_id='later-bout') <> 'pending' then
    raise exception 'Fight Night automation changed unrelated fight or event lifecycle state';
  end if;

  if (select schedule from cron.job where jobname='octagon-hq-pick-monitoring') <> '*/5 * * * *' then
    raise exception 'canonical Picks monitoring scheduler is not on the Fight Night cadence';
  end if;
  if (select count(*) from cron.job where jobname='octagon-hq-pick-monitoring') <> 1 then
    raise exception 'Fight Night automation created competing scheduler ownership';
  end if;
end;
$$;

rollback;
