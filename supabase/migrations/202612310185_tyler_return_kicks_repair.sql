-- Correct Tyler's Sep. 25 Football Sports Feud Fast Money result.
-- "Return Kicks" is the same natural response as ranked answer "Kick return" (3 points).
-- Preserve original submitted text and record explicit correction provenance.

do $$
declare
  v_daily uuid;
  v_profile uuid;
  v_attempt uuid;
  v_score integer;
  v_public_state jsonb;
  v_submission_state jsonb;
  v_public_results jsonb;
  v_engine_results jsonb;
  v_evidence_count integer;
begin
  select d.id
  into v_daily
  from private.daily_challenges d
  join private.daily_challenge_schedule_versions s on s.version=d.schedule_version
  where d.central_day=date '2026-09-25'
    and s.sport='football'
    and d.game_type='sports_feud'
  limit 1;

  if v_daily is null then
    return;
  end if;

  select p.id
  into v_profile
  from public.profiles p
  where p.normalized_name='TYLER'
  limit 1;

  if v_profile is null then
    return;
  end if;

  select a.id, a.normalized_score
  into v_attempt, v_score
  from private.daily_challenge_attempts a
  where a.daily_challenge_id=v_daily
    and a.profile_id=v_profile
    and a.attempt_kind='official_first'
  limit 1;

  if v_attempt is null then
    return;
  end if;

  if v_score not in (73, 76) then
    raise exception 'Tyler Sep. 25 Football Sports Feud score changed before Return Kicks correction: %', v_score;
  end if;

  select prog.public_state, prog.submission_state
  into v_public_state, v_submission_state
  from private.daily_challenge_progress prog
  where prog.daily_challenge_id=v_daily
    and prog.profile_id=v_profile;

  if v_public_state is null or v_submission_state is null then
    raise exception 'Tyler Sep. 25 Football Sports Feud progress is missing';
  end if;

  select count(*)
  into v_evidence_count
  from jsonb_array_elements(coalesce(v_public_state->'fast_money'->'results','[]'::jsonb)) r
  where r->>'question_id'='nfl-fast4-08-1'
    and r->>'submitted_answer'='Return Kicks'
    and coalesce((r->>'points')::integer,0) in (0,3);

  if v_evidence_count <> 1 then
    raise exception 'Tyler Return Kicks correction evidence changed: % rows', v_evidence_count;
  end if;

  if v_score = 76 then
    return;
  end if;

  select jsonb_agg(
    case
      when r.value->>'question_id'='nfl-fast4-08-1'
       and r.value->>'submitted_answer'='Return Kicks'
      then r.value || jsonb_build_object(
        'points', 3,
        'counted', true,
        'board_rank', 6,
        'accepted_as', 'Kick return'
      )
      else r.value
    end
    order by r.ordinality
  )
  into v_public_results
  from jsonb_array_elements(coalesce(v_public_state->'fast_money'->'results','[]'::jsonb))
    with ordinality as r(value, ordinality);

  select jsonb_agg(
    case
      when r.value->>'questionId'='nfl-fast4-08-1'
       and r.value->>'submittedText'='Return Kicks'
      then r.value || jsonb_build_object(
        'points', 3,
        'entityId', 'nfl-fast4-08-1:a6',
        'matchKind', 'alias'
      )
      else r.value
    end
    order by r.ordinality
  )
  into v_engine_results
  from jsonb_array_elements(coalesce(v_submission_state->'engine_state'->'fastMoneyResults','[]'::jsonb))
    with ordinality as r(value, ordinality);

  update private.daily_challenge_progress
  set public_state =
        v_public_state
        || jsonb_build_object(
          'hq_score', 76,
          'raw_points', 76,
          'score_correction', '2026-09-25-tyler-return-kicks-repair',
          'fast_money',
            (v_public_state->'fast_money')
            || jsonb_build_object(
              'points', 30,
              'results', coalesce(v_public_results,'[]'::jsonb)
            )
        ),
      submission_state =
        jsonb_set(
          jsonb_set(
            v_submission_state,
            '{engine_state,fastMoneyResults}',
            coalesce(v_engine_results,'[]'::jsonb),
            false
          ),
          '{final_submission}',
          (v_submission_state->'final_submission')
          || jsonb_build_object(
            'native_score', 76,
            'normalized_score', 76,
            'fast_money_points', 30,
            'score_correction', '2026-09-25-tyler-return-kicks-repair'
          ),
          false
        )
  where daily_challenge_id=v_daily
    and profile_id=v_profile;

  execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
  begin
    update private.daily_challenge_attempts
    set native_score=76,
        normalized_score=76,
        public_result=public_result || jsonb_build_object(
          'score', 76,
          'fast_money_points', 30,
          'score_correction', '2026-09-25-tyler-return-kicks-repair'
        ),
        grading_evidence_snapshot=grading_evidence_snapshot || jsonb_build_object(
          'score_correction',
          jsonb_build_object(
            'reason','Return Kicks is a natural alias for ranked answer Kick return',
            'original_score',73,
            'corrected_score',76,
            'added_points',3,
            'repair','2026-09-25-tyler-return-kicks-repair'
          )
        )
    where id=v_attempt
      and normalized_score=73;
  exception when others then
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
end
$$;
