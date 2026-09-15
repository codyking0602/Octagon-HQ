-- Normalize shared Hit the Number scoring against the target itself.
-- Bob Barker bands remain locked: exact = 100, legal under = 50-99, bust = 0-49.
-- Pick count validates the board but no longer changes the score curve.
do $$
declare
  v_definition text := pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure
  );
  v_expected text := $old$
    normalized_score := case
      when v_status = 'perfect' then 100
      when v_status = 'bust' then greatest(
        0,
        least(49, round(50 - (50 * v_hit_distance / (v_hit_target / v_pick_count)))::integer)
      )
      else greatest(
        50,
        least(99, round(100 - (50 * v_hit_distance / (v_hit_target / v_pick_count)))::integer)
      )
    end;
$old$;
  v_replacement text := $new$
    normalized_score := case
      when v_status = 'perfect' then 100
      when v_status = 'bust' then greatest(
        0,
        least(49, round(50 - (50 * v_hit_distance / v_hit_target))::integer)
      )
      else greatest(
        50,
        least(99, round(100 - (50 * v_hit_distance / v_hit_target))::integer)
      )
    end;
$new$;
begin
  if position(v_expected in v_definition) = 0 then
    raise exception 'Canonical Daily Hit the Number grader no longer matches the expected pick-count score curve.';
  end if;

  execute replace(v_definition, v_expected, v_replacement);

  v_definition := pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure
  );
  if position(v_replacement in v_definition) = 0
    or position(v_expected in v_definition) > 0
  then
    raise exception 'Daily Hit the Number target-percentage scoring patch did not apply exactly.';
  end if;
end;
$$;

-- Prove the shared Daily grader matches the approved cross-scale calibration.
do $$
declare
  v_score integer;
  v_submission constant jsonb := '{"selected_ids":["a","b","c","d","e","f"]}'::jsonb;
begin
  select normalized_score into strict v_score
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    '{"pick_count":6,"target":45,"fighter_ids":["a","b","c","d","e","f"],"values":{"a":5,"b":5,"c":5,"d":5,"e":5,"f":10}}'::jsonb
  );
  if v_score <> 89 then
    raise exception 'Target 45 / total 35 must score 89, received %', v_score;
  end if;

  select normalized_score into strict v_score
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    '{"pick_count":6,"target":45,"fighter_ids":["a","b","c","d","e","f"],"values":{"a":8,"b":8,"c":8,"d":8,"e":8,"f":13}}'::jsonb
  );
  if v_score <> 41 then
    raise exception 'Target 45 / total 53 bust must score 41, received %', v_score;
  end if;

  select normalized_score into strict v_score
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    '{"selected_ids":["a","b","c","d"]}'::jsonb,
    '{"pick_count":4,"target":450,"fighter_ids":["a","b","c","d"],"values":{"a":100,"b":100,"c":100,"d":50}}'::jsonb
  );
  if v_score <> 89 then
    raise exception 'Target-percentage scaling must preserve equivalent misses, received %', v_score;
  end if;
end;
$$;

-- Regrade only the already-completed UFC Daily attempts for September 15, 2026.
-- Future attempts automatically use the patched canonical grader. Historical days
-- remain unchanged; this corrects the live day the calibration bug affected.
alter table private.daily_challenge_attempts
  disable trigger daily_challenge_attempts_immutable;

with regraded as (
  select
    attempt.id,
    graded.native_score,
    graded.normalized_score,
    graded.public_result
  from private.daily_challenge_attempts attempt
  join private.daily_challenges challenge
    on challenge.id = attempt.daily_challenge_id
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = challenge.schedule_version
  cross join lateral private.grade_daily_challenge(
    challenge.game_type,
    attempt.scoring_version,
    attempt.submission_evidence,
    attempt.grading_evidence_snapshot
  ) graded
  where challenge.central_day = date '2026-09-15'
    and schedule.sport = 'ufc'
    and challenge.game_type = 'hit_the_number'
)
update private.daily_challenge_attempts attempt
set
  native_score = regraded.native_score,
  normalized_score = regraded.normalized_score,
  public_result = regraded.public_result
from regraded
where attempt.id = regraded.id;

alter table private.daily_challenge_attempts
  enable trigger daily_challenge_attempts_immutable;

do $$
begin
  if exists (
    select 1
    from private.daily_challenge_attempts attempt
    join private.daily_challenges challenge
      on challenge.id = attempt.daily_challenge_id
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = challenge.schedule_version
    cross join lateral private.grade_daily_challenge(
      challenge.game_type,
      attempt.scoring_version,
      attempt.submission_evidence,
      attempt.grading_evidence_snapshot
    ) graded
    where challenge.central_day = date '2026-09-15'
      and schedule.sport = 'ufc'
      and challenge.game_type = 'hit_the_number'
      and (
        attempt.native_score is distinct from graded.native_score
        or attempt.normalized_score is distinct from graded.normalized_score
        or attempt.public_result is distinct from graded.public_result
      )
  ) then
    raise exception 'September 15 UFC Hit the Number attempts were not fully regraded.';
  end if;
end;
$$;
