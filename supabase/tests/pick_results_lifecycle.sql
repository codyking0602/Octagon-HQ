begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  profile_id uuid := extensions.gen_random_uuid();
  event_row public.pick_events;
  bout_row public.pick_bouts;
  summary_row record;
  member_row record;
  history jsonb;
begin
  insert into auth.users(
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) values (
    profile_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'pick-lifecycle-fixture@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'LIFECYCLE TESTER', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(profile_id, 'Lifecycle Tester', 'LT');

  insert into public.pick_events (
    event_id,
    name,
    subtitle,
    venue,
    location,
    starts_at,
    locks_at,
    season,
    status
  ) values (
    'pick-lifecycle-test-event',
    'UFC Test Event',
    'Lifecycle vs. Fixture',
    'Test Arena',
    'Dallas, Texas',
    now() - interval '1 hour',
    now() - interval '2 hours',
    2099,
    'upcoming'
  );

  insert into public.pick_bouts (
    event_id,
    bout_id,
    position,
    weight_class,
    red_fighter_slug,
    red_fighter_name,
    blue_fighter_slug,
    blue_fighter_name
  ) values
    ('pick-lifecycle-test-event', 'correct-bout', 1, 'Lightweight', 'red-one', 'Red One', 'blue-one', 'Blue One'),
    ('pick-lifecycle-test-event', 'incorrect-bout', 2, 'Welterweight', 'red-two', 'Red Two', 'blue-two', 'Blue Two'),
    ('pick-lifecycle-test-event', 'draw-bout', 3, 'Middleweight', 'red-three', 'Red Three', 'blue-three', 'Blue Three'),
    ('pick-lifecycle-test-event', 'cancelled-bout', 4, 'Heavyweight', 'red-four', 'Red Four', 'blue-four', 'Blue Four'),
    ('pick-lifecycle-test-event', 'missing-bout', 5, 'Flyweight', 'red-five', 'Red Five', 'blue-five', 'Blue Five');

  insert into public.profile_event_picks (
    profile_id,
    event_id,
    bout_id,
    fighter_slug
  ) values
    (profile_id, 'pick-lifecycle-test-event', 'correct-bout', 'red-one'),
    (profile_id, 'pick-lifecycle-test-event', 'incorrect-bout', 'red-two'),
    (profile_id, 'pick-lifecycle-test-event', 'draw-bout', 'red-three');

  if has_function_privilege(
    'authenticated',
    'public.record_official_pick_bout_result(text,text,text)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.transition_pick_event(text,text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can mutate official Picks results';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', profile_id::text, true);

  begin
    perform public.transition_pick_event('pick-lifecycle-test-event', 'locked');
    raise exception 'browser role unexpectedly transitioned an event';
  exception
    when others then
      if sqlerrm not like '%service role required%' then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.role', 'service_role', true);

  select * into event_row
  from public.transition_pick_event('pick-lifecycle-test-event', 'locked');

  if event_row.status <> 'locked' or event_row.completed_at is not null then
    raise exception 'event did not transition to locked canonically';
  end if;

  begin
    perform public.transition_pick_event('pick-lifecycle-test-event', 'complete');
    raise exception 'event completed with pending bout results';
  exception
    when others then
      if sqlerrm not like '%all bout results must be resolved before completion%' then
        raise;
      end if;
  end;

  perform public.record_official_pick_bout_result(
    'pick-lifecycle-test-event',
    'correct-bout',
    'red_win'
  );
  perform public.record_official_pick_bout_result(
    'pick-lifecycle-test-event',
    'incorrect-bout',
    'blue_win'
  );
  perform public.record_official_pick_bout_result(
    'pick-lifecycle-test-event',
    'draw-bout',
    'draw'
  );
  perform public.record_official_pick_bout_result(
    'pick-lifecycle-test-event',
    'cancelled-bout',
    'cancelled'
  );
  perform public.record_official_pick_bout_result(
    'pick-lifecycle-test-event',
    'missing-bout',
    'red_win'
  );

  select * into bout_row
  from public.pick_bouts
  where event_id = 'pick-lifecycle-test-event'
    and bout_id = 'incorrect-bout';

  if bout_row.result_status <> 'blue_win'
     or bout_row.winner_fighter_slug <> 'blue-two'
     or bout_row.result_recorded_at is null then
    raise exception 'official bout result was not derived from the canonical matchup';
  end if;

  select * into event_row
  from public.transition_pick_event('pick-lifecycle-test-event', 'complete');

  if event_row.status <> 'complete' or event_row.completed_at is null then
    raise exception 'event did not complete atomically';
  end if;

  select * into event_row
  from public.transition_pick_event('pick-lifecycle-test-event', 'complete');

  if event_row.status <> 'complete' then
    raise exception 'event completion is not idempotent';
  end if;

  begin
    perform public.record_official_pick_bout_result(
      'pick-lifecycle-test-event',
      'correct-bout',
      'blue_win'
    );
    raise exception 'completed result was unexpectedly mutable';
  exception
    when others then
      if sqlerrm not like '%completed event results are immutable%' then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', profile_id::text, true);

  select * into summary_row
  from public.get_my_pick_summary(2099);

  if summary_row.correct <> 1
     or summary_row.incorrect <> 1
     or summary_row.pending <> 0
     or summary_row.events_entered <> 1 then
    raise exception 'season summary did not exclude non-decisive outcomes';
  end if;

  history := public.get_my_pick_history(2099);

  if history #>> '{summary,correct}' <> '1'
     or history #>> '{summary,incorrect}' <> '1'
     or history #>> '{summary,missing}' <> '1'
     or history #>> '{summary,excluded}' <> '2'
     or history #>> '{summary,events_entered}' <> '1' then
    raise exception 'completed-event history summary is incorrect';
  end if;

  if jsonb_array_length(history -> 'events') <> 1
     or history #>> '{events,0,record,correct}' <> '1'
     or history #>> '{events,0,record,incorrect}' <> '1'
     or history #>> '{events,0,record,missing}' <> '1'
     or history #>> '{events,0,record,excluded}' <> '2' then
    raise exception 'completed-event recap record is incorrect';
  end if;

  if history #>> '{events,0,bouts,0,verdict}' <> 'correct'
     or history #>> '{events,0,bouts,1,verdict}' <> 'incorrect'
     or history #>> '{events,0,bouts,2,verdict}' <> 'excluded'
     or history #>> '{events,0,bouts,3,verdict}' <> 'excluded'
     or history #>> '{events,0,bouts,4,verdict}' <> 'missing' then
    raise exception 'bout-level recap verdicts are incorrect';
  end if;

  select * into member_row
  from public.get_member_profile('Lifecycle Tester');

  if member_row.picks_correct <> 1
     or member_row.picks_incorrect <> 1
     or member_row.picks_pending <> 0 then
    raise exception 'Member Profiles diverged from canonical Picks scoring';
  end if;
end $$;

rollback;
