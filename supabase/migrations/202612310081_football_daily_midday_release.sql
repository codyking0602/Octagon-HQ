-- Preserve an already-materialized Football Daily when a same-day product release changes the game.
-- The schedule table remains the canonical owner: v1 keeps history, v2 owns the Sep. 4 Blind Resume
-- release, and v3 resumes the original five-game rotation on Sep. 5 without shifting future days.

insert into private.daily_challenge_schedule_versions (
  version,
  time_zone,
  anchor_day,
  starts_on,
  game_cycle,
  sport
)
values
  (
    'football-daily-v2',
    'America/Chicago',
    date '2026-09-04',
    date '2026-09-04',
    array['blind_resume']::text[],
    'football'
  ),
  (
    'football-daily-v3',
    'America/Chicago',
    date '2026-08-22',
    date '2026-09-05',
    array[
      'find_leader',
      'blind_resume',
      'wavelength',
      'keep_4_cut_4',
      'hit_the_number'
    ]::text[],
    'football'
  )
on conflict (version) do nothing;

do $$
begin
  if private.daily_challenge_schedule_for_day(date '2026-09-03', 'football') <> 'football-daily-v1'
    or private.daily_challenge_schedule_for_day(date '2026-09-04', 'football') <> 'football-daily-v2'
    or private.daily_challenge_schedule_for_day(date '2026-09-05', 'football') <> 'football-daily-v3' then
    raise exception 'Football Daily cutover schedules are not resolved deterministically';
  end if;

  if private.daily_challenge_expected_game('football-daily-v2', date '2026-09-04') <> 'blind_resume'
    or private.daily_challenge_expected_game('football-daily-v3', date '2026-09-05') <> 'hit_the_number' then
    raise exception 'Football Daily cutover game identities are invalid';
  end if;
end
$$;

-- Football callers shipped before this release still send football-daily-v1. Resolve that stale
-- caller identity through the canonical sport schedule before publishing, while leaving UFC and
-- every non-Football schedule path unchanged.
create or replace function public.publish_daily_challenge_setup(
  p_central_day date,
  p_schedule_version text,
  p_game_type text,
  p_setup_key text,
  p_content_version text,
  p_scoring_version text,
  p_public_setup jsonb default '{}'::jsonb,
  p_reveal_setup jsonb default '{}'::jsonb,
  p_private_setup_evidence jsonb default '{}'::jsonb,
  p_private_grading_evidence jsonb default '{}'::jsonb,
  p_fallback_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_requested_schedule private.daily_challenge_schedule_versions;
  v_schedule_version text := p_schedule_version;
  v_active_football_schedule text;
  v_expected_game text;
  v_setup private.daily_challenge_setups;
  v_daily private.daily_challenges;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required to publish daily challenge setup';
  end if;

  if p_central_day is null
    or nullif(trim(p_schedule_version), '') is null
    or nullif(trim(p_setup_key), '') is null
    or nullif(trim(p_content_version), '') is null
    or nullif(trim(p_scoring_version), '') is null then
    raise exception 'complete daily identity is required';
  end if;

  select *
  into v_requested_schedule
  from private.daily_challenge_schedule_versions
  where version = p_schedule_version;

  if v_requested_schedule.version is null then
    raise exception 'unknown daily schedule version %', p_schedule_version;
  end if;

  if v_requested_schedule.sport = 'football' then
    v_active_football_schedule := private.daily_challenge_schedule_for_day(p_central_day, 'football');
    if v_active_football_schedule is not null then
      v_schedule_version := v_active_football_schedule;
    end if;
  end if;

  v_expected_game := private.daily_challenge_expected_game(
    v_schedule_version,
    p_central_day
  );

  if p_game_type <> v_expected_game
    and not (
      p_game_type = 'find_leader'
      and nullif(trim(p_fallback_reason), '') is not null
    ) then
    raise exception 'game % does not match schedule % for %',
      p_game_type,
      v_schedule_version,
      p_central_day;
  end if;

  if not (
    (p_game_type = 'wavelength' and p_scoring_version in ('play-official-score-v1', 'play-official-score-v2'))
    or (p_game_type = 'blind_resume' and p_scoring_version in ('play-official-score-v1', 'play-official-score-v3'))
    or (
      v_requested_schedule.sport = 'football'
      and p_game_type = 'blind_resume'
      and p_scoring_version = 'football-blind-resume-score-v4'
    )
    or (p_game_type = 'keep_4_cut_4' and p_scoring_version in ('play-official-score-v1', 'play-official-score-v4'))
    or (p_game_type not in ('wavelength', 'blind_resume', 'keep_4_cut_4') and p_scoring_version = 'play-official-score-v1')
  ) then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;

  insert into private.daily_challenge_setups (
    game_type,
    setup_key,
    content_version,
    scoring_version,
    public_setup,
    reveal_setup,
    private_setup_evidence,
    private_grading_evidence
  )
  values (
    p_game_type,
    p_setup_key,
    p_content_version,
    p_scoring_version,
    coalesce(p_public_setup, '{}'::jsonb),
    coalesce(p_reveal_setup, '{}'::jsonb),
    coalesce(p_private_setup_evidence, '{}'::jsonb),
    coalesce(p_private_grading_evidence, '{}'::jsonb)
  )
  on conflict (game_type, setup_key, content_version, scoring_version)
  do nothing
  returning * into v_setup;

  if v_setup.id is null then
    select *
    into v_setup
    from private.daily_challenge_setups
    where game_type = p_game_type
      and setup_key = p_setup_key
      and content_version = p_content_version
      and scoring_version = p_scoring_version;

    if v_setup.public_setup <> coalesce(p_public_setup, '{}'::jsonb)
      or v_setup.reveal_setup <> coalesce(p_reveal_setup, '{}'::jsonb)
      or v_setup.private_setup_evidence <> coalesce(p_private_setup_evidence, '{}'::jsonb)
      or v_setup.private_grading_evidence <> coalesce(p_private_grading_evidence, '{}'::jsonb) then
      raise exception 'setup identity already exists with different immutable evidence';
    end if;
  end if;

  insert into private.daily_challenges (
    central_day,
    schedule_version,
    game_type,
    setup_id,
    content_version,
    scoring_version,
    fallback_reason
  )
  values (
    p_central_day,
    v_schedule_version,
    p_game_type,
    v_setup.id,
    p_content_version,
    p_scoring_version,
    nullif(trim(p_fallback_reason), '')
  )
  on conflict (schedule_version, central_day)
  do nothing
  returning * into v_daily;

  if v_daily.id is null then
    select *
    into v_daily
    from private.daily_challenges
    where schedule_version = v_schedule_version
      and central_day = p_central_day;

    if v_daily.game_type <> p_game_type
      or v_daily.setup_id <> v_setup.id
      or v_daily.content_version <> p_content_version
      or v_daily.scoring_version <> p_scoring_version
      or v_daily.fallback_reason is distinct from nullif(trim(p_fallback_reason), '') then
      raise exception 'daily identity already exists with different immutable evidence';
    end if;
  end if;

  return jsonb_build_object(
    'id', v_daily.id,
    'central_day', v_daily.central_day,
    'schedule_version', v_daily.schedule_version,
    'game_type', v_daily.game_type,
    'setup_id', v_daily.setup_id,
    'setup_key', v_setup.setup_key,
    'content_version', v_daily.content_version,
    'scoring_version', v_daily.scoring_version,
    'fallback_reason', v_daily.fallback_reason
  );
end;
$$;

-- PR #878 introduced a Football-only three-round scoring contract. Grade that contract at the
-- existing canonical Daily Challenge grader; every UFC and pre-existing scoring path delegates
-- exactly as before.
create or replace function private.grade_daily_challenge(
  p_game_type text,
  p_scoring_version text,
  p_submission jsonb,
  p_grading_evidence jsonb
)
returns table(
  native_score integer,
  normalized_score integer,
  public_result jsonb,
  grading_snapshot jsonb
)
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_blind_rank record;
  v_keep_cut record;
  v_combo_score integer;
  v_answers jsonb;
  v_answer jsonb;
  v_expected text[];
  v_choice text;
  v_stage integer;
  v_revealed_count integer;
  v_points integer;
  v_raw_points integer := 0;
  v_correct integer := 0;
  v_results jsonb := '[]'::jsonb;
  v_i integer;
begin
  if p_game_type = 'blind_resume'
    and p_scoring_version = 'football-blind-resume-score-v4' then
    if jsonb_typeof(p_submission) <> 'object'
      or jsonb_typeof(p_grading_evidence) <> 'object' then
      raise exception 'Football Blind Resume submission and grading evidence must be objects';
    end if;

    v_expected := private.daily_challenge_text_array(
      p_grading_evidence->'correct_choices',
      'Football Blind Resume correct choices',
      3,
      false
    );
    v_answers := p_submission->'answers';
    if jsonb_typeof(v_answers) <> 'array' or jsonb_array_length(v_answers) <> 3 then
      raise exception 'Football Blind Resume answers must contain exactly three rounds';
    end if;

    for v_i in 0..2 loop
      v_answer := v_answers->v_i;
      if jsonb_typeof(v_answer) <> 'object' then
        raise exception 'Football Blind Resume answer % must be an object', v_i + 1;
      end if;

      v_choice := nullif(trim(v_answer->>'choice'), '');
      if v_choice is null then
        raise exception 'Football Blind Resume answer % is missing a choice', v_i + 1;
      end if;
      if coalesce(v_answer->>'reveal_stage', '') !~ '^[1-3]$' then
        raise exception 'Football Blind Resume answer % has an invalid reveal stage', v_i + 1;
      end if;
      if coalesce(v_answer->>'revealed_count', '') !~ '^[0-9]+$'
        or (v_answer->>'revealed_count')::integer <= 0 then
        raise exception 'Football Blind Resume answer % has an invalid reveal count', v_i + 1;
      end if;

      v_stage := (v_answer->>'reveal_stage')::integer;
      v_revealed_count := (v_answer->>'revealed_count')::integer;
      if v_choice = v_expected[v_i + 1] then
        v_correct := v_correct + 1;
        v_points := case v_stage when 1 then 10 when 2 then 8 else 7 end;
      else
        v_points := case v_stage when 1 then -4 when 2 then -1 else 0 end;
      end if;

      v_raw_points := v_raw_points + v_points;
      v_results := v_results || jsonb_build_array(jsonb_build_object(
        'choice', v_choice,
        'reveal_stage', v_stage,
        'revealed_count', v_revealed_count,
        'correct', v_choice = v_expected[v_i + 1],
        'points_awarded', v_points
      ));
    end loop;

    native_score := v_raw_points;
    normalized_score := greatest(0, least(100, round(v_raw_points * 100.0 / 30.0)::integer));
    public_result := jsonb_build_object(
      'correct', v_correct,
      'raw_points', v_raw_points,
      'results', v_results
    );
    grading_snapshot := p_grading_evidence;
    return next;
    return;
  end if;

  if p_game_type = 'keep_4_cut_4'
    and p_scoring_version = 'play-official-score-v4' then
    if jsonb_typeof(p_submission) <> 'object'
      or jsonb_typeof(p_grading_evidence) <> 'object'
      or p_grading_evidence->>'combo_version' <> 'daily-rank-keep-combo-v1' then
      raise exception 'Daily Rank/Keep combo evidence is invalid';
    end if;

    if jsonb_typeof(p_submission->'blind_rank') <> 'object'
      or jsonb_typeof(p_submission->'keep_cut') <> 'object'
      or jsonb_typeof(p_grading_evidence->'blind_rank') <> 'object'
      or jsonb_typeof(p_grading_evidence->'keep_cut') <> 'object' then
      raise exception 'Daily Rank/Keep combo requires both completed stages';
    end if;

    select *
    into v_blind_rank
    from private.grade_daily_challenge_pre_combo(
      'blind_rank_5',
      'play-official-score-v1',
      p_submission->'blind_rank',
      p_grading_evidence->'blind_rank'
    );

    select *
    into v_keep_cut
    from private.grade_daily_challenge_pre_combo(
      'keep_4_cut_4',
      'play-official-score-v1',
      p_submission->'keep_cut',
      p_grading_evidence->'keep_cut'
    );

    v_combo_score := round(
      (v_blind_rank.normalized_score + v_keep_cut.normalized_score) / 2.0
    )::integer;

    native_score := v_combo_score;
    normalized_score := v_combo_score;
    public_result := jsonb_build_object(
      'combo_version', 'daily-rank-keep-combo-v1',
      'blind_rank', v_blind_rank.public_result || jsonb_build_object(
        'normalized_score', v_blind_rank.normalized_score
      ),
      'keep_cut', v_keep_cut.public_result || jsonb_build_object(
        'normalized_score', v_keep_cut.normalized_score
      )
    );
    grading_snapshot := p_grading_evidence;
    return next;
    return;
  end if;

  return query
  select *
  from private.grade_daily_challenge_pre_combo(
    p_game_type,
    p_scoring_version,
    p_submission,
    p_grading_evidence
  );
end;
$$;