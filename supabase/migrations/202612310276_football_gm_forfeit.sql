-- The GM: active-match forfeit support aligned with other turn-based challenges.

alter table private.football_gm_matches
  add column if not exists forfeited_by_profile_id uuid references public.profiles(id) on delete set null,
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
  v_match private.football_gm_matches%rowtype;
  v_other_id uuid;
  v_actor_name text;
  v_code text;
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'The GM match not found';
  end if;

  select match.* into v_match
  from private.football_gm_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase = 'waiting' or v_match.started_at is null then
    raise exception 'The GM match has not started';
  end if;

  if v_match.phase = 'complete'
    or exists (
      select 1
      from public.play_challenges challenge
      where challenge.id = v_challenge_id
        and (challenge.declined_at is not null or challenge.completed_at is not null)
    ) then
    raise exception 'The GM match has already ended';
  end if;

  select participant.profile_id into v_other_id
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id <> v_user_id
  limit 1;

  select challenge.code, profile.display_name
    into v_code, v_actor_name
  from public.play_challenges challenge
  join public.profiles profile on profile.id = v_user_id
  where challenge.id = v_challenge_id;

  update private.football_gm_matches match
  set phase = 'complete',
      current_turn_profile_id = null,
      pending_team_code = null,
      completed_at = coalesce(match.completed_at, v_now),
      forfeited_by_profile_id = v_user_id,
      forfeited_at = coalesce(match.forfeited_at, v_now),
      updated_at = v_now
  where match.challenge_id = v_challenge_id;

  update public.play_challenges challenge
  set completed_at = coalesce(challenge.completed_at, v_now),
      creator_result = jsonb_build_object(
        'status', 'forfeit',
        'forfeited', v_user_id = challenge.creator_id,
        'forfeitedByProfileId', v_user_id
      ),
      responder_result = jsonb_build_object(
        'status', 'forfeit',
        'forfeited', v_user_id = challenge.recipient_id,
        'forfeitedByProfileId', v_user_id
      )
  where challenge.id = v_challenge_id;

  if v_other_id is not null then
    begin
      perform private.publish_notification_to_profile(
        v_other_id,
        'gm-football:forfeit:' || v_challenge_id::text || ':' || v_other_id::text,
        'play-challenges:results-ready',
        'game_challenge_result_ready',
        'The GM ended',
        coalesce(v_actor_name, 'Your opponent') || ' forfeited. You win the matchup.',
        '/football/gm-mode?match=' || v_code,
        'VIEW MATCHUP',
        v_now
      );
    exception when others then
      null;
    end;
  end if;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function public.forfeit_football_gm(p_code text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.forfeit_football_gm(p_code); $$;

revoke all on function private.forfeit_football_gm(text) from public, anon;
grant execute on function private.forfeit_football_gm(text) to authenticated;

revoke all on function public.forfeit_football_gm(text) from public, anon;
grant execute on function public.forfeit_football_gm(text) to authenticated;

comment on function public.forfeit_football_gm(text) is
  'Ends an active The GM head-to-head matchup as a forfeit and notifies the opponent.';
