-- The GM: explicit active-match forfeit support.

alter table private.football_gm_matches
  add column if not exists forfeited_by_profile_id uuid references public.profiles(id) on delete restrict,
  add column if not exists forfeited_at timestamptz;

create or replace function private.football_gm_state_json(p_challenge_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'code', challenge.code,
    'seed', match.seed,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_team_code', match.pending_team_code,
    'offseason_first_profile_id', match.offseason_first_profile_id,
    'participants', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', participant.profile_id,
          'display_name', profile.display_name,
          'seat_order', participant.seat_order,
          'accepted', participant.accepted_at is not null,
          'run_state', participant.run_state,
          'year1_result', participant.year1_result,
          'year1_acknowledged', participant.year1_acknowledged_at is not null,
          'offseason_complete', participant.offseason_completed_at is not null
        )
        order by participant.seat_order
      )
      from private.football_gm_participants participant
      join public.profiles profile on profile.id = participant.profile_id
      where participant.challenge_id = challenge.id
    ), '[]'::jsonb),
    'opened_at', match.started_at,
    'completed_at', match.completed_at,
    'declined_at', challenge.declined_at,
    'forfeited_by_profile_id', match.forfeited_by_profile_id,
    'forfeited_at', match.forfeited_at
  )
  from public.play_challenges challenge
  join private.football_gm_matches match on match.challenge_id = challenge.id
  where challenge.id = p_challenge_id;
$$;

create or replace function private.forfeit_football_gm(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
  v_challenge public.play_challenges%rowtype;
  v_match private.football_gm_matches%rowtype;
  v_opponent_id uuid;
  v_actor_name text;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'The GM match not found';
  end if;

  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.id = v_challenge_id
  for update;

  select match.*
    into v_match
  from private.football_gm_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if not found then
    raise exception 'The GM state not found';
  end if;

  if v_match.phase = 'waiting' or v_match.started_at is null then
    raise exception 'match has not started';
  end if;

  if v_challenge.declined_at is not null
    or v_challenge.completed_at is not null
    or v_match.phase = 'complete' then
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

  update private.football_gm_matches match
  set phase = 'complete',
      current_turn_profile_id = null,
      pending_team_code = null,
      completed_at = v_now,
      forfeited_by_profile_id = v_user_id,
      forfeited_at = v_now,
      updated_at = v_now
  where match.challenge_id = v_challenge_id;

  update public.play_challenges challenge
  set creator_result = jsonb_build_object(
        'status', 'complete',
        'forfeited', v_user_id = v_challenge.creator_id,
        'forfeitedByProfileId', v_user_id
      ),
      responder_result = jsonb_build_object(
        'status', 'complete',
        'forfeited', v_user_id = v_challenge.recipient_id,
        'forfeitedByProfileId', v_user_id
      ),
      completed_at = v_now,
      opened_at = coalesce(challenge.opened_at, v_now)
  where challenge.id = v_challenge_id;

  begin
    perform private.publish_notification_to_profile(
      v_opponent_id,
      'gm-football:forfeit:' || v_challenge.code || ':' || v_opponent_id::text,
      'play-challenges:results-ready',
      'game_challenge_result_ready',
      'The GM ended',
      coalesce(v_actor_name, 'Your opponent') || ' forfeited. You win the matchup.',
      '/football/gm-mode?match=' || v_challenge.code,
      'VIEW MATCHUP',
      v_now
    );
  exception when others then
    null;
  end;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function public.forfeit_football_gm(p_code text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.forfeit_football_gm(p_code);
$$;

revoke all on function private.forfeit_football_gm(text) from public, anon;
revoke all on function public.forfeit_football_gm(text) from public, anon;

grant execute on function private.forfeit_football_gm(text) to authenticated;
grant execute on function public.forfeit_football_gm(text) to authenticated;

comment on function public.forfeit_football_gm(text) is
  'Ends an active The GM head-to-head matchup as a forfeit, preserving roster progress and notifying the opponent.';
