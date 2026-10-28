-- MLB postseason notifications.
-- Infrastructure can ship while Baseball HQ remains private: the dispatcher is a no-op
-- until public.mlb_playoff_seasons.public_enabled is true.
-- Reuses the existing trusted monitoring wake-up and canonical notification publisher.

alter table private.notification_groups
  drop constraint if exists notification_groups_kind_valid;

alter table private.notification_groups
  add constraint notification_groups_kind_valid check (kind in (
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

create or replace function private.notification_category_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
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
    'mlb_challenge_four_hours'
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
$$;

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
      'picks_card_updated',
      'ufc_event_starting',
      'football_picks_open',
      'new_game_available',
      'daily_challenge_four_hours',
      'mlb_launch_available',
      'mlb_challenge_available',
      'mlb_challenge_four_hours',
      'mlb_round_available'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

create or replace function public.dispatch_due_mlb_notifications(
  p_now timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_central_day date := (p_now at time zone 'America/Chicago')::date;
  v_central_time time := (p_now at time zone 'America/Chicago')::time;
  v_season public.mlb_playoff_seasons;
  v_challenge public.mlb_postseason_challenges;
  v_active_challenge public.mlb_postseason_challenges;
  v_recipient record;
  v_round record;
  v_next_challenge_date date;
  v_round_label text;
  v_launch_at timestamptz;
  v_launch integer := 0;
  v_challenge_available integer := 0;
  v_challenge_four_hours integer := 0;
  v_round_available integer := 0;
  v_round_recap integer := 0;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to dispatch MLB notifications';
  end if;

  for v_season in
    select season_row.*
    from public.mlb_playoff_seasons season_row
    where season_row.public_enabled
    order by season_row.season
  loop
    select min(event.occurred_at)
      into v_launch_at
    from private.notification_events event
    where event.source_key = 'mlb-launch:' || v_season.season::text;

    -- One public-launch announcement. No owner-preview notification can escape
    -- because private seasons never enter this loop.
    for v_recipient in
      select profile.id as profile_id
      from public.profiles profile
      join private.profile_pin_credentials credential
        on credential.profile_id = profile.id
      order by profile.id
    loop
      perform private.publish_notification_to_profile(
        v_recipient.profile_id,
        'mlb-launch:' || v_season.season::text,
        'mlb-launch:' || v_season.season::text,
        'mlb_launch_available',
        'Baseball is live',
        'The MLB Playoffs are live in The HQ. Make your bracket, series picks, and postseason challenges.',
        '/mlb',
        'ENTER BASEBALL',
        p_now
      );
      v_launch := v_launch + 1;
    end loop;

    -- The dated challenge is playable at midnight Central, but the device alert waits
    -- until 8 AM Central so a scheduled challenge never wakes members overnight.
    if v_central_time >= time '08:00' then
      select challenge.*
        into v_challenge
      from public.mlb_postseason_challenges challenge
      where challenge.season = v_season.season
        and challenge.scheduled_date = v_central_day
        and challenge.content_ready
      order by challenge.slot
      limit 1;

      if found then
        for v_recipient in
          select profile.id as profile_id
          from public.profiles profile
          join private.profile_pin_credentials credential
            on credential.profile_id = profile.id
          order by profile.id
        loop
          perform private.publish_notification_to_profile(
            v_recipient.profile_id,
            'mlb-challenge-available:' || v_season.season::text || ':' || v_challenge.challenge_key,
            'mlb-challenge-available:' || v_challenge.challenge_key,
            'mlb_challenge_available',
            'Today''s MLB Challenge is live',
            left(coalesce(nullif(trim(v_challenge.title), ''), 'The postseason challenge') || ' is ready in Baseball HQ.', 280),
            '/mlb/challenge',
            'PLAY NOW',
            p_now
          );
          v_challenge_available := v_challenge_available + 1;
        end loop;
      end if;
    end if;

    -- An MLB challenge stays active until the next scheduled challenge replaces it.
    -- Beginning at 8 PM Central on that final day, remind only members who have not
    -- completed the active challenge. The source key keeps retries idempotent.
    if v_central_time >= time '20:00' then
      select challenge.*
        into v_active_challenge
      from public.mlb_postseason_challenges challenge
      where challenge.season = v_season.season
        and challenge.scheduled_date is not null
        and challenge.scheduled_date <= v_central_day
        and challenge.content_ready
      order by challenge.scheduled_date desc, challenge.slot desc
      limit 1;

      if found then
        select min(challenge.scheduled_date)
          into v_next_challenge_date
        from public.mlb_postseason_challenges challenge
        where challenge.season = v_season.season
          and challenge.scheduled_date > v_active_challenge.scheduled_date;

        if v_next_challenge_date = v_central_day + 1 then
          for v_recipient in
            select profile.id as profile_id
            from public.profiles profile
            join private.profile_pin_credentials credential
              on credential.profile_id = profile.id
            where not exists (
              select 1
              from public.mlb_postseason_challenge_results result
              where result.season = v_season.season
                and result.challenge_key = v_active_challenge.challenge_key
                and result.profile_id = profile.id
            )
            order by profile.id
          loop
            perform private.publish_notification_to_profile(
              v_recipient.profile_id,
              'mlb-challenge-four-hours:' || v_season.season::text || ':' || v_active_challenge.challenge_key,
              'mlb-challenge-four-hours:' || v_active_challenge.challenge_key,
              'mlb_challenge_four_hours',
              'MLB Challenge ending soon',
              left(coalesce(nullif(trim(v_active_challenge.title), ''), 'The postseason challenge') ||
                ' closes at midnight Central. Play it before the next challenge goes live.', 280),
              '/mlb/challenge',
              'PLAY NOW',
              p_now
            );
            v_challenge_four_hours := v_challenge_four_hours + 1;
          end loop;
        end if;
      end if;
    end if;

    -- A newly published round is useful enough for both inbox and device push.
    -- Avoid an immediate double-push on initial public launch when the Wild Card
    -- slate was already present; if that slate is published after launch, it still
    -- receives its own round notification.
    if exists (
      select 1
      from public.mlb_playoff_series series_row
      where series_row.season = v_season.season
        and series_row.round = v_season.current_round
    )
      and (
        v_season.current_round <> 'wild_card'
        or (
          v_launch_at is not null
          and exists (
            select 1
            from public.mlb_playoff_series series_row
            where series_row.season = v_season.season
              and series_row.round = v_season.current_round
              and series_row.updated_at > v_launch_at
          )
        )
      )
    then
      v_round_label := case v_season.current_round
        when 'wild_card' then 'Wild Card'
        when 'division_series' then 'Division Series'
        when 'championship_series' then 'ALCS / NLCS'
        when 'world_series' then 'World Series'
        else 'MLB Playoff'
      end;

      for v_recipient in
        select profile.id as profile_id
        from public.profiles profile
        join private.profile_pin_credentials credential
          on credential.profile_id = profile.id
        order by profile.id
      loop
        perform private.publish_notification_to_profile(
          v_recipient.profile_id,
          'mlb-round-available:' || v_season.season::text || ':' || v_season.current_round,
          'mlb-round-available:' || v_season.season::text || ':' || v_season.current_round,
          'mlb_round_available',
          v_round_label || ' slate is live',
          'The next MLB playoff round is published. Make your series picks before the first game.',
          '/mlb/picks',
          'MAKE PICKS',
          p_now
        );
        v_round_available := v_round_available + 1;
      end loop;
    end if;

    -- Round-complete updates are the single MLB in-app-only notification. They are
    -- intentionally not push candidates.
    for v_round in
      select series_row.round
      from public.mlb_playoff_series series_row
      where series_row.season = v_season.season
      group by series_row.round
      having count(*) > 0
         and bool_and(series_row.status = 'complete' and series_row.winner_team_id is not null)
      order by min(series_row.position)
    loop
      v_round_label := case v_round.round
        when 'wild_card' then 'Wild Card'
        when 'division_series' then 'Division Series'
        when 'championship_series' then 'ALCS / NLCS'
        when 'world_series' then 'World Series'
        else 'MLB Playoff'
      end;

      for v_recipient in
        select profile.id as profile_id
        from public.profiles profile
        join private.profile_pin_credentials credential
          on credential.profile_id = profile.id
        order by profile.id
      loop
        perform private.publish_notification_to_profile(
          v_recipient.profile_id,
          'mlb-round-recap:' || v_season.season::text || ':' || v_round.round,
          'mlb-round-recap:' || v_season.season::text || ':' || v_round.round,
          'mlb_round_recap',
          v_round_label || ' complete',
          'The round is complete. Open Baseball HQ for the updated bracket and postseason picture.',
          '/mlb',
          'VIEW UPDATE',
          p_now
        );
        v_round_recap := v_round_recap + 1;
      end loop;
    end loop;
  end loop;

  return jsonb_build_object(
    'launch', v_launch,
    'challenge_available', v_challenge_available,
    'challenge_four_hours', v_challenge_four_hours,
    'round_available', v_round_available,
    'round_recap', v_round_recap
  );
end;
$$;

revoke all on function public.dispatch_due_mlb_notifications(timestamptz)
  from public, anon, authenticated;
grant execute on function public.dispatch_due_mlb_notifications(timestamptz)
  to service_role;

comment on function public.dispatch_due_mlb_notifications(timestamptz) is
  'Canonical MLB notification producer. Dormant until Baseball HQ is public; reuses the existing trusted scheduler wake-up.';

notify pgrst, 'reload schema';
