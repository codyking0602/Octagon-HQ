begin;

select set_config('request.jwt.claim.role', 'service_role', true);

insert into private.daily_challenge_schedule_versions (
  version,
  time_zone,
  anchor_day,
  starts_on,
  game_cycle
)
values (
  'test-blind-resume-v3-publication',
  'America/Chicago',
  date '2100-02-01',
  date '2100-02-01',
  array['blind_resume']::text[]
);

do $$
declare
  v_result record;
  v_published jsonb;
  v_rejected boolean := false;
  v_evidence jsonb := '{"correct_choices":["a","b","c","d","e"]}'::jsonb;
begin
  v_published := public.publish_daily_challenge_setup(
    date '2100-02-01',
    'test-blind-resume-v3-publication',
    'blind_resume',
    'blind-resume-v3:test-blind-resume-v3-publication:2100-02-01',
    'blind-resume-v3',
    'play-official-score-v3',
    '{"round_count":5,"initial_state":{"complete":false,"round_index":0,"results":[],"current_round":{"round_index":0,"round_number":1,"revealed_count":2,"stats":[]}}}'::jsonb,
    '{"rounds":[]}'::jsonb,
    '{"rounds":[]}'::jsonb,
    v_evidence,
    null
  );

  if v_published->>'game_type' <> 'blind_resume'
    or v_published->>'content_version' <> 'blind-resume-v3'
    or v_published->>'scoring_version' <> 'play-official-score-v3' then
    raise exception 'Blind Resume V3 publication identity was rejected or rewritten: %', v_published;
  end if;

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
