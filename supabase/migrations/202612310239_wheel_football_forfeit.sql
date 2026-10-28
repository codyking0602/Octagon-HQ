-- Wheel of Football: explicit active-match forfeit support.

alter table private.wheel_football_matches
  add column if not exists forfeited_by_profile_id uuid references public.profiles(id) on delete restrict,
  add column if not exists forfeited_at timestamptz;

create or replace function private.wheel_football_state_json(p_challenge_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'code', challenge.code,
    'pool_scope', match.pool_scope,
    'division', match.division,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_team', case when pending.code is null then null else jsonb_build_object(
      'code', pending.code,
      'name', pending.name,
      'conference', pending.conference,
      'division', pending.division
    ) end,
    'creator', jsonb_build_object(
      'id', challenge.creator_id,
      'display_name', creator.display_name
    ),
    'recipient', jsonb_build_object(
      'id', challenge.recipient_id,
      'display_name', recipient.display_name
    ),
    'creator_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.creator_id
    ), '[]'::jsonb),
    'recipient_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at,
    'forfeited_by_profile_id', match.forfeited_by_profile_id,
    'forfeited_at', match.forfeited_at
  )
  from public.play_challenges challenge
  join private.wheel_football_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  left join private.wheel_football_teams pending on pending.code = match.pending_team_code
  where challenge.id = p_challenge_id;
$$;

create or replace function private.forfeit_wheel_football(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_opponent_id uuid;
  v_actor_name text;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-football'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id)
  for update;

  if not found then
    raise exception 'Wheel of Football match not found';
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge.id
  for update;

  if not found then
    raise exception 'Wheel of Football state not found';
  end if;

  if v_challenge.opened_at is null then
    raise exception 'match has not started';
  end if;

  if v_challenge.declined_at is not null or v_challenge.completed_at is not null or v_match.phase = 'complete' then
    raise exception 'match has already ended';
  end if;

  v_opponent_id := case
    when v_user_id = v_challenge.creator_id then v_challenge.recipient_id
    else v_challenge.creator_id
  end;

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_user_id;

  update private.wheel_football_matches match
  set phase = 'complete',
      current_turn_profile_id = null,
      pending_team_code = null,
      completed_at = v_now,
      forfeited_by_profile_id = v_user_id,
      forfeited_at = v_now,
      updated_at = v_now
  where match.challenge_id = v_challenge.id;

  update public.play_challenges challenge
  set creator_result = jsonb_build_object(
        'complete', true,
        'forfeited', v_user_id = v_challenge.creator_id,
        'forfeitedByProfileId', v_user_id
      ),
      responder_result = jsonb_build_object(
        'complete', true,
        'forfeited', v_user_id = v_challenge.recipient_id,
        'forfeitedByProfileId', v_user_id
      ),
      completed_at = v_now,
      opened_at = coalesce(challenge.opened_at, v_now)
  where challenge.id = v_challenge.id;

  perform private.publish_notification_to_profile(
    v_opponent_id,
    'wheel-football:forfeit:' || v_challenge.code || ':' || v_opponent_id::text,
    'play-challenges:results-ready',
    'game_challenge_result_ready',
    'Wheel of Football ended',
    v_actor_name || ' forfeited. You win the matchup.',
    '/football/wheel?match=' || v_challenge.code,
    'VIEW MATCHUP',
    v_now
  );

  return private.wheel_football_state_json(v_challenge.id);
end;
$$;

create or replace function public.forfeit_wheel_football(p_code text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.forfeit_wheel_football(p_code);
$$;

revoke all on function private.forfeit_wheel_football(text) from public, anon;
revoke all on function public.forfeit_wheel_football(text) from public, anon;

grant execute on function private.forfeit_wheel_football(text) to authenticated;
grant execute on function public.forfeit_wheel_football(text) to authenticated;

comment on function public.forfeit_wheel_football(text) is
  'Ends an active Wheel of Football matchup as a forfeit, preserving all completed picks and notifying the opponent.';
