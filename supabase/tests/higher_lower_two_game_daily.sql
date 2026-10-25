\set ON_ERROR_STOP on
begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $proof$
declare
  ids jsonb;
  correct_choices jsonb;
  first_answers jsonb;
  second_answers jsonb;
  children jsonb;
  frozen jsonb;
  round_results record;
  legacy record;
  blocked boolean := false;
begin
  ids := (select jsonb_agg('q' || i order by i) from generate_series(0, 9) i);
  correct_choices := (select jsonb_agg('higher' order by i) from generate_series(0, 9) i);
  first_answers := (select jsonb_agg(jsonb_build_object(
    'question_id', 'q' || i, 'choice', case when i < 8 then 'higher' else 'lower' end,
    'normalized_score', 100
  ) order by i) from generate_series(0, 9) i);
  second_answers := (select jsonb_agg(jsonb_build_object(
    'question_id', 'q' || i, 'choice', case when i < 6 then 'higher' else 'lower' end,
    'normalized_score', 100
  ) order by i) from generate_series(0, 9) i);
  children := jsonb_build_array(
    jsonb_build_object('scoring_version', 'play-official-score-v1',
      'private_grading_evidence', jsonb_build_object('question_ids', ids, 'correct_choices', correct_choices)),
    jsonb_build_object('scoring_version', 'play-official-score-v1',
      'private_grading_evidence', jsonb_build_object('question_ids', ids, 'correct_choices', correct_choices))
  );
  frozen := jsonb_build_object('format_version', 'daily-two-game-average-v1',
    'game_type', 'higher_lower', 'rounds', children);

  select * into strict round_results from private.grade_daily_challenge(
    'higher_lower', 'daily-two-game-average-score-v1',
    jsonb_build_object('rounds', jsonb_build_array(
      jsonb_build_object('answers', first_answers, 'normalized_score', 100),
      jsonb_build_object('answers', second_answers, 'normalized_score', 100)
    )), frozen
  );
  if round_results.normalized_score <> 70
    or round_results.public_result #>> '{daily_series,average_score}' <> '70'
    or round_results.public_result #> '{daily_series,round_scores}' <> '[80, 60]'::jsonb
    or jsonb_array_length(round_results.public_result #> '{daily_series,rounds}') <> 2
    or round_results.native_score <> 6 then
    raise exception 'Higher or Lower Daily grading must average two independent protected scores';
  end if;

  select * into strict legacy from private.grade_daily_challenge(
    'higher_lower', 'play-official-score-v1',
    jsonb_build_object('answers', first_answers),
    jsonb_build_object('question_ids', ids, 'correct_choices', correct_choices)
  );
  if legacy.normalized_score <> 80 or legacy.public_result ? 'daily_series' then
    raise exception 'Historical single-game Higher or Lower grading changed';
  end if;

  begin
    perform * from private.grade_daily_challenge(
      'higher_lower', 'daily-two-game-average-score-v1',
      jsonb_build_object('rounds', jsonb_build_array(jsonb_build_object('answers', first_answers))),
      frozen
    );
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'One-game submission improperly completed a two-game Daily'; end if;
  blocked := false;

  begin
    perform * from private.grade_daily_challenge(
      'higher_lower', 'daily-two-game-average-score-v1',
      jsonb_build_object('rounds', jsonb_build_array(
        jsonb_build_object('answers', first_answers),
        jsonb_build_object('answers', (select jsonb_agg(jsonb_set(x, '{question_id}', '"tampered"'::jsonb))
          from jsonb_array_elements(second_answers) x))
      )), frozen
    );
  exception when others then blocked := true;
  end;
  if not blocked then raise exception 'Tampered Higher or Lower question identities passed the server grader'; end if;

  if has_function_privilege('authenticated',
       'public.get_football_higher_lower_publication_history(date)', 'execute')
     or has_function_privilege('anon',
       'public.get_football_higher_lower_publication_history(date)', 'execute') then
    raise exception 'Published Football private comparison history is exposed';
  end if;
end;
$proof$;
rollback;
