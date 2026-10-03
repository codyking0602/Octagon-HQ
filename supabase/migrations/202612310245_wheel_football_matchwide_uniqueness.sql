-- Wheel of Football match-wide draft uniqueness.
-- Once either participant drafts a player or coach, that identity is unavailable
-- to both sides for the rest of the matchup.

create unique index if not exists wheel_football_picks_challenge_athlete_unique
  on private.wheel_football_picks (challenge_id, athlete_id);

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
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_abbreviation text := upper(trim(coalesce(p_position_abbreviation, '')));
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_next_turn_count integer;
  v_next_profile uuid;
  v_actor_name text;
  v_creator_roster jsonb;
  v_recipient_roster jsonb;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-football'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id);

  if not found then
    raise exception 'Wheel of Football match not found';
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge.id
  for update;

  if v_challenge.declined_at is not null or v_challenge.completed_at is not null then
    raise exception 'This Wheel of Football match is closed';
  end if;

  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'pick' or v_match.pending_team_code is null then
    raise exception 'It is not your pick';
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
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_user_id
      and pick.roster_slot = v_slot
  ) then
    raise exception 'That Superteam slot is already filled';
  end if;

  if exists (
    select 1
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.athlete_id = trim(p_athlete_id)
  ) then
    raise exception 'That player has already been drafted in this matchup';
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
    v_challenge.id,
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

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_user_id;

  if v_next_turn_count = 14 then
    update private.wheel_football_matches match
    set turn_count = 14,
        phase = 'complete',
        current_turn_profile_id = null,
        pending_team_code = null,
        creator_last_team_code = case when v_user_id = v_challenge.creator_id then v_match.pending_team_code else match.creator_last_team_code end,
        recipient_last_team_code = case when v_user_id = v_challenge.recipient_id then v_match.pending_team_code else match.recipient_last_team_code end,
        completed_at = now(),
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    select coalesce(jsonb_agg(
      jsonb_build_object(
        'turnNumber', pick.turn_number,
        'teamCode', pick.team_code,
        'rosterSlot', pick.roster_slot,
        'athleteId', pick.athlete_id,
        'displayName', pick.display_name,
        'position', pick.position_abbreviation
      )
      order by pick.turn_number
    ), '[]'::jsonb)
      into v_creator_roster
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_challenge.creator_id;

    select coalesce(jsonb_agg(
      jsonb_build_object(
        'turnNumber', pick.turn_number,
        'teamCode', pick.team_code,
        'rosterSlot', pick.roster_slot,
        'athleteId', pick.athlete_id,
        'displayName', pick.display_name,
        'position', pick.position_abbreviation
      )
      order by pick.turn_number
    ), '[]'::jsonb)
      into v_recipient_roster
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_challenge.recipient_id;

    update public.play_challenges challenge
    set creator_result = jsonb_build_object('complete', true, 'roster', v_creator_roster),
        responder_result = jsonb_build_object('complete', true, 'roster', v_recipient_roster),
        completed_at = now(),
        opened_at = coalesce(challenge.opened_at, now())
    where challenge.id = v_challenge.id;

    v_next_profile := case
      when v_user_id = v_challenge.creator_id then v_challenge.recipient_id
      else v_challenge.creator_id
    end;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-football:complete:' || v_challenge.code || ':' || v_next_profile::text,
      'play-challenges:results-ready',
      'game_challenge_result_ready',
      'Wheel of Football is complete',
      v_actor_name || ' made the final pick. Both Superteams are locked.',
      '/football/wheel?match=' || v_challenge.code,
      'VIEW SUPERTEAMS',
      now()
    );
  else
    v_next_profile := case
      when v_user_id = v_challenge.creator_id then v_challenge.recipient_id
      else v_challenge.creator_id
    end;

    update private.wheel_football_matches match
    set turn_count = v_next_turn_count,
        phase = 'spin',
        current_turn_profile_id = v_next_profile,
        pending_team_code = null,
        creator_last_team_code = case when v_user_id = v_challenge.creator_id then v_match.pending_team_code else match.creator_last_team_code end,
        recipient_last_team_code = case when v_user_id = v_challenge.recipient_id then v_match.pending_team_code else match.recipient_last_team_code end,
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-football:turn:' || v_challenge.code || ':' || v_next_turn_count::text || ':' || v_next_profile::text,
      'play-challenges:received',
      'game_challenge_received',
      'Your turn in Wheel of Football',
      v_actor_name || ' made a pick. Spin for your next team.',
      '/football/wheel?match=' || v_challenge.code,
      'TAKE YOUR TURN',
      now()
    );
  end if;

  return private.wheel_football_state_json(v_challenge.id);
end;
$$;


comment on index private.wheel_football_picks_challenge_athlete_unique is
  'Prevents the same Wheel athlete/coach identity from being drafted by both participants in one matchup.';

comment on function private.pick_wheel_football(text, text, text, text, text, text, text) is
  'Locks one eligible current NFL player or head coach into one open Superteam slot; any identity already drafted by either participant is unavailable.';
