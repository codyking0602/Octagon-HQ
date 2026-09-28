-- Public launch for 2026 Baseball HQ.
-- Keep the canonical launch push, but suppress a duplicate challenge-live push
-- for a challenge that was already active on the day MLB becomes public.

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

      -- Do not double-push the challenge that is already live on the day Baseball HQ launches.
      -- Normal challenge pushes begin with the first scheduled challenge after the public launch date.
      if found
        and v_launch_at is not null
        and v_challenge.scheduled_date > (v_launch_at at time zone 'America/Chicago')::date
      then
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

update public.mlb_playoff_seasons
set public_enabled = true,
    updated_at = now()
where season = 2026
  and field_ready = true;

do $$
begin
  if not exists (
    select 1
    from public.mlb_playoff_seasons
    where season = 2026
      and public_enabled = true
      and field_ready = true
  ) then
    raise exception '2026 MLB public launch gate did not open';
  end if;
end;
$$;

comment on function public.dispatch_due_mlb_notifications(timestamptz) is
  'Canonical MLB notification producer. Launch day sends only the MLB launch push; normal challenge pushes begin with the first later scheduled challenge.';

notify pgrst, 'reload schema';
