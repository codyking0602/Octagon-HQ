-- Hotfix Wheel of Football multiplayer pick transitions.
-- The 2-4 player rollout cleared pending_team_code while the row was still
-- phase='pick', violating the existing phase-state check constraint before the
-- function could advance to the next player's spin. Keep that row valid until
-- the atomic phase transition.

create or replace function private.pick_wheel_football(
  p_code text,
  p_athlete_id text,
  p_display_name text,
  p_position_label text,
  p_position_abbreviation text,
  p_roster_slot text,
  p_headshot_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_room public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_abbreviation text := upper(trim(coalesce(p_position_abbreviation, '')));
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_next_turn_count integer;
  v_next_profile uuid;
  v_actor_name text;
  v_actor_seat integer;
  v_seat_count integer;
  v_incomplete_count integer;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.wheel_football_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'Wheel of Football match not found';
  end if;

  select challenge.*
    into v_room
  from public.play_challenges challenge
  where challenge.id = v_challenge_id;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase = 'complete' or v_match.completed_at is not null then
    raise exception 'This Wheel of Football match is closed';
  end if;

  if v_match.current_turn_profile_id <> v_user_id
    or v_match.phase <> 'pick'
    or v_match.pending_team_code is null then
    raise exception 'It is not your pick';
  end if;

  if not exists (
    select 1
    from private.wheel_football_participants participant
    where participant.challenge_id = v_challenge_id
      and participant.profile_id = v_user_id
      and participant.accepted_at is not null
      and participant.forfeited_at is null
  ) then
    raise exception 'You are not an active player in this match';
  end if;

  if v_slot not in ('QB', 'RB', 'WR', 'Flex', 'Front Seven', 'Secondary', 'Head Coach') then
    raise exception 'invalid Superteam roster slot';
  end if;

  if not (
    (v_slot = 'QB' and v_abbreviation = 'QB')
    or (v_slot = 'RB' and v_abbreviation = 'RB')
    or (v_slot = 'WR' and v_abbreviation = 'WR')
    or (v_slot = 'Flex' and v_abbreviation in ('RB', 'WR', 'TE'))
    or (v_slot = 'Front Seven' and v_abbreviation in ('DE', 'DT', 'NT', 'DL', 'LB', 'ILB', 'OLB', 'EDGE'))
    or (v_slot = 'Secondary' and v_abbreviation in ('CB', 'S', 'FS', 'SS', 'DB'))
    or (v_slot = 'Head Coach' and v_abbreviation = 'HC')
  ) then
    raise exception 'That player is not eligible for that Superteam slot';
  end if;

  if char_length(trim(coalesce(p_athlete_id, ''))) = 0
    or char_length(trim(coalesce(p_display_name, ''))) = 0
    or char_length(trim(coalesce(p_position_label, ''))) = 0 then
    raise exception 'invalid player selection';
  end if;

  if exists (
    select 1
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge_id
      and pick.profile_id = v_user_id
      and pick.roster_slot = v_slot
  ) then
    raise exception 'That Superteam slot is already filled';
  end if;

  if exists (
    select 1
    from private.wheel_football_picks drafted
    where drafted.challenge_id = v_challenge_id
      and drafted.team_code = v_match.pending_team_code
      and private.wheel_football_position_group(
        drafted.roster_slot,
        drafted.position_abbreviation
      ) = private.wheel_football_position_group(v_slot, v_abbreviation)
      and private.wheel_football_grade_base_name_key(drafted.display_name)
        = private.wheel_football_grade_base_name_key(trim(p_display_name))
  ) then
    raise exception 'That player or coach was already drafted in this match';
  end if;

  v_next_turn_count := v_match.turn_count + 1;

  insert into private.wheel_football_picks (
    challenge_id,
    profile_id,
    turn_number,
    team_code,
    roster_slot,
    athlete_id,
    display_name,
    position_label,
    position_abbreviation,
    headshot_url
  ) values (
    v_challenge_id,
    v_user_id,
    v_next_turn_count,
    v_match.pending_team_code,
    v_slot,
    trim(p_athlete_id),
    trim(p_display_name),
    trim(p_position_label),
    v_abbreviation,
    nullif(trim(coalesce(p_headshot_url, '')), '')
  );

  update private.wheel_football_participants participant
  set last_team_code = v_match.pending_team_code
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  -- Keep the pending team attached while phase='pick'. Clearing it here
  -- creates an invalid transient row under wheel_football_phase_state_valid.
  -- The later terminal transition clears it atomically with phase='spin' or
  -- private.finish_wheel_football clears it with phase='complete'.
  update private.wheel_football_matches match
  set turn_count = v_next_turn_count,
      updated_at = now()
  where match.challenge_id = v_challenge_id;

  select count(*)::integer
    into v_incomplete_count
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.forfeited_at is null
    and (
      select count(*)
      from private.wheel_football_picks pick
      where pick.challenge_id = v_challenge_id
        and pick.profile_id = participant.profile_id
    ) < 7;

  if v_incomplete_count = 0 then
    perform private.finish_wheel_football(v_challenge_id, false);
    return private.wheel_football_state_json(v_challenge_id);
  end if;

  select participant.seat_order
    into v_actor_seat
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  select count(*)::integer
    into v_seat_count
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id;

  select participant.profile_id
    into v_next_profile
  from private.wheel_football_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.forfeited_at is null
    and (
      select count(*)
      from private.wheel_football_picks pick
      where pick.challenge_id = v_challenge_id
        and pick.profile_id = participant.profile_id
    ) < 7
  order by case
    when participant.seat_order > v_actor_seat
      then participant.seat_order - v_actor_seat
    else participant.seat_order + v_seat_count - v_actor_seat
  end
  limit 1;

  update private.wheel_football_matches match
  set phase = 'spin',
      current_turn_profile_id = v_next_profile,
      pending_team_code = null,
      updated_at = now()
  where match.challenge_id = v_challenge_id;

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_user_id;

  perform private.publish_notification_to_profile(
    v_next_profile,
    'wheel-football:turn:' || v_room.code || ':' || v_next_turn_count::text || ':' || v_next_profile::text,
    'play-challenges:received',
    'game_challenge_received',
    'Your turn in Wheel of Football',
    coalesce(v_actor_name, 'Another player') || ' made a pick. Spin for your next team.',
    '/football/wheel?match=' || v_room.code,
    'TAKE YOUR TURN',
    now()
  );

  return private.wheel_football_state_json(v_challenge_id);
end;
$$;


