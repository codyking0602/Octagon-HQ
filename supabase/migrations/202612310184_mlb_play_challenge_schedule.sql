-- Canonical MLB postseason challenge schedule + automatic active challenge selection.
-- All challenge dates are resolved in America/Chicago so no manual morning flip is required.

alter table public.mlb_postseason_challenges
  add column if not exists scheduled_date date,
  add column if not exists game_type text,
  add column if not exists title text,
  add column if not exists kicker text,
  add column if not exists description text,
  add column if not exists content_ready boolean not null default false;

update public.mlb_postseason_challenges
set
  scheduled_date = case slot
    when 1 then date '2026-09-29'
    when 2 then date '2026-10-01'
    when 3 then date '2026-10-03'
    when 4 then date '2026-10-06'
    when 5 then date '2026-10-09'
    when 6 then date '2026-10-12'
    when 7 then date '2026-10-15'
    when 8 then date '2026-10-18'
    when 9 then date '2026-10-23'
    when 10 then date '2026-10-27'
  end,
  game_type = case slot
    when 1 then 'find_leader'
    when 2 then 'wavelength'
    when 3 then 'millionaire'
    when 4 then 'who_am_i'
    when 5 then 'blind_resume'
    when 6 then 'open'
    when 7 then 'sports_feud'
    when 8 then 'hit_the_number'
    when 9 then 'millionaire'
    when 10 then 'wavelength'
  end,
  title = case slot
    when 1 then 'Find the Leader'
    when 2 then 'Wavelength'
    when 3 then 'Who Wants to Be a Millionaire?'
    when 4 then 'Who Am I'
    when 5 then 'Blind Resume'
    when 6 then 'Featured Challenge'
    when 7 then 'Sports Feud'
    when 8 then 'Hit the Number'
    when 9 then 'Who Wants to Be a Millionaire?'
    when 10 then 'Wavelength'
  end,
  kicker = case slot
    when 1 then 'FIND THE LEADER'
    when 2 then 'WAVELENGTH'
    when 3 then 'MILLIONAIRE'
    when 4 then 'WHO AM I'
    when 5 then 'BLIND RESUME'
    when 6 then 'MLB PLAYOFF CHALLENGE'
    when 7 then 'SPORTS FEUD'
    when 8 then 'HIT THE NUMBER'
    when 9 then 'MILLIONAIRE'
    when 10 then 'WAVELENGTH'
  end,
  description = case slot
    when 1 then 'Two boards. Eliminate decoys and leave the stat leader standing.'
    when 2 then 'Two games. Four adaptive clues each.'
    when 3 then 'Eight questions. Three lifelines. One postseason run.'
    when 4 then 'Identify the baseball name from a progressive clue ladder.'
    when 5 then 'Compare the resumes without the names.'
    when 6 then 'A new postseason challenge.'
    when 7 then 'Clear the baseball board, then finish with Fast Money.'
    when 8 then 'Build a total without going over the target.'
    when 9 then 'Eight questions. Three lifelines. One postseason run.'
    when 10 then 'Two games. Four adaptive clues each.'
  end,
  content_ready = slot in (1, 2, 10)
where season = 2026;

create unique index if not exists mlb_postseason_challenges_season_date_uidx
  on public.mlb_postseason_challenges(season, scheduled_date)
  where scheduled_date is not null;

create or replace function public.get_mlb_postseason_active_challenge(p_season integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Chicago')::date;
  v_challenge public.mlb_postseason_challenges;
begin
  if auth.uid() is null then
    raise exception 'sign in required';
  end if;

  if not public.mlb_playoffs_can_view(p_season) then
    raise exception 'mlb_playoffs_not_available';
  end if;

  select challenge.*
    into v_challenge
  from public.mlb_postseason_challenges challenge
  where challenge.season = p_season
    and challenge.scheduled_date is not null
  order by
    (challenge.scheduled_date <= v_today) desc,
    case when challenge.scheduled_date <= v_today then challenge.scheduled_date end desc nulls last,
    case when challenge.scheduled_date > v_today then challenge.scheduled_date end asc nulls last,
    challenge.slot asc
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_challenge.challenge_key,
    'title', coalesce(v_challenge.title, 'Playoff Challenge'),
    'kicker', coalesce(v_challenge.kicker, 'MLB PLAYOFF CHALLENGE'),
    'description', coalesce(v_challenge.description, 'A new postseason challenge.'),
    'route', '/mlb/challenge',
    'date', v_challenge.scheduled_date,
    'game_type', v_challenge.game_type,
    'ready', v_challenge.content_ready,
    'is_live', v_challenge.scheduled_date <= v_today
  );
end;
$$;

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
  v_today date := (now() at time zone 'America/Chicago')::date;
  v_challenge public.mlb_postseason_challenges;
  v_active_key text;
  v_row public.mlb_postseason_challenge_results;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if not public.mlb_playoffs_can_view(p_season) then
    raise exception 'mlb_playoffs_not_available';
  end if;

  select challenge.*
    into v_challenge
  from public.mlb_postseason_challenges challenge
  where challenge.season = p_season
    and challenge.challenge_key = p_challenge_key;

  if not found then
    raise exception 'mlb_play_challenge_not_found';
  end if;

  select challenge.challenge_key
    into v_active_key
  from public.mlb_postseason_challenges challenge
  where challenge.season = p_season
    and challenge.scheduled_date is not null
    and challenge.scheduled_date <= v_today
  order by challenge.scheduled_date desc, challenge.slot desc
  limit 1;

  if v_active_key is null or v_active_key <> p_challenge_key then
    raise exception 'mlb_play_challenge_not_active';
  end if;

  if not v_challenge.content_ready then
    raise exception 'mlb_play_challenge_not_ready';
  end if;

  if p_game_type is distinct from v_challenge.game_type then
    raise exception 'mlb_play_challenge_game_type_mismatch';
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

revoke all on function public.get_mlb_postseason_active_challenge(integer)
  from public, anon;
grant execute on function public.get_mlb_postseason_active_challenge(integer)
  to authenticated;

revoke all on function public.record_mlb_postseason_challenge_result(
  integer, text, numeric, text, jsonb, jsonb
) from public, anon;
grant execute on function public.record_mlb_postseason_challenge_result(
  integer, text, numeric, text, jsonb, jsonb
) to authenticated;

comment on function public.get_mlb_postseason_active_challenge(integer)
  is 'Returns the automatically scheduled MLB Play challenge using America/Chicago calendar dates.';
comment on function public.record_mlb_postseason_challenge_result(
  integer, text, numeric, text, jsonb, jsonb
) is 'Records one locked official result only for the currently active, production-ready MLB Play challenge.';

notify pgrst, 'reload schema';
