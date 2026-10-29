-- One-hour picks/game alerts use distinct, correct sport identities.
-- UFC retains its main-card alert; Football announces only the editorially
-- published NFL and CFB Games of the Week. Four-hour incomplete Picks alerts
-- retain their existing audience, but route/copy to the proper sport.
-- All phone delivery stays gated by the server-side per-sport push settings.

alter table private.notification_groups
  drop constraint if exists notification_groups_kind_valid;

alter table private.notification_groups
  add constraint notification_groups_kind_valid
  check (kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring',
    'auction_action_required',
    'auction_result_ready',
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'picks_card_updated',
    'ufc_event_starting',
    'football_picks_open',
    'football_gotw_starting',
    'nba_launch_available',
    'nba_daily_four_hours',
    'nba_results_ready',
    'mlb_launch_available',
    'mlb_challenge_available',
    'mlb_challenge_four_hours',
    'mlb_round_available',
    'mlb_round_recap',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available',
    'ranking_refresh_available',
    'fighter_watchlist_added',
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ));

CREATE OR REPLACE FUNCTION private.notification_category_for_kind(p_kind text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare
  v_kind text := trim(p_kind);
begin
  if v_kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring'
  ) then
    return 'social';
  end if;

  if v_kind in (
    'auction_action_required',
    'auction_result_ready',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available',
    'mlb_launch_available',
    'mlb_challenge_available',
    'mlb_challenge_four_hours',
    'nba_launch_available',
    'nba_daily_four_hours',
    'nba_results_ready',
    'football_gotw_starting'
  ) then
    return 'games';
  end if;

  if v_kind in ('ranking_refresh_available', 'fighter_watchlist_added') then
    return 'rankings';
  end if;

  if v_kind in (
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'picks_card_updated',
    'ufc_event_starting',
    'football_picks_open',
    'mlb_round_available',
    'mlb_round_recap'
  ) then
    return 'picks';
  end if;

  if v_kind in (
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ) then
    return 'operations';
  end if;

  raise exception 'unsupported notification kind: %', v_kind;
end;
$function$

CREATE OR REPLACE FUNCTION private.notification_priority_for_kind(p_kind text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
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
      'picks_incomplete_near_lock',
      'picks_recap_ready',
      'ufc_event_starting',
      'football_picks_open',
      'football_gotw_starting',
      'new_game_available',
      'daily_challenge_four_hours',
      'mlb_launch_available',
      'mlb_challenge_available',
      'mlb_challenge_four_hours',
      'mlb_round_available',
      'nba_launch_available',
        'nba_daily_four_hours'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$function$

CREATE OR REPLACE FUNCTION public.dispatch_due_in_app_notifications(p_now timestamp with time zone DEFAULT now())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_owner_profile_id uuid;
  v_central_day date := (p_now at time zone 'America/Chicago')::date;
  v_central_time time := (p_now at time zone 'America/Chicago')::time;
  v_event record;
  v_gotw record;
  v_recipient record;
  v_draft record;
  v_failure record;
  v_daily record;
  v_required_bouts integer;
  v_picks_incomplete integer := 0;
  v_event_starting integer := 0;
  v_football_gotw_starting integer := 0;
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
    select event.event_id, event.name, event.status, event.locks_at, event.starts_at, event.sport
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
          left(
            case when v_event.sport = 'football'
              then coalesce(nullif(trim(v_event.name), ''), 'Football Picks') ||
                ' begins within four hours. Finish any remaining picks before their games kick off.'
              else coalesce(nullif(trim(v_event.name), ''), 'The UFC event') ||
                ' locks within four hours. Complete the remaining fights before lock.'
            end, 280
          ),
          case when v_event.sport = 'football' then '/football/picks' else '/picks' end,
          'FINISH PICKS',
          p_now
        );
        v_picks_incomplete := v_picks_incomplete + 1;
      end loop;
    end if;

    -- A whole Football slate is not a single main-card start.
    if v_event.sport = 'mma'
      and v_required_bouts > 0
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


  -- The published weekly Football editorial is the sole GOTW authority.
  -- NFL and CFB are independent notifications, one hour before their own kickoff.
  -- The canonical publisher keeps every reminder idempotent by source key.
  for v_gotw in
    select package.week_of, selected.league,
      nullif(trim(selected.game->>'away_team'), '') as away_team,
      nullif(trim(selected.game->>'home_team'), '') as home_team,
      (selected.game->>'kickoff_at')::timestamptz as kickoff_at
    from public.football_weekly_content_packages package
    cross join lateral (
      values
        ('cfb'::text, package.cfb_game_of_week),
        ('nfl'::text, package.nfl_game_of_week)
    ) as selected(league, game)
    where package.status = 'published'
      and package.published_at is not null
      and selected.game is not null
      and selected.game->>'away_team' is not null
      and selected.game->>'home_team' is not null
      and coalesce(selected.game->>'kickoff_at', '') ~
        '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}'
      and (selected.game->>'kickoff_at')::timestamptz > p_now
      and (selected.game->>'kickoff_at')::timestamptz <= p_now + interval '1 hour'
    order by (selected.game->>'kickoff_at')::timestamptz, package.week_of, selected.league
  loop
    for v_recipient in
      select profile.id as profile_id
      from public.profiles profile
      join private.profile_pin_credentials credential
        on credential.profile_id = profile.id
      order by profile.id
    loop
      perform private.publish_notification_to_profile(
        v_recipient.profile_id,
        'football-gotw-starting:' || v_gotw.week_of::text || ':' || v_gotw.league,
        'football-gotw-starting:' || v_gotw.week_of::text || ':' || v_gotw.league,
        'football_gotw_starting',
        upper(v_gotw.league) || ' Game of the Week starts soon',
        left(v_gotw.away_team || ' at ' || v_gotw.home_team ||
          ' kicks off in under one hour.', 280),
        '/football',
        'VIEW GAME',
        p_now
      );
      v_football_gotw_starting := v_football_gotw_starting + 1;
    end loop;
  end loop;

  -- The canonical dispatcher emits one independently scoped reminder for each
  -- official sport daily. A finish suppresses only that sport's reminder.
  if v_central_time >= time '20:00'
    and v_central_time < time '21:00'
  then
    for v_daily in
      select distinct on (schedule.sport)
        challenge.id, challenge.game_type, schedule.sport
      from private.daily_challenges challenge
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = challenge.schedule_version
      where challenge.central_day = v_central_day
        and schedule.sport in ('ufc', 'football')
      order by schedule.sport, challenge.published_at desc, challenge.id desc
    loop
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
          'daily-challenge-four-hours:' || v_daily.sport || ':' || v_central_day::text,
          'daily-challenge-four-hours:' || v_daily.sport,
          'daily_challenge_four_hours',
          case when v_daily.sport = 'football' then 'Football Daily closes soon' else 'Four hours remain' end,
          case
            when v_daily.sport = 'football' then 'Today''s Football Daily challenge closes at midnight Central.'
            when v_daily.game_type = 'find_leader' then 'Today''s Find the Leader challenge closes at midnight Central.'
            when v_daily.game_type = 'blind_resume' then 'Today''s Blind Resume challenge closes at midnight Central.'
            when v_daily.game_type = 'wavelength' then 'Today''s Wavelength challenge closes at midnight Central.'
            when v_daily.game_type = 'blind_rank_5' then 'Today''s Blind Rank 5 challenge closes at midnight Central.'
            when v_daily.game_type = 'keep_4_cut_4' then 'Today''s Keep 4, Cut 4 challenge closes at midnight Central.'
            else 'Today''s official challenge closes at midnight Central.'
          end,
          case
            when v_daily.sport = 'football' then '/football/today'
            when v_daily.game_type = 'find_leader' then '/play/find-leader'
            when v_daily.game_type = 'blind_resume' then '/play/blind-resume?mode=daily'
            when v_daily.game_type = 'wavelength' then '/play/wavelength?mode=daily'
            when v_daily.game_type = 'blind_rank_5' then '/play/blind-rank?mode=daily'
            when v_daily.game_type = 'keep_4_cut_4' then '/play/keep-cut?mode=daily'
            else '/play'
          end,
          'PLAY TODAY',
          p_now
        );
        v_daily_challenge := v_daily_challenge + 1;
      end loop;
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
          -- Exceeded quota already generates the provider-quota alert and cannot be
          -- fixed by repeated monitoring; exclude it from three-failure escalation.
          and not (
            coalesce(run.provider_requests_remaining, -1) = 0
            and run.diagnostics @> '[{"code":"provider_http_error"}]'::jsonb
          )
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
        -- One source per UFC event rather than a new push for every retry.
        'monitoring-repeatedly-failed:' || left(lower(regexp_replace(
          v_failure.source_event_identity, '[^a-zA-Z0-9:_-]+', '-', 'g'
        )), 140),
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
    'football_gotw_starting', v_football_gotw_starting,
    'daily_challenge', v_daily_challenge,
    'owner_operations', v_owner_operations
  );
end;
$function$

do $assertions$
begin
  if private.notification_category_for_kind('football_gotw_starting') <> 'games'
    or private.notification_priority_for_kind('football_gotw_starting') <> 'push_candidate'
  then
    raise exception 'Football GOTW must be a push-eligible Games notification';
  end if;
  if private.notification_push_scope('football_gotw_starting', '/football', '', '')
     <> array['football']::text[]
    or private.notification_push_scope('picks_incomplete_near_lock', '/football/picks', '', '')
     <> array['football']::text[]
    or private.notification_push_scope('picks_incomplete_near_lock', '/picks', '', '')
     <> array['ufc']::text[]
  then
    raise exception 'Football/UFC push scope must honor the destination sport';
  end if;
end
$assertions$;

notify pgrst, 'reload schema';
