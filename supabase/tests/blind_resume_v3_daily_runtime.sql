begin;

do $$
declare
  v_result record;
  v_rejected boolean := false;
  v_evidence jsonb := '{"correct_choices":["a","b","c","d","e"]}'::jsonb;
begin
  select *
  into v_result
  from private.grade_daily_challenge(
    'blind_resume',
    'play-official-score-v3',
    '{"answers":[
      {"choice":"a","revealed_count":2},
      {"choice":"b","revealed_count":2},
      {"choice":"c","revealed_count":2},
      {"choice":"d","revealed_count":2},
      {"choice":"e","revealed_count":2}
    ]}'::jsonb,
    v_evidence
  );

  if v_result.native_score <> 5 or v_result.normalized_score <> 100 then
    raise exception 'Blind Resume V3 perfect early card must score 5 native / 100 normalized, got % / %',
      v_result.native_score,
      v_result.normalized_score;
  end if;
  if (v_result.public_result->>'points')::integer <> 100
    or jsonb_array_length(v_result.public_result->'answers') <> 5 then
    raise exception 'Blind Resume V3 perfect result reveal is invalid: %', v_result.public_result;
  end if;

  select *
  into v_result
  from private.grade_daily_challenge(
    'blind_resume',
    'play-official-score-v3',
    '{"answers":[
      {"choice":"a","revealed_count":2},
      {"choice":"b","revealed_count":2},
      {"choice":"x","revealed_count":2},
      {"choice":"x","revealed_count":2},
      {"choice":"x","revealed_count":2}
    ]}'::jsonb,
    v_evidence
  );

  if v_result.native_score <> 2 or v_result.normalized_score <> 46 then
    raise exception 'Blind Resume V3 two-of-five early card must score 46, got native % normalized %',
      v_result.native_score,
      v_result.normalized_score;
  end if;
  if v_result.normalized_score = 40 then
    raise exception 'Blind Resume V3 must not collapse two correct picks to a raw 40 percent';
  end if;

  select *
  into v_result
  from private.grade_daily_challenge(
    'blind_resume',
    'play-official-score-v3',
    '{"answers":[
      {"choice":"x","revealed_count":2},
      {"choice":"x","revealed_count":4},
      {"choice":"x","revealed_count":6},
      {"choice":"x","revealed_count":8},
      {"choice":"x","revealed_count":2}
    ]}'::jsonb,
    v_evidence
  );

  if v_result.native_score <> 0 or v_result.normalized_score <> 22 then
    raise exception 'Blind Resume V3 miss-floor economics drifted; expected 22, got %', v_result.normalized_score;
  end if;

  select *
  into v_result
  from private.grade_daily_challenge(
    'blind_resume',
    'play-official-score-v3',
    '{"answers":[
      {"choice":"a","revealed_count":2},
      {"choice":"b","revealed_count":4},
      {"choice":"c","revealed_count":6},
      {"choice":"d","revealed_count":8},
      {"choice":"e","revealed_count":2}
    ]}'::jsonb,
    v_evidence
  );

  if v_result.native_score <> 5 or v_result.normalized_score <> 94 then
    raise exception 'Blind Resume V3 staged correct card must score 94, got %', v_result.normalized_score;
  end if;

  select *
  into v_result
  from private.grade_daily_challenge(
    'blind_resume',
    'play-official-score-v1',
    '{"choices":["a","b","x","x","x"]}'::jsonb,
    v_evidence
  );

  if v_result.native_score <> 2 or v_result.normalized_score <> 40 then
    raise exception 'historical Blind Resume V2 scoring must remain 2 / 40, got % / %',
      v_result.native_score,
      v_result.normalized_score;
  end if;

  begin
    perform *
    from private.grade_daily_challenge(
      'blind_resume',
      'play-official-score-v3',
      '{"answers":[
        {"choice":"a","revealed_count":3},
        {"choice":"b","revealed_count":2},
        {"choice":"c","revealed_count":2},
        {"choice":"d","revealed_count":2},
        {"choice":"e","revealed_count":2}
      ]}'::jsonb,
      v_evidence
    );
  exception when others then
    v_rejected := position('2, 4, 6, or 8' in sqlerrm) > 0;
  end;

  if not v_rejected then
    raise exception 'Blind Resume V3 invalid reveal counts must be rejected';
  end if;
end
$$;

rollback;
