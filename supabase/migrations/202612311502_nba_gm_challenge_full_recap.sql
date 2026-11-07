-- NBA GM matchups own immutable, server-scored franchise summaries.
-- Project only completed runs for the two participants of a completed challenge.
create or replace function private.nba_gm_challenge_recap_side(p_state jsonb)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'score', p_state->'scoreBreakdown'->'score',
    'rosterGrade', p_state->'scoreBreakdown'->'roster',
    'recordGrade', p_state->'scoreBreakdown'->'regularSeason',
    'playoffGrade', p_state->'scoreBreakdown'->'playoffs',
    'weights', p_state->'scoreBreakdown'->'weights',
    'seasons', coalesce((
      select jsonb_agg(jsonb_build_object(
        'year', season.item->'season',
        'overall', season.item->'teamOverall',
        'wins', season.item->'wins',
        'losses', season.item->'losses',
        'finish', season.item->'finish',
        'titleOdds', season.item->'titleOdds'
      ) order by season.ord)
      from jsonb_array_elements(coalesce(p_state->'results', '[]'::jsonb))
        with ordinality as season(item, ord)
    ), '[]'::jsonb),
    'openingRoster', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slot', selection.pick->>'slot',
        'playerId', athlete.id,
        'name', athlete.name,
        'teamCode', athlete.team_code,
        'nbaPlayerId', athlete.official_nba_player_id
      ) order by selection.ord)
      from jsonb_array_elements(coalesce(p_state->'yearOnePicks', '[]'::jsonb))
        with ordinality as selection(pick, ord)
      join private.nba_gm_dev_players athlete
        on athlete.id = selection.pick->>'playerId'
    ), '[]'::jsonb),
    'finalRoster', coalesce((
      select jsonb_agg(jsonb_build_object(
        'slot', selection.pick->>'slot',
        'playerId', athlete.id,
        'name', athlete.name,
        'teamCode', athlete.team_code,
        'nbaPlayerId', athlete.official_nba_player_id,
        'developmentDelta', case
          when (p_state->'development'->athlete.id->>'year3Grade') is not null
            and (p_state->'development'->athlete.id->>'startingGrade') is not null
          then round((
            (p_state->'development'->athlete.id->>'year3Grade')::numeric
            - (p_state->'development'->athlete.id->>'startingGrade')::numeric
          ), 1)
          else null end
      ) order by selection.ord)
      from jsonb_array_elements(coalesce(p_state->'picks', '[]'::jsonb))
        with ordinality as selection(pick, ord)
      join private.nba_gm_dev_players athlete
        on athlete.id = selection.pick->>'playerId'
    ), '[]'::jsonb)
  );
$$;

revoke all on function private.nba_gm_challenge_recap_side(jsonb) from public, anon, authenticated;

create or replace function public.nba_gm_challenge_recap(p_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_creator_state jsonb;
  v_responder_state jsonb;
begin
  if v_user is null or p_code is null or upper(trim(p_code)) !~ '^[A-Z0-9]{8}$' then
    return null;
  end if;

  select c.* into v_challenge
  from public.play_challenges c
  where c.code = upper(trim(p_code))
    and c.game_id = 'gm-nba'
    and c.completed_at is not null
    and c.responder_result is not null
    and c.declined_at is null
    and (
      (c.creator_id = v_user and c.creator_hidden_at is null)
      or (c.recipient_id = v_user and c.recipient_hidden_at is null)
    );

  if not found then return null; end if;

  select r.state into v_creator_state
  from private.football_gm_runs r
  where r.profile_id = v_challenge.creator_id
    and r.game_version = 'nba-gm-dev-v2'
    and r.seed = v_challenge.creator_result->>'seed'
    and r.state->>'phase' = 'final'
  order by r.completed_at desc nulls last, r.updated_at desc
  limit 1;

  select r.state into v_responder_state
  from private.football_gm_runs r
  where r.profile_id = v_challenge.recipient_id
    and r.game_version = 'nba-gm-dev-v2'
    and r.seed = v_challenge.responder_result->>'seed'
    and r.state->>'phase' = 'final'
  order by r.completed_at desc nulls last, r.updated_at desc
  limit 1;

  if v_creator_state is null or v_responder_state is null
    or v_creator_state->'scoreBreakdown' is null
    or v_responder_state->'scoreBreakdown' is null
    or v_creator_state->'scoreBreakdown'->>'score' is distinct from v_challenge.creator_result->>'score'
    or v_responder_state->'scoreBreakdown'->>'score' is distinct from v_challenge.responder_result->>'score'
  then
    return null;
  end if;

  return jsonb_build_object(
    'creator', private.nba_gm_challenge_recap_side(v_creator_state),
    'responder', private.nba_gm_challenge_recap_side(v_responder_state)
  );
end;
$$;

revoke all on function public.nba_gm_challenge_recap(text) from public, anon;
grant execute on function public.nba_gm_challenge_recap(text) to authenticated;
