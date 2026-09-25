-- MLB Play challenge result persistence + social leaderboard.
-- Mirrors the Daily Challenge unlock rule: finish the current challenge before
-- seeing anyone else's result details.

alter table public.mlb_postseason_challenge_results
  add column if not exists game_type text not null default 'unknown',
  add column if not exists public_result jsonb not null default '{}'::jsonb,
  add column if not exists result_detail jsonb not null default '{}'::jsonb;

alter table public.mlb_postseason_challenge_results
  drop constraint if exists mlb_postseason_challenge_results_score_range,
  drop constraint if exists mlb_postseason_challenge_results_game_type_check,
  drop constraint if exists mlb_postseason_challenge_results_public_result_object,
  drop constraint if exists mlb_postseason_challenge_results_result_detail_object;

alter table public.mlb_postseason_challenge_results
  add constraint mlb_postseason_challenge_results_score_range
    check (raw_score between 0 and 100),
  add constraint mlb_postseason_challenge_results_game_type_check
    check (length(trim(game_type)) between 1 and 64),
  add constraint mlb_postseason_challenge_results_public_result_object
    check (jsonb_typeof(public_result) = 'object'),
  add constraint mlb_postseason_challenge_results_result_detail_object
    check (jsonb_typeof(result_detail) = 'object');

create or replace function public.record_mlb_postseason_challenge_result(
  p_season integer,
  p_challenge_key text,
  p_raw_score numeric,
  p_game_type text,
  p_public_result jsonb default '{}'::jsonb,
  p_result_detail jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_row public.mlb_postseason_challenge_results;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if not public.mlb_playoffs_can_view(p_season) then
    raise exception 'mlb_playoffs_not_available';
  end if;

  if p_challenge_key is null
    or not exists (
      select 1
      from public.mlb_postseason_challenges challenge
      where challenge.season = p_season
        and challenge.challenge_key = p_challenge_key
    )
  then
    raise exception 'mlb_play_challenge_not_found';
  end if;

  if p_raw_score is null or p_raw_score < 0 or p_raw_score > 100 then
    raise exception 'invalid MLB Play score';
  end if;

  if nullif(trim(p_game_type), '') is null or char_length(trim(p_game_type)) > 64 then
    raise exception 'invalid MLB Play game type';
  end if;

  if p_public_result is null or jsonb_typeof(p_public_result) <> 'object'
    or p_result_detail is null or jsonb_typeof(p_result_detail) <> 'object'
  then
    raise exception 'invalid MLB Play result detail';
  end if;

  insert into public.mlb_postseason_challenge_results (
    season,
    challenge_key,
    profile_id,
    raw_score,
    game_type,
    public_result,
    result_detail,
    completed_at,
    updated_at
  )
  values (
    p_season,
    p_challenge_key,
    v_profile_id,
    p_raw_score,
    trim(p_game_type),
    p_public_result,
    p_result_detail,
    now(),
    now()
  )
  on conflict (season, challenge_key, profile_id) do nothing;

  select *
    into v_row
  from public.mlb_postseason_challenge_results result
  where result.season = p_season
    and result.challenge_key = p_challenge_key
    and result.profile_id = v_profile_id;

  return jsonb_build_object(
    'season', v_row.season,
    'challenge_key', v_row.challenge_key,
    'raw_score', v_row.raw_score,
    'game_type', v_row.game_type,
    'public_result', v_row.public_result,
    'result_detail', v_row.result_detail,
    'completed_at', v_row.completed_at
  );
end;
$$;

create or replace function public.get_mlb_postseason_challenge_overview(
  p_season integer,
  p_challenge_key text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_unlocked boolean := false;
  v_own jsonb := null;
  v_entries jsonb := '[]'::jsonb;
  v_count integer := 0;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if not public.mlb_playoffs_can_view(p_season) then
    raise exception 'mlb_playoffs_not_available';
  end if;

  if p_challenge_key is null
    or not exists (
      select 1
      from public.mlb_postseason_challenges challenge
      where challenge.season = p_season
        and challenge.challenge_key = p_challenge_key
    )
  then
    raise exception 'mlb_play_challenge_not_found';
  end if;

  select jsonb_build_object(
    'raw_score', result.raw_score,
    'game_type', result.game_type,
    'public_result', result.public_result,
    'result_detail', result.result_detail,
    'completed_at', result.completed_at
  )
    into v_own
  from public.mlb_postseason_challenge_results result
  where result.season = p_season
    and result.challenge_key = p_challenge_key
    and result.profile_id = v_profile_id;

  v_unlocked := v_own is not null;

  if v_unlocked then
    with ranked as (
      select
        result.profile_id,
        profile.display_name,
        profile.initials,
        preference.avatar_photo_data,
        result.raw_score,
        result.game_type,
        result.public_result,
        result.result_detail,
        result.completed_at,
        rank() over (
          order by result.raw_score desc, result.completed_at asc
        )::integer as score_rank
      from public.mlb_postseason_challenge_results result
      join public.profiles profile
        on profile.id = result.profile_id
      left join public.profile_preferences preference
        on preference.profile_id = result.profile_id
      where result.season = p_season
        and result.challenge_key = p_challenge_key
    )
    select
      count(*)::integer,
      coalesce(jsonb_agg(
        jsonb_build_object(
          'rank', ranked.score_rank,
          'profile_id', ranked.profile_id,
          'display_name', ranked.display_name,
          'initials', ranked.initials,
          'avatar_photo_data', ranked.avatar_photo_data,
          'raw_score', ranked.raw_score,
          'game_type', ranked.game_type,
          'public_result', ranked.public_result,
          'result_detail', ranked.result_detail,
          'completed_at', ranked.completed_at,
          'is_current_user', ranked.profile_id = v_profile_id
        )
        order by ranked.score_rank, ranked.display_name
      ), '[]'::jsonb)
      into v_count, v_entries
    from ranked;
  end if;

  return jsonb_build_object(
    'unlocked', v_unlocked,
    'player_count', coalesce(v_count, 0),
    'own_result', v_own,
    'entries', coalesce(v_entries, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.record_mlb_postseason_challenge_result(
  integer, text, numeric, text, jsonb, jsonb
) from public, anon;
revoke all on function public.get_mlb_postseason_challenge_overview(integer, text)
  from public, anon;

grant execute on function public.record_mlb_postseason_challenge_result(
  integer, text, numeric, text, jsonb, jsonb
) to authenticated;
grant execute on function public.get_mlb_postseason_challenge_overview(integer, text)
  to authenticated;

comment on function public.record_mlb_postseason_challenge_result(
  integer, text, numeric, text, jsonb, jsonb
) is 'Records one locked official MLB Play challenge result per member/challenge.';
comment on function public.get_mlb_postseason_challenge_overview(integer, text)
  is 'Returns the current member result and, after completion, the MLB Play challenge leaderboard with sanitized result details.';

notify pgrst, 'reload schema';
