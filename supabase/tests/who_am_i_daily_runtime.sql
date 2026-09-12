begin;

do $$
declare
  v_entry text := pg_get_functiondef(
    'private.grade_daily_challenge(text,text,jsonb,jsonb)'::regprocedure
  );
  v_delegate text := pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure
  );
begin
  if position('grade_daily_challenge_pre_combo' in v_entry) = 0 then
    raise exception 'Who Am I integration must preserve the canonical Daily Double grader wrapper';
  end if;
  if position('elsif p_game_type = ''who_am_i'' then' in v_delegate) = 0 then
    raise exception 'Who Am I must be owned by the existing canonical grader delegate';
  end if;
end
$$;

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
  'who_am_i',
  'test-who-am-i-daily-v1:2100-01-01',
  'who-am-i-daily-v1',
  'play-official-score-v1',
  '{"league":"UFC","initial_state":{"complete":false,"phase":"playing","revealed_count":2}}'::jsonb,
  '{"identity":{"id":"hidden","name":"Hidden Fighter","kind":"fighter"}}'::jsonb,
  '{"hidden_subject_id":"hidden"}'::jsonb,
  '{"subject_ids":["hidden","a","b","c","d","e"],"hidden_subject_id":"hidden","clue_limit":10,"clues_per_reveal":2}'::jsonb
);

do $$
declare
  v_result record;
  v_evidence constant jsonb := '{
    "subject_ids":["hidden","a","b","c","d","e"],
    "hidden_subject_id":"hidden",
    "clue_limit":10,
    "clues_per_reveal":2
  }'::jsonb;
  v_rejected boolean := false;
begin
  select * into v_result
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{"outcome":"natural","revealed_count":2,"natural_guesses":["hidden"],"recovery_choices":[],"recovery_guesses":[]}'::jsonb,
    v_evidence
  );
  if v_result.native_score <> 100 or v_result.normalized_score <> 100
    or v_result.public_result->>'outcome' <> 'natural'
    or v_result.public_result->>'subject_id' <> 'hidden' then
    raise exception 'Who Am I two-clue natural solve must score 100, got %', row_to_json(v_result);
  end if;

  select * into v_result
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{"outcome":"natural","revealed_count":6,"natural_guesses":["a","hidden"],"recovery_choices":[],"recovery_guesses":[]}'::jsonb,
    v_evidence
  );
  if v_result.normalized_score <> 80
    or (v_result.public_result->>'wrong_guesses')::integer <> 1 then
    raise exception 'Who Am I six-clue solve after one miss must score 80, got %', row_to_json(v_result);
  end if;

  select * into v_result
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{"outcome":"recovered","revealed_count":10,"natural_guesses":["a"],"recovery_choices":["hidden","b","c","d","e"],"recovery_guesses":["hidden"]}'::jsonb,
    v_evidence
  );
  if v_result.normalized_score <> 45
    or (v_result.public_result->>'recovery_misses')::integer <> 0 then
    raise exception 'first Recovery Board solve must score 45, got %', row_to_json(v_result);
  end if;

  select * into v_result
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{"outcome":"recovered","revealed_count":10,"natural_guesses":[],"recovery_choices":["hidden","a","b","c","d"],"recovery_guesses":["a","hidden"]}'::jsonb,
    v_evidence
  );
  if v_result.normalized_score <> 30
    or (v_result.public_result->>'recovery_misses')::integer <> 1 then
    raise exception 'second Recovery Board solve must score 30, got %', row_to_json(v_result);
  end if;

  select * into v_result
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{"outcome":"miss","revealed_count":10,"natural_guesses":[],"recovery_choices":["hidden","a","b","c","d"],"recovery_guesses":["a","b"]}'::jsonb,
    v_evidence
  );
  if v_result.normalized_score <> 0
    or (v_result.public_result->>'recovery_misses')::integer <> 2 then
    raise exception 'two Recovery Board misses must score zero, got %', row_to_json(v_result);
  end if;

  begin
    perform *
    from private.grade_daily_challenge(
      'who_am_i',
      'play-official-score-v1',
      '{"outcome":"natural","revealed_count":2,"natural_guesses":["a"],"recovery_choices":[],"recovery_guesses":[]}'::jsonb,
      v_evidence
    );
  exception when others then
    v_rejected := position('hidden subject' in lower(sqlerrm)) > 0;
  end;
  if not v_rejected then
    raise exception 'Who Am I grader must reject a false natural completion';
  end if;

  v_rejected := false;
  begin
    perform *
    from private.grade_daily_challenge(
      'who_am_i',
      'play-official-score-v1',
      '{"outcome":"recovered","revealed_count":10,"natural_guesses":[],"recovery_choices":["a","b","c","d","e"],"recovery_guesses":["a","b"]}'::jsonb,
      v_evidence
    );
  exception when others then
    v_rejected := position('must contain the hidden subject' in lower(sqlerrm)) > 0;
  end;
  if not v_rejected then
    raise exception 'Who Am I grader must reject a Recovery Board without the hidden subject';
  end if;
end
$$;

rollback;
