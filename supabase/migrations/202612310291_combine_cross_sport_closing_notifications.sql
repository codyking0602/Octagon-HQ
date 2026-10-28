-- Collapse the existing UFC, Football and MLB 8 PM closing-soon notifications
-- into one canonical in-app row and one device-push candidate per member/day.
-- No scheduler, category, push setting, or other notification producer changes.
--
-- The original sport producers continue checking timing and participation.
-- Their two closing-only kinds are intercepted by the canonical publisher.
-- The first producer computes every eligible unfinished sport, and subsequent
-- producers reuse the same per-member, per-day source key.

create or replace function private.publish_combined_daily_closing_reminder(
  p_recipient_profile_id uuid,
  p_kind text,
  p_title text,
  p_summary text,
  p_route text,
  p_action_label text,
  p_occurred_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_day date := (p_occurred_at at time zone 'America/Chicago')::date;
  v_time time := (p_occurred_at at time zone 'America/Chicago')::time;
  v_sports text[] := array[]::text[];
  v_daily record;
  v_mlb record;
  v_next_mlb_day date;
  v_total integer;
  v_names text;
  v_title text;
  v_summary text;
  v_route text;
  v_action_label text;
begin
  -- Old single-sport messages from earlier on the deployment day must not
  -- cause a second push after this migration goes live.
  if exists (
    select 1
    from private.notification_events event
    where event.recipient_profile_id = p_recipient_profile_id
      and (
        event.source_key like 'daily-challenge-four-hours:%'
        or event.source_key like 'mlb-challenge-four-hours:%'
      )
      and (event.occurred_at at time zone 'America/Chicago')::date = v_day
  ) then
    return jsonb_build_object('id', null, 'aggregate_count', 0, 'created', false, 'suppressed', true);
  end if;

  -- Respect the existing 8:00-8:59 PM Central window for UFC and Football.
  if v_time >= time '20:00' and v_time < time '21:00' then
    for v_daily in
      select distinct on (schedule.sport)
        challenge.id, schedule.sport
      from private.daily_challenges challenge
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = challenge.schedule_version
      where challenge.central_day = v_day
        and schedule.sport in ('ufc', 'football')
      order by schedule.sport, challenge.published_at desc, challenge.id desc
    loop
      if not exists (
        select 1
        from private.daily_challenge_attempts attempt
        where attempt.daily_challenge_id = v_daily.id
          and attempt.profile_id = p_recipient_profile_id
          and attempt.attempt_kind = 'official_first'
      ) then
        v_sports := array_append(
          v_sports,
          case when v_daily.sport = 'ufc' then 'UFC' else 'Football' end
        );
      end if;
    end loop;
  end if;

  -- MLB reminder remains due only on its final day before the next
  -- scheduled challenge; do not remind members who already finished it.
  if v_time >= time '20:00' then
    for v_mlb in
      select distinct on (season.season)
        challenge.season, challenge.challenge_key, challenge.scheduled_date
      from public.mlb_playoff_seasons season
      join public.mlb_postseason_challenges challenge
        on challenge.season = season.season
      where season.public_enabled
        and challenge.content_ready
        and challenge.scheduled_date is not null
        and challenge.scheduled_date <= v_day
      order by season.season, challenge.scheduled_date desc, challenge.slot desc
    loop
      select min(challenge.scheduled_date)
        into v_next_mlb_day
      from public.mlb_postseason_challenges challenge
      where challenge.season = v_mlb.season
        and challenge.scheduled_date > v_mlb.scheduled_date;

      if v_next_mlb_day = v_day + 1
        and not exists (
          select 1
          from public.mlb_postseason_challenge_results result
          where result.season = v_mlb.season
            and result.challenge_key = v_mlb.challenge_key
            and result.profile_id = p_recipient_profile_id
        )
        and not ('MLB' = any(v_sports))
      then
        v_sports := array_append(v_sports, 'MLB');
      end if;
    end loop;
  end if;

  v_total := cardinality(v_sports);
  if v_total = 0 then
    return jsonb_build_object('id', null, 'aggregate_count', 0, 'created', false, 'suppressed', true);
  end if;

  -- Preserve the existing sport-specific message and deep link when only
  -- one challenge remains. Mixed sports lead back to the HQ home selector.
  if v_total = 1 then
    v_title := p_title;
    v_summary := p_summary;
    v_route := p_route;
    v_action_label := p_action_label;
  else
    v_names := case
      when v_total = 2 then v_sports[1] || ' and ' || v_sports[2]
      else array_to_string(v_sports[1:v_total - 1], ', ') || ' and ' || v_sports[v_total]
    end;
    v_title := 'Daily challenges close soon';
    v_summary := 'Your ' || v_names || ' challenges close at midnight Central. Play them before the next challenges go live.';
    v_route := '/';
    v_action_label := 'PLAY TODAY';
  end if;

  return private.publish_notification_to_profile_ufc_recap_core(
    p_recipient_profile_id,
    'daily-closing-combined:' || v_day::text || ':' || p_recipient_profile_id::text,
    'daily-closing-combined',
    case when v_total = 1 and v_sports[1] = 'MLB'
      then 'mlb_challenge_four_hours'
      else 'daily_challenge_four_hours'
    end,
    v_title,
    left(v_summary, 280),
    v_route,
    v_action_label,
    p_occurred_at
  );
end;
$function$;

-- Retain all non-closing notification kinds and existing owner-only suppression.
create or replace function private.publish_notification_to_profile(
  p_recipient_profile_id uuid,
  p_source_key text,
  p_aggregation_key text,
  p_kind text,
  p_title text,
  p_summary text,
  p_route text default null::text,
  p_action_label text default null::text,
  p_occurred_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if trim(coalesce(p_kind, '')) = 'event_ready_to_complete'
    or trim(coalesce(p_source_key, '')) like 'event-ready-to-complete:%'
  then
    return jsonb_build_object('id', null, 'aggregate_count', 0, 'created', false, 'suppressed', true);
  end if;

  if trim(coalesce(p_kind, '')) in ('daily_challenge_four_hours', 'mlb_challenge_four_hours') then
    return private.publish_combined_daily_closing_reminder(
      p_recipient_profile_id,
      p_kind,
      p_title,
      p_summary,
      p_route,
      p_action_label,
      coalesce(p_occurred_at, now())
    );
  end if;

  return private.publish_notification_to_profile_ufc_recap_core(
    p_recipient_profile_id,
    p_source_key,
    p_aggregation_key,
    p_kind,
    p_title,
    p_summary,
    p_route,
    p_action_label,
    p_occurred_at
  );
end;
$function$;
