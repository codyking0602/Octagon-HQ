-- Make the Year 1 handoff explicit and keep completion independent from notifications.

alter table private.football_gm_participants
  add column if not exists year1_acknowledged_at timestamptz;

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
    'declined_at', challenge.declined_at
  )
  from public.play_challenges challenge
  join private.football_gm_matches match on match.challenge_id = challenge.id
  where challenge.id = p_challenge_id;
$$;

create or replace function private.acknowledge_football_gm_year1(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge_id uuid;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then
    raise exception 'The GM match not found';
  end if;

  if not exists (
    select 1
    from private.football_gm_participants participant
    where participant.challenge_id = v_challenge_id
      and participant.profile_id = v_user_id
      and participant.year1_result is not null
  ) then
    raise exception 'Year 1 result is not ready';
  end if;

  update private.football_gm_participants participant
  set year1_acknowledged_at = coalesce(participant.year1_acknowledged_at, now())
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function private.finish_football_gm_offseason(
  p_code text,
  p_run_state jsonb
)
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
  v_other_done boolean;
  v_overlap text;
  v_now timestamptz := now();
  v_actor_name text;
  v_code text;
  v_row record;
begin
  if v_user_id is null then raise exception 'sign in required'; end if;
  v_challenge_id := private.football_gm_primary_challenge_id(p_code, v_user_id);
  if v_challenge_id is null then raise exception 'The GM match not found'; end if;

  select match.* into v_match
  from private.football_gm_matches match
  where match.challenge_id = v_challenge_id
  for update;

  if v_match.phase <> 'offseason' or v_match.current_turn_profile_id <> v_user_id then
    raise exception 'It is not your offseason';
  end if;
  if private.football_gm_final_roster_count(p_run_state) <> 7 then
    raise exception 'Finish the seven-player core first';
  end if;
  if jsonb_typeof(p_run_state -> 'tradeChipPlayerIds') = 'array'
    and jsonb_array_length(p_run_state -> 'tradeChipPlayerIds') > 0 then
    raise exception 'Resolve displaced assets first';
  end if;

  select mine.player_id into v_overlap
  from unnest(private.football_gm_held_player_ids(p_run_state)) mine(player_id)
  join private.football_gm_participants opponent
    on opponent.challenge_id = v_challenge_id
   and opponent.profile_id <> v_user_id
  join unnest(private.football_gm_held_player_ids(opponent.run_state)) theirs(player_id)
    on theirs.player_id = mine.player_id
  limit 1;
  if v_overlap is not null then
    raise exception 'That player is already held by the other GM';
  end if;

  update private.football_gm_participants participant
  set run_state = p_run_state,
      offseason_completed_at = coalesce(participant.offseason_completed_at, v_now)
  where participant.challenge_id = v_challenge_id
    and participant.profile_id = v_user_id;

  select participant.profile_id,
         participant.offseason_completed_at is not null
    into v_other_id, v_other_done
  from private.football_gm_participants participant
  where participant.challenge_id = v_challenge_id
    and participant.profile_id <> v_user_id
  limit 1;

  select challenge.code into v_code
  from public.play_challenges challenge where challenge.id = v_challenge_id;

  if v_other_done then
    update private.football_gm_matches match
    set phase = 'complete',
        current_turn_profile_id = null,
        pending_team_code = null,
        completed_at = v_now,
        updated_at = v_now
    where match.challenge_id = v_challenge_id;

    update public.play_challenges challenge
    set completed_at = v_now,
        creator_result = jsonb_build_object('status', 'complete'),
        responder_result = jsonb_build_object('status', 'complete')
    where challenge.id = v_challenge_id;

    -- Completion is authoritative. Notification delivery must never roll it back.
    for v_row in
      select participant.profile_id
      from private.football_gm_participants participant
      where participant.challenge_id = v_challenge_id
    loop
      begin
        perform private.publish_notification_to_profile(
          v_row.profile_id,
          'gm-football:complete:' || v_challenge_id::text || ':' || v_row.profile_id::text,
          'play-challenges:completed',
          'game_challenge_result_ready',
          'The GM is complete',
          'Both front offices are locked. See the three-year result.',
          '/football/gm-mode?match=' || v_code,
          'SEE RESULT',
          v_now
        );
      exception when others then
        null;
      end;
    end loop;
  else
    update private.football_gm_matches match
    set current_turn_profile_id = v_other_id,
        updated_at = v_now
    where match.challenge_id = v_challenge_id;

    select profile.display_name into v_actor_name
    from public.profiles profile where profile.id = v_user_id;

    -- The handoff is already committed above; notification failure cannot block it.
    begin
      perform private.publish_notification_to_profile(
        v_other_id,
        'gm-football:offseason-turn:' || v_challenge_id::text || ':' || v_other_id::text,
        'play-challenges:received',
        'game_challenge_received',
        'Your offseason starts now',
        coalesce(v_actor_name, 'Your opponent') || ' finished the offseason. The remaining market is yours.',
        '/football/gm-mode?match=' || v_code,
        'OPEN FRONT OFFICE',
        v_now
      );
    exception when others then
      null;
    end;
  end if;

  return private.football_gm_state_json(v_challenge_id);
end;
$$;

create or replace function public.acknowledge_football_gm_year1(p_code text)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.acknowledge_football_gm_year1(p_code); $$;

revoke all on function private.acknowledge_football_gm_year1(text) from public, anon;
grant execute on function private.acknowledge_football_gm_year1(text) to authenticated;

revoke all on function public.acknowledge_football_gm_year1(text) from public, anon;
grant execute on function public.acknowledge_football_gm_year1(text) to authenticated;
