-- Consolidate the remaining worthwhile in-app notification producers without adding
-- a second scheduler, inbox, provider, or browser-owned reminder path.

create or replace function public.dispatch_due_in_app_notifications(
  p_now timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_profile_id uuid;
  v_central_day date := (p_now at time zone 'America/Chicago')::date;
  v_central_time time := (p_now at time zone 'America/Chicago')::time;
  v_event record;
  v_recipient record;
  v_draft record;
  v_failure record;
  v_required_bouts integer;
  v_picks_incomplete integer := 0;
  v_event_starting integer := 0;
  v_daily_challenge integer := 0;
  v_owner_operations integer := 0;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to dispatch due notifications';
  end if;

  select owner.profile_id
    into v_owner_profile_id
  from private.notification_owner owner
  where owner.singleton = true;

  -- Member Picks timing uses the canonical event, lock, included-bout, and saved-pick owners.
  for v_event in
    select event.event_id, event.name, event.status, event.locks_at, event.starts_at
    from public.pick_events event
    where event.status in ('upcoming', 'locked')
    order by event.starts_at, event.event_id
  loop
    select count(*)
      into v_required_bouts
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.included_in_picks
      and bout.result_status = 'pending';

    if v_required_bouts > 0
      and v_event.status = 'upcoming'
      and v_event.locks_at > p_now
      and v_event.locks_at <= p_now + interval '4 hours'
    then
      for v_recipient in
        select distinct pick.profile_id
        from public.profile_event_picks pick
        join private.profile_pin_credentials credential
          on credential.profile_id = pick.profile_id
        where pick.event_id = v_event.event_id
          and exists (
            select 1
            from public.pick_bouts required_bout
            where required_bout.event_id = v_event.event_id
              and required_bout.included_in_picks
              and required_bout.result_status = 'pending'
              and not exists (
                select 1
                from public.profile_event_picks saved
                where saved.profile_id = pick.profile_id
                  and saved.event_id = required_bout.event_id
                  and saved.bout_id = required_bout.bout_id
              )
          )
        order by pick.profile_id
      loop
        perform private.publish_notification_to_profile(
          v_recipient.profile_id,
          'picks-incomplete-near-lock:' || v_event.event_id,
          'picks-incomplete-near-lock',
          'picks_incomplete_near_lock',
          'Finish your Picks',
          left(coalesce(nullif(trim(v_event.name), ''), 'The UFC event') ||
            ' locks within four hours. Complete the remaining fights before lock.', 280),
          '/picks',
          'FINISH PICKS',
          p_now
        );
        v_picks_incomplete := v_picks_incomplete + 1;
      end loop;
    end if;

    if v_required_bouts > 0
      and v_event.starts_at > p_now
      and v_event.starts_at <= p_now + interval '1 hour'
    then
      for v_recipient in
        select distinct pick.profile_id
        from public.profile_event_picks pick
        join private.profile_pin_credentials credential
          on credential.profile_id = pick.profile_id
        where pick.event_id = v_event.event_id
          and not exists (
            select 1
            from public.pick_bouts required_bout
            where required_bout.event_id = v_event.event_id
              and required_bout.included_in_picks
              and required_bout.result_status = 'pending'
              and not exists (
                select 1
                from public.profile_event_picks saved
                where saved.profile_id = pick.profile_id
                  and saved.event_id = required_bout.event_id
                  and saved.bout_id = required_bout.bout_id
              )
          )
        order by pick.profile_id
      loop
        perform private.publish_notification_to_profile(
          v_recipient.profile_id,
          'ufc-event-starting:' || v_event.event_id,
          'ufc-event-starting',
          'ufc_event_starting',
          left(coalesce(nullif(trim(v_event.name), ''), 'The UFC event') || ' starts soon', 100),
          'Your Picks are in. The main card starts in under one hour.',
          '/picks',
          'VIEW PICKS',
          p_now
        );
        v_event_starting := v_event_starting + 1;
      end loop;
    end if;
  end loop;

  -- Find the Leader is the sole reminder-eligible daily game. The one useful reminder
  -- is sent during the 8 PM Central hour to claimed profiles that have not completed today.
  if v_central_time >= time '20:00'
    and v_central_time < time '21:00'
  then
    for v_recipient in
      select profile.id as profile_id
      from public.profiles profile
      join private.profile_pin_credentials credential
        on credential.profile_id = profile.id
      where not exists (
        select 1
        from public.find_leader_history history
        where history.profile_id = profile.id
          and history.day = v_central_day
      )
      order by profile.id
    loop
      perform private.publish_notification_to_profile(
        v_recipient.profile_id,
        'daily-challenge-four-hours:' || v_central_day::text,
        'daily-challenge-four-hours',
        'daily_challenge_four_hours',
        'Four hours remain',
        'Today''s Find the Leader challenge closes at midnight Central.',
        '/play/find-leader',
        'PLAY TODAY',
        p_now
      );
      v_daily_challenge := v_daily_challenge + 1;
    end loop;
  end if;

  if v_owner_profile_id is not null then
    -- A staged upcoming event with no matching published card is one clear owner action,
    -- not separate "draft ready" and "missing card" noise.
    for v_draft in
      select draft.draft_id, draft.event_id, draft.name, draft.starts_at
      from public.pick_event_drafts draft
      where draft.state = 'staged'
        and draft.starts_at > p_now
        and draft.starts_at <= p_now + interval '14 days'
        and not exists (
          select 1
          from public.pick_events event
          where event.event_id = draft.event_id
            and event.status in ('upcoming', 'locked')
        )
      order by draft.starts_at, draft.draft_id
    loop
      perform private.publish_notification_to_profile(
        v_owner_profile_id,
        'event-draft-ready:' || v_draft.draft_id::text,
        'event-drafts-ready',
        'event_draft_ready',
        'Event draft ready for review',
        left(coalesce(nullif(trim(v_draft.name), ''), 'The next UFC event') ||
          ' is staged and has no published Picks card.', 280),
        '/picks/setup',
        'REVIEW',
        p_now
      );
      v_owner_operations := v_owner_operations + 1;
    end loop;

    -- Three recent consecutive failed runs are required before escalating. Each new
    -- failed run is a new immutable source event and aggregates into the same owner row.
    for v_failure in
      with ranked_runs as (
        select run.run_id,
               run.source_event_identity,
               run.status,
               coalesce(run.completed_at, run.started_at) as occurred_at,
               row_number() over (
                 partition by run.source_event_identity
                 order by coalesce(run.completed_at, run.started_at) desc, run.created_at desc
               ) as recent_rank
        from public.pick_monitoring_runs run
        where coalesce(run.completed_at, run.started_at) >= p_now - interval '6 hours'
      )
      select source_event_identity,
             max(run_id::text) filter (where recent_rank = 1) as latest_run_id,
             max(occurred_at) filter (where recent_rank = 1) as latest_occurred_at
      from ranked_runs
      where recent_rank <= 3
      group by source_event_identity
      having count(*) = 3 and bool_and(status = 'failed')
    loop
      perform private.publish_notification_to_profile(
        v_owner_profile_id,
        'monitoring-repeatedly-failed:' || v_failure.latest_run_id,
        'monitoring-repeatedly-failed:' || left(lower(regexp_replace(
          v_failure.source_event_identity, '[^a-zA-Z0-9:_-]+', '-', 'g'
        )), 140),
        'monitoring_repeatedly_failed',
        'Monitoring repeatedly failed',
        'Three consecutive monitoring runs failed for the current UFC event. Review the Monitoring Inbox.',
        '/picks/monitoring',
        'REVIEW',
        v_failure.latest_occurred_at
      );
      v_owner_operations := v_owner_operations + 1;
    end loop;

    -- Once every included result is final, Cody receives one completion action rather
    -- than separate "all results entered" and "ready to complete" notifications.
    for v_event in
      select event.event_id, event.name
      from public.pick_events event
      where event.status = 'locked'
        and exists (
          select 1
          from public.pick_bouts bout
          where bout.event_id = event.event_id
            and bout.included_in_picks
        )
        and not exists (
          select 1
          from public.pick_bouts bout
          where bout.event_id = event.event_id
            and bout.included_in_picks
            and bout.result_status = 'pending'
        )
      order by event.starts_at, event.event_id
    loop
      perform private.publish_notification_to_profile(
        v_owner_profile_id,
        'event-ready-to-complete:' || v_event.event_id,
        'event-ready-to-complete',
        'event_ready_to_complete',
        'Event ready to complete',
        left('All included results are entered for ' ||
          coalesce(nullif(trim(v_event.name), ''), 'the UFC event') || '.', 280),
        '/picks/control',
        'COMPLETE EVENT',
        p_now
      );
      v_owner_operations := v_owner_operations + 1;
    end loop;
  end if;

  return jsonb_build_object(
    'picks_incomplete', v_picks_incomplete,
    'event_starting', v_event_starting,
    'daily_challenge', v_daily_challenge,
    'owner_operations', v_owner_operations
  );
end;
$$;

revoke all on function public.dispatch_due_in_app_notifications(timestamptz)
  from public, anon, authenticated;
grant execute on function public.dispatch_due_in_app_notifications(timestamptz)
  to service_role;

-- A correction to a completed event immediately changes member standings and season totals.
-- Keep the existing correction owner and deliver one updated-recap notification transactionally.
create or replace function public.correct_official_pick_bout_result(
  p_event_id text,
  p_bout_id text,
  p_result_status text,
  p_expected_result_status text,
  p_expected_winner_fighter_slug text,
  p_expected_result_recorded_at timestamptz,
  p_reason text
)
returns public.pick_bouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_bout_id text := lower(trim(p_bout_id));
  v_result_status text := lower(trim(p_result_status));
  v_expected_result_status text := lower(trim(p_expected_result_status));
  v_expected_winner text := case
    when p_expected_winner_fighter_slug is null then null
    else lower(trim(p_expected_winner_fighter_slug))
  end;
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_before jsonb;
  v_after jsonb;
  v_correction_id bigint;
  v_corrected_at timestamptz;
  v_recipient record;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if v_result_status not in ('red_win', 'blue_win', 'draw', 'no_contest', 'cancelled') then
    raise exception 'corrected official result requires a final result';
  end if;
  if v_expected_result_status not in ('red_win', 'blue_win', 'draw', 'no_contest', 'cancelled') then
    raise exception 'expected current final result is required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'result correction reason required';
  end if;
  if p_expected_result_recorded_at is null then
    raise exception 'expected current result timestamp is required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status not in ('locked', 'complete') then
    raise exception 'result corrections require a locked or completed event';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id
  for update;

  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'pending' then
    raise exception 'pending bout requires initial result entry';
  end if;

  if v_bout.result_status is distinct from v_expected_result_status
    or v_bout.winner_fighter_slug is distinct from v_expected_winner
    or v_bout.result_recorded_at is distinct from p_expected_result_recorded_at then
    raise exception 'official result changed; reload Fight Night Control';
  end if;

  if v_bout.result_status = v_result_status then
    raise exception 'corrected official result is unchanged';
  end if;

  v_before := jsonb_build_object(
    'event_status', v_event.status,
    'result_status', v_bout.result_status,
    'winner_fighter_slug', v_bout.winner_fighter_slug,
    'result_recorded_at', v_bout.result_recorded_at,
    'red_fighter_slug', v_bout.red_fighter_slug,
    'blue_fighter_slug', v_bout.blue_fighter_slug
  );

  update public.pick_bouts
  set result_status = v_result_status,
      winner_fighter_slug = case v_result_status
        when 'red_win' then v_bout.red_fighter_slug
        when 'blue_win' then v_bout.blue_fighter_slug
        else null
      end,
      result_recorded_at = now()
  where event_id = v_event_id
    and bout_id = v_bout_id
  returning * into v_bout;

  v_after := jsonb_build_object(
    'event_status', v_event.status,
    'result_status', v_bout.result_status,
    'winner_fighter_slug', v_bout.winner_fighter_slug,
    'result_recorded_at', v_bout.result_recorded_at,
    'red_fighter_slug', v_bout.red_fighter_slug,
    'blue_fighter_slug', v_bout.blue_fighter_slug
  );

  insert into public.pick_result_corrections(
    event_id,
    bout_id,
    reason,
    before_state,
    after_state,
    corrected_by
  ) values (
    v_event_id,
    v_bout_id,
    v_reason,
    v_before,
    v_after,
    auth.uid()
  )
  returning id, corrected_at into v_correction_id, v_corrected_at;

  if v_event.status = 'complete' then
    for v_recipient in
      select distinct pick.profile_id
      from public.profile_event_picks pick
      join private.profile_pin_credentials credential
        on credential.profile_id = pick.profile_id
      where pick.event_id = v_event_id
      order by pick.profile_id
    loop
      perform private.publish_notification_to_profile(
        v_recipient.profile_id,
        'picks-season-result-changed:' || v_correction_id::text,
        'picks-season-result-changed',
        'picks_season_result_changed',
        left(coalesce(nullif(trim(v_event.name), ''), 'Picks event') || ' results changed', 100),
        'A completed fight result changed. Your standings and season record were recalculated.',
        '/picks',
        'VIEW UPDATED RECAP',
        v_corrected_at
      );
    end loop;
  end if;

  return v_bout;
end;
$$;

revoke all on function public.correct_official_pick_bout_result(text,text,text,text,text,timestamptz,text)
  from public, anon, authenticated;
grant execute on function public.correct_official_pick_bout_result(text,text,text,text,text,timestamptz,text)
  to authenticated, service_role;

notify pgrst, 'reload schema';
