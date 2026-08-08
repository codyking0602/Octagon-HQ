-- Keep the existing notification publisher, scheduler, and delivery worker as the only owners.
-- This migration only broadens the due-recipient set for the existing Picks reminder and
-- classifies the existing Daily Challenge reminder as a push candidate.

create or replace function private.notification_priority_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if private.notification_category_for_kind(v_kind) = 'operations'
    or v_kind in (
      'war_room_mention',
      'war_room_reply',
      'game_challenge_received',
      'auction_action_required',
      'auction_result_ready',
      'picks_repick_required',
      'picks_incomplete_near_lock',
      'picks_recap_ready',
      'daily_challenge_four_hours'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

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

  -- Member Picks timing uses the canonical event, lock, included-bout, profile, and
  -- saved-pick owners. Every claimed profile with any missing included fight is due,
  -- including a member who has not submitted a first pick yet.
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
        select profile.id as profile_id
        from public.profiles profile
        join private.profile_pin_credentials credential
          on credential.profile_id = profile.id
        where exists (
          select 1
          from public.pick_bouts required_bout
          where required_bout.event_id = v_event.event_id
            and required_bout.included_in_picks
            and required_bout.result_status = 'pending'
            and not exists (
              select 1
              from public.profile_event_picks saved
              where saved.profile_id = profile.id
                and saved.event_id = required_bout.event_id
                and saved.bout_id = required_bout.bout_id
            )
        )
        order by profile.id
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

  -- Find the Leader remains the sole reminder-eligible daily game. This existing
  -- 8 PM Central reminder is now a push candidate through the canonical priority owner.
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

revoke all on function private.notification_priority_for_kind(text)
  from public, anon, authenticated;

notify pgrst, 'reload schema';
