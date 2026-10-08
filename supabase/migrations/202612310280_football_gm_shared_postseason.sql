-- Lock the shared playoff universe for BOTH head-to-head GMs, atomically
-- on the second offseason completion. The opponent cannot rewrite a season.

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
  set run_state = p_run_state - 'opponentResolvedSeasons',
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
    -- Second GM is closing the shared bracket. Do not accept independent
    -- postseason outcomes, incomplete arrays, or conflicting finalists.
    if jsonb_typeof(p_run_state -> 'resolvedSeasons') is distinct from 'array'
       or jsonb_array_length(p_run_state -> 'resolvedSeasons') <> 3
       or jsonb_typeof(p_run_state -> 'opponentResolvedSeasons') is distinct from 'array'
       or jsonb_array_length(p_run_state -> 'opponentResolvedSeasons') <> 3 then
      raise exception 'Both shared three-year postseason results must be locked together';
    end if;
    if exists (
      select 1
      from generate_series(0, 2) season(index)
      where (p_run_state -> 'resolvedSeasons' -> season.index ->> 'finish') is null
         or (p_run_state -> 'opponentResolvedSeasons' -> season.index ->> 'finish') is null
         or (
           (p_run_state -> 'resolvedSeasons' -> season.index ->> 'finish')
             = (p_run_state -> 'opponentResolvedSeasons' -> season.index ->> 'finish')
           and (p_run_state -> 'resolvedSeasons' -> season.index ->> 'finish')
             in ('Champion', 'Super Bowl Loss')
         )
    ) then
      raise exception 'A season cannot contain duplicate Super Bowl outcomes';
    end if;

    update private.football_gm_participants participant
    set run_state = jsonb_set(
      participant.run_state, '{resolvedSeasons}',
      p_run_state -> 'opponentResolvedSeasons', true
    )
    where participant.challenge_id = v_challenge_id
      and participant.profile_id = v_other_id;

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
