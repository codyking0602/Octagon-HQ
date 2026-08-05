-- Preserve the latest canonical shared notification dispatcher and change only its
-- one daily reminder to follow the server-owned official challenge.
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
  v_daily record;
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

  -- The one reminder follows the exact materialized official daily and its immutable
  -- first-attempt owner. Rotation remains whatever the canonical schedule selects.
  if v_central_time >= time '20:00'
    and v_central_time < time '21:00'
  then
    select challenge.id, challenge.game_type
      into v_daily
    from private.daily_challenges challenge
    where challenge.central_day = v_central_day
    order by challenge.published_at desc, challenge.id
    limit 1;

    if v_daily.id is not null then
      for v_recipient in
        select profile.id as profile_id
        from public.profiles profile
        join private.profile_pin_credentials credential
          on credential.profile_id = profile.id
        where not exists (
          select 1
          from private.daily_challenge_attempts attempt
          where attempt.daily_challenge_id = v_daily.id
            and attempt.profile_id = profile.id
            and attempt.attempt_kind = 'official_first'
        )
        order by profile.id
      loop
        perform private.publish_notification_to_profile(
          v_recipient.profile_id,
          'daily-challenge-four-hours:' || v_central_day::text,
          'daily-challenge-four-hours',
          'daily_challenge_four_hours',
          'Four hours remain',
          case v_daily.game_type
            when 'find_leader' then 'Today''s Find the Leader challenge closes at midnight Central.'
            when 'blind_resume' then 'Today''s Blind Resume challenge closes at midnight Central.'
            when 'wavelength' then 'Today''s Wavelength challenge closes at midnight Central.'
            when 'blind_rank_5' then 'Today''s Blind Rank 5 challenge closes at midnight Central.'
            when 'keep_4_cut_4' then 'Today''s Keep 4, Cut 4 challenge closes at midnight Central.'
            else 'Today''s official challenge closes at midnight Central.'
          end,
          case v_daily.game_type
            when 'find_leader' then '/play/find-leader'
            when 'blind_resume' then '/play/blind-resume?mode=daily'
            when 'wavelength' then '/play/wavelength?mode=daily'
            when 'blind_rank_5' then '/play/blind-rank?mode=daily'
            when 'keep_4_cut_4' then '/play/keep-cut?mode=daily'
            else '/play'
          end,
          'PLAY TODAY',
          p_now
        );
        v_daily_challenge := v_daily_challenge + 1;
      end loop;
    end if;
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
          where event.event_id = v_draft.event_id
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

    -- Escalate only after three recent consecutive failed automatic provider runs.
    -- Manual checks and decision-only scheduler evidence cannot create this notification.
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
        where run.trigger_kind = 'scheduled'
          and run.provider_called
          and run.decision_reason is null
          and coalesce(run.completed_at, run.started_at) >= p_now - interval '6 hours'
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
        'Three consecutive automatic monitoring runs failed for the current UFC event. Review the Monitoring Inbox.',
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
