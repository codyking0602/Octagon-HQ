-- Repair authored two-round Who Am I finalization and the Sep. 25 NFL Sports Feud
-- natural-input grading miss. The Who Am I repair backfills every stranded completed
-- authored run, while the Sports Feud correction preserves the original submission
-- evidence and records the one-time score adjustment explicitly.

do $patch$
declare
  v_signature constant regprocedure :=
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure;
  v_definition text;
  v_old constant text := $old$
    if p_grading_evidence->>'format_version' = 'who-am-i-two-round-v1' then
      select grade.native_score, grade.normalized_score, grade.public_result
      into native_score, normalized_score, public_result
      from private.grade_who_am_i_two_round(p_submission, p_grading_evidence) grade;
      return next;
      return;
    end if;
$old$;
  v_new constant text := $new$
    if p_grading_evidence->>'format_version' = 'who-am-i-two-round-v1' then
      select grade.native_score, grade.normalized_score, grade.public_result
      into native_score, normalized_score, public_result
      from private.grade_who_am_i_two_round(p_submission, p_grading_evidence) grade;
      grading_snapshot := p_grading_evidence;
      return next;
      return;
    end if;
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position(v_new in v_definition) = 0 then
    if position(v_old in v_definition) = 0 then
      raise exception 'canonical two-round Who Am I grader branch changed before finalization repair';
    end if;
    execute replace(v_definition, v_old, v_new);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(v_new in v_definition) = 0 then
    raise exception 'two-round Who Am I grading snapshot repair did not apply exactly';
  end if;
end
$patch$;

do $backfill$
declare
  v_remaining integer;
begin
  insert into private.daily_challenge_attempts (
    daily_challenge_id,
    profile_id,
    attempt_kind,
    native_score,
    normalized_score,
    completed_at,
    content_version,
    scoring_version,
    public_result,
    submission_evidence,
    grading_evidence_snapshot
  )
  select
    daily.id,
    progress.profile_id,
    'official_first',
    grade.native_score,
    grade.normalized_score,
    progress.updated_at,
    daily.content_version,
    daily.scoring_version,
    grade.public_result,
    progress.submission_state->'final_submission',
    grade.grading_snapshot
  from private.daily_challenge_progress progress
  join private.daily_challenges daily
    on daily.id = progress.daily_challenge_id
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  cross join lateral private.grade_daily_challenge(
    daily.game_type,
    daily.scoring_version,
    progress.submission_state->'final_submission',
    setup.private_grading_evidence
  ) grade
  where daily.game_type = 'who_am_i'
    and setup.private_grading_evidence->>'format_version' = 'who-am-i-two-round-v1'
    and jsonb_typeof(progress.submission_state->'final_submission') = 'object'
    and not exists (
      select 1
      from private.daily_challenge_attempts attempt
      where attempt.daily_challenge_id = daily.id
        and attempt.profile_id = progress.profile_id
        and attempt.attempt_kind = 'official_first'
    )
  on conflict (daily_challenge_id, profile_id)
    where attempt_kind = 'official_first'
  do nothing;

  select count(*)
  into v_remaining
  from private.daily_challenge_progress progress
  join private.daily_challenges daily
    on daily.id = progress.daily_challenge_id
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  where daily.game_type = 'who_am_i'
    and setup.private_grading_evidence->>'format_version' = 'who-am-i-two-round-v1'
    and jsonb_typeof(progress.submission_state->'final_submission') = 'object'
    and not exists (
      select 1
      from private.daily_challenge_attempts attempt
      where attempt.daily_challenge_id = daily.id
        and attempt.profile_id = progress.profile_id
        and attempt.attempt_kind = 'official_first'
    );

  if v_remaining <> 0 then
    raise exception 'two-round Who Am I backfill left % stranded completions', v_remaining;
  end if;
end
$backfill$;

do $sep25$
declare
  v_profile uuid;
  v_daily uuid;
  v_attempt uuid;
  v_score integer;
  v_state jsonb;
  v_results jsonb;
  v_fix_count integer;
begin
  select profile.id
  into v_profile
  from public.profiles profile
  where profile.normalized_name = 'CODY'
  limit 1;

  if v_profile is null then
    return;
  end if;

  select daily.id
  into v_daily
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = date '2026-09-25'
    and schedule.sport = 'football'
    and daily.game_type = 'sports_feud'
  limit 1;

  if v_daily is null then
    return;
  end if;

  select attempt.id, attempt.normalized_score
  into v_attempt, v_score
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_daily
    and attempt.profile_id = v_profile
    and attempt.attempt_kind = 'official_first'
  limit 1;

  if v_attempt is null then
    return;
  end if;

  if v_score not in (67, 75) then
    raise exception 'Sep. 25 Cody Sports Feud score changed before alias correction: %', v_score;
  end if;

  select progress.public_state
  into v_state
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily
    and progress.profile_id = v_profile;

  if v_state is null then
    raise exception 'Sep. 25 Cody Sports Feud progress is missing';
  end if;

  select count(*)
  into v_fix_count
  from jsonb_array_elements(coalesce(v_state->'fast_money'->'results', '[]'::jsonb)) result
  where (
      result->>'question_id' = 'nfl-fast4-08-1'
      and result->>'submitted_answer' = 'Cover Punts'
      and coalesce((result->>'points')::integer, 0) in (0, 1)
    )
    or (
      result->>'question_id' = 'nfl-fast3-05-4'
      and result->>'submitted_answer' = 'Seattle Seahwaks'
      and coalesce((result->>'points')::integer, 0) in (0, 7)
    );

  if v_fix_count <> 2 then
    raise exception 'Sep. 25 Cody Sports Feud correction evidence changed: % matching rows', v_fix_count;
  end if;

  if v_score = 67 then
    execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
    begin
      update private.daily_challenge_attempts
      set native_score = 75,
          normalized_score = 75,
          public_result = public_result
            || jsonb_build_object(
              'score', 75,
              'fast_money_points', 30,
              'score_correction', '2026-09-25-natural-input-alias-repair'
            ),
          grading_evidence_snapshot = grading_evidence_snapshot
            || jsonb_build_object(
              'score_correction',
              jsonb_build_object(
                'reason', 'natural Sports Feud inputs were valid but missing aliases',
                'original_score', 67,
                'corrected_score', 75,
                'cover_punts_points', 1,
                'seattle_seahawks_points', 7
              )
            )
      where id = v_attempt
        and normalized_score = 67;
    exception when others then
      execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
      raise;
    end;
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
  end if;

  select jsonb_agg(
    case
      when result.value->>'question_id' = 'nfl-fast4-08-1'
        and result.value->>'submitted_answer' = 'Cover Punts'
        then result.value || jsonb_build_object(
          'points', 1,
          'counted', true,
          'accepted_as', 'Punt coverage'
        )
      when result.value->>'question_id' = 'nfl-fast3-05-4'
        and result.value->>'submitted_answer' = 'Seattle Seahwaks'
        then result.value || jsonb_build_object(
          'points', 7,
          'counted', true,
          'board_rank', 2,
          'accepted_as', 'Lumen Field'
        )
      else result.value
    end
    order by result.ordinality
  )
  into v_results
  from jsonb_array_elements(coalesce(v_state->'fast_money'->'results', '[]'::jsonb))
    with ordinality as result(value, ordinality);

  update private.daily_challenge_progress
  set public_state =
    v_state
    || jsonb_build_object(
      'hq_score', 75,
      'raw_points', 75,
      'score_correction', '2026-09-25-natural-input-alias-repair',
      'fast_money',
        (v_state->'fast_money')
        || jsonb_build_object(
          'points', 30,
          'results', coalesce(v_results, '[]'::jsonb)
        )
    )
  where daily_challenge_id = v_daily
    and profile_id = v_profile;
end
$sep25$;
