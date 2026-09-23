begin;

do $$
declare
  v_grade record;
  v_evidence constant jsonb := '{
    "format_version":"who-am-i-two-round-v1",
    "rounds":[
      {
        "subject_ids":["nfl-hidden","nfl-a","nfl-b","nfl-c","nfl-d","nfl-e"],
        "hidden_subject_id":"nfl-hidden",
        "league":"NFL",
        "clue_limit":10,
        "clues_per_reveal":2
      },
      {
        "subject_ids":["cfb-hidden","cfb-a","cfb-b","cfb-c","cfb-d","cfb-e"],
        "hidden_subject_id":"cfb-hidden",
        "league":"CFB",
        "clue_limit":10,
        "clues_per_reveal":2
      }
    ]
  }'::jsonb;
begin
  select * into v_grade
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{
      "format_version":"who-am-i-two-round-v1",
      "rounds":[
        {
          "outcome":"natural",
          "revealed_count":2,
          "natural_guesses":["nfl-hidden"],
          "recovery_choices":[],
          "recovery_guesses":[]
        },
        {
          "outcome":"natural",
          "revealed_count":6,
          "natural_guesses":["cfb-a","cfb-hidden"],
          "recovery_choices":[],
          "recovery_guesses":[]
        }
      ]
    }'::jsonb,
    v_evidence
  );

  if v_grade.native_score <> 90 or v_grade.normalized_score <> 90 then
    raise exception 'two-round Who Am I must average 100 and 80 to 90, got %', row_to_json(v_grade);
  end if;
  if jsonb_array_length(v_grade.public_result->'rounds') <> 2
    or (v_grade.public_result->'rounds'->0->>'score')::integer <> 100
    or (v_grade.public_result->'rounds'->1->>'score')::integer <> 80
    or v_grade.public_result->'rounds'->0->>'league' <> 'NFL'
    or v_grade.public_result->'rounds'->1->>'league' <> 'CFB' then
    raise exception 'two-round Who Am I public result lost component scores or leagues: %', v_grade.public_result;
  end if;
end
$$;

do $$
declare
  v_grade record;
begin
  select * into v_grade
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{
      "format_version":"who-am-i-two-round-v1",
      "rounds":[
        {
          "outcome":"recovered",
          "revealed_count":10,
          "natural_guesses":[],
          "recovery_choices":["nfl-hidden","nfl-a","nfl-b","nfl-c","nfl-d"],
          "recovery_guesses":["nfl-hidden"]
        },
        {
          "outcome":"recovered",
          "revealed_count":10,
          "natural_guesses":[],
          "recovery_choices":["cfb-hidden","cfb-a","cfb-b","cfb-c","cfb-d"],
          "recovery_guesses":["cfb-a","cfb-hidden"]
        }
      ]
    }'::jsonb,
    '{
      "format_version":"who-am-i-two-round-v1",
      "rounds":[
        {
          "subject_ids":["nfl-hidden","nfl-a","nfl-b","nfl-c","nfl-d","nfl-e"],
          "hidden_subject_id":"nfl-hidden",
          "league":"NFL",
          "clue_limit":10,
          "clues_per_reveal":2
        },
        {
          "subject_ids":["cfb-hidden","cfb-a","cfb-b","cfb-c","cfb-d","cfb-e"],
          "hidden_subject_id":"cfb-hidden",
          "league":"CFB",
          "clue_limit":10,
          "clues_per_reveal":2
        }
      ]
    }'::jsonb
  );

  if v_grade.normalized_score <> 38 then
    raise exception 'two-round Who Am I must round the 45 and 30 average to 38, got %', row_to_json(v_grade);
  end if;
end
$$;

do $$
declare
  v_rejected boolean := false;
begin
  begin
    perform *
    from private.grade_daily_challenge(
      'who_am_i',
      'play-official-score-v1',
      '{"format_version":"who-am-i-two-round-v1","rounds":[]}'::jsonb,
      '{"format_version":"who-am-i-two-round-v1","rounds":[]}'::jsonb
    );
  exception when others then
    v_rejected := position('exactly two rounds' in lower(sqlerrm)) > 0;
  end;
  if not v_rejected then
    raise exception 'two-round Who Am I grader must reject a malformed round count';
  end if;
end
$$;

rollback;
