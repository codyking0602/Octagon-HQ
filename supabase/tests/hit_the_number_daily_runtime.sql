begin;

do $$
declare
  v_scheduled_game text;
begin
  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle
  )
  values (
    'test-hit-the-number-rotated-v1',
    'America/Chicago',
    date '2100-01-01',
    date '2100-01-01',
    array['hit_the_number']::text[]
  );

  v_scheduled_game := private.daily_challenge_expected_game(
    'test-hit-the-number-rotated-v1',
    date '2100-01-01'
  );

  if v_scheduled_game <> 'hit_the_number' then
    raise exception 'Hit the Number must be accepted by the activated schedule-version contract, got %',
      v_scheduled_game;
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
  'hit_the_number',
  'test-hit-the-number-runtime-v1:2100-01-01',
  'hit-the-number-v1',
  'play-official-score-v1',
  '{"version":"hit-the-number-v1","statId":"ufc-wins","boardType":"random-pool","target":93,"pickCount":7,"filter":{},"fighterIds":["a","b","c","d","e","f","g"]}'::jsonb,
  '{}'::jsonb,
  '{"fighter_ids":["a","b","c","d","e","f","g"],"pick_count":7}'::jsonb,
  '{"fighter_ids":["a","b","c","d","e","f","g"],"stat_id":"ufc-wins","target":93,"pick_count":7,"values":{"a":20,"b":18,"c":15,"d":13,"e":10,"f":7,"g":5}}'::jsonb
);

do $$
declare
  v_result record;
  v_rejected boolean := false;
begin
  -- Historical Classic grading evidence has no format or slot metadata and must stay valid.
  select *
  into v_result
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    '{"selected_ids":["a","b","c","d","e","f","g"]}'::jsonb,
    '{"fighter_ids":["a","b","c","d","e","f","g"],"stat_id":"ufc-wins","target":93,"pick_count":7,"values":{"a":20,"b":18,"c":15,"d":13,"e":10,"f":7,"g":5}}'::jsonb
  );

  if v_result.native_score <> 88 then
    raise exception 'expected Hit the Number native total 88, got %', v_result.native_score;
  end if;
  if v_result.normalized_score <> 81 then
    raise exception 'expected Hit the Number normalized score 81, got %', v_result.normalized_score;
  end if;
  if v_result.public_result->>'status' <> 'under'
    or (v_result.public_result->>'distance')::integer <> 5
    or jsonb_array_length(v_result.public_result->'selections') <> 7 then
    raise exception 'Hit the Number under-result reveal is invalid: %', v_result.public_result;
  end if;

  select *
  into v_result
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    '{"selected_ids":["a","b","c","d","e","f","g"]}'::jsonb,
    '{"fighter_ids":["a","b","c","d","e","f","g"],"stat_id":"ufc-wins","target":93,"pick_count":7,"values":{"a":20,"b":18,"c":15,"d":13,"e":10,"f":10,"g":8}}'::jsonb
  );

  if v_result.native_score <> 94
    or v_result.normalized_score <> 71
    or v_result.public_result->>'status' <> 'bust' then
    raise exception 'expected one-over bust to score 71, got total %, score %, result %',
      v_result.native_score,
      v_result.normalized_score,
      v_result.public_result;
  end if;

  select *
  into v_result
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    '{"selected_ids":["a","b","c","d","e","f","g"]}'::jsonb,
    '{"fighter_ids":["a","b","c","d","e","f","g"],"stat_id":"ufc-wins","target":93,"pick_count":7,"values":{"a":20,"b":18,"c":15,"d":13,"e":10,"f":9,"g":8}}'::jsonb
  );

  if v_result.native_score <> 93
    or v_result.normalized_score <> 100
    or v_result.public_result->>'status' <> 'perfect' then
    raise exception 'expected exact Hit the Number total to score 100, got %', row_to_json(v_result);
  end if;

  begin
    perform *
    from private.grade_daily_challenge(
      'hit_the_number',
      'play-official-score-v1',
      '{"selected_ids":["a","a","c","d","e","f","g"]}'::jsonb,
      '{"fighter_ids":["a","b","c","d","e","f","g"],"stat_id":"ufc-wins","target":93,"pick_count":7,"values":{"a":20,"b":18,"c":15,"d":13,"e":10,"f":9,"g":8}}'::jsonb
    );
  exception when others then
    v_rejected := position('duplicate' in lower(sqlerrm)) > 0;
  end;

  if not v_rejected then
    raise exception 'duplicate Hit the Number selections must be rejected';
  end if;
end
$$;

do $$
declare
  v_result record;
  v_rejected boolean := false;
  v_evidence jsonb := '{
    "fighter_ids":["a","b","c","d","e","f"],
    "stat_id":"ufc-wins",
    "target":50,
    "pick_count":5,
    "format_id":"one-from-each",
    "slot_eligible_ids":[["a","f"],["b"],["c"],["d"],["e"]],
    "values":{"a":10,"b":10,"c":10,"d":10,"e":10,"f":4}
  }'::jsonb;
begin
  select *
  into v_result
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    '{"selected_ids":["a","b","c","d","e"]}'::jsonb,
    v_evidence
  );

  if v_result.normalized_score <> 100
    or v_result.public_result->>'status' <> 'perfect' then
    raise exception 'valid constrained Hit the Number assignment must grade normally, got %', row_to_json(v_result);
  end if;

  begin
    perform *
    from private.grade_daily_challenge(
      'hit_the_number',
      'play-official-score-v1',
      '{"selected_ids":["b","a","c","d","e"]}'::jsonb,
      v_evidence
    );
  exception when others then
    v_rejected := position('role assignment' in lower(sqlerrm)) > 0;
  end;

  if not v_rejected then
    raise exception 'server grader must reject a fighter in the wrong constrained slot';
  end if;

  v_rejected := false;
  begin
    perform *
    from private.grade_daily_challenge(
      'hit_the_number',
      'play-official-score-v1',
      '{"selected_ids":["a","b","c","d","e"]}'::jsonb,
      v_evidence - 'slot_eligible_ids'
    );
  exception when others then
    v_rejected := position('missing slot eligibility' in lower(sqlerrm)) > 0;
  end;

  if not v_rejected then
    raise exception 'new constrained grading evidence must fail closed without slot eligibility';
  end if;
end
$$;

rollback;
