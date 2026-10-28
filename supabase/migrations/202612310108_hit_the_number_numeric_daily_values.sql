-- Allow the canonical Daily Hit the Number grader to consume the same factual
-- numeric values used by replayable Football boards. UFC remains integer-only in
-- practice, but the shared grader now accepts decimal and signed values without
-- changing the locked 100 / 50-99 / 0-49 scoring bands.
do $$
declare
  v_definition text := pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure
  );
  v_declaration_old text := $old$
  v_value integer;
  v_status text;
$old$;
  v_declaration_new text := $new$
  v_value integer;
  v_hit_target numeric;
  v_hit_total numeric := 0;
  v_hit_distance numeric;
  v_hit_value numeric;
  v_status text;
$new$;
  v_target_old text := $old$
    if coalesce(p_grading_evidence->>'target', '') !~ '^[0-9]+$' then
      raise exception 'Hit the Number target is invalid';
    end if;
    v_target := (p_grading_evidence->>'target')::integer;
    if v_target <= 0 then
      raise exception 'Hit the Number target must be positive';
    end if;
$old$;
  v_target_new text := $new$
    if coalesce(p_grading_evidence->>'target', '') !~ '^-?[0-9]+([.][0-9]+)?$' then
      raise exception 'Hit the Number target is invalid';
    end if;
    v_hit_target := (p_grading_evidence->>'target')::numeric;
    if v_hit_target <= 0 then
      raise exception 'Hit the Number target must be positive';
    end if;
$new$;
  v_scoring_old text := $old$
    for v_i in 1..v_pick_count loop
      if not (v_values ? v_submitted[v_i])
        or coalesce(v_values->>v_submitted[v_i], '') !~ '^[0-9]+$' then
        raise exception 'Hit the Number selected value is invalid';
      end if;
      v_value := (v_values->>v_submitted[v_i])::integer;
      v_total := v_total + v_value;
    end loop;

    v_distance := abs(v_target - v_total);
    v_status := case
      when v_total = v_target then 'perfect'
      when v_total > v_target then 'bust'
      else 'under'
    end;

    native_score := v_total;
    normalized_score := case
      when v_status = 'perfect' then 100
      when v_status = 'bust' then greatest(
        0,
        least(49, round(50 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)
      )
      else greatest(
        50,
        least(99, round(100 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)
      )
    end;
$old$;
  v_scoring_new text := $new$
    for v_i in 1..v_pick_count loop
      if not (v_values ? v_submitted[v_i])
        or coalesce(v_values->>v_submitted[v_i], '') !~ '^-?[0-9]+([.][0-9]+)?$' then
        raise exception 'Hit the Number selected value is invalid';
      end if;
      v_hit_value := (v_values->>v_submitted[v_i])::numeric;
      v_hit_total := v_hit_total + v_hit_value;
    end loop;

    v_hit_distance := abs(v_hit_target - v_hit_total);
    v_status := case
      when v_hit_total = v_hit_target then 'perfect'
      when v_hit_total > v_hit_target then 'bust'
      else 'under'
    end;

    native_score := round(v_hit_total)::integer;
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
$new$;
  v_selection_old text := $old$
          'value', (v_values->>submitted.fighter_id)::integer
$old$;
  v_selection_new text := $new$
          'value', (v_values->>submitted.fighter_id)::numeric
$new$;
  v_result_old text := $old$
      'target', v_target,
      'total', v_total,
      'distance', v_distance,
$old$;
  v_result_new text := $new$
      'target', v_hit_target,
      'total', v_hit_total,
      'distance', v_hit_distance,
$new$;
begin
  if position(v_declaration_old in v_definition) = 0
    or position(v_target_old in v_definition) = 0
    or position(v_scoring_old in v_definition) = 0
    or position(v_selection_old in v_definition) = 0
    or position(v_result_old in v_definition) = 0
  then
    raise exception 'Canonical Daily Hit the Number grader no longer matches the expected numeric patch shape.';
  end if;

  v_definition := replace(v_definition, v_declaration_old, v_declaration_new);
  v_definition := replace(v_definition, v_target_old, v_target_new);
  v_definition := replace(v_definition, v_scoring_old, v_scoring_new);
  v_definition := replace(v_definition, v_selection_old, v_selection_new);
  v_definition := replace(v_definition, v_result_old, v_result_new);
  execute v_definition;

  v_definition := pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure
  );
  if position(v_target_new in v_definition) = 0
    or position(v_scoring_new in v_definition) = 0
    or position(v_selection_new in v_definition) = 0
    or position(v_result_new in v_definition) = 0
  then
    raise exception 'Daily Hit the Number numeric-value patch did not apply exactly.';
  end if;
end;
$$;

-- Prove decimal, signed and legacy integer evidence all flow through the one
-- canonical grading entry point with the existing score bands unchanged.
do $$
declare
  v_score integer;
  v_result jsonb;
  v_submission constant jsonb := '{"selected_ids":["a","b","c","d"]}'::jsonb;
begin
  select normalized_score, public_result
  into strict v_score, v_result
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    '{"pick_count":4,"target":40.0,"fighter_ids":["a","b","c","d"],"values":{"a":10.1,"b":9.9,"c":10.0,"d":10.0}}'::jsonb
  );
  if v_score <> 100
    or (v_result->>'total')::numeric <> 40.0 then
    raise exception 'Decimal Hit the Number exact-target grading failed: score %, result %', v_score, v_result;
  end if;

  select normalized_score
  into strict v_score
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    '{"pick_count":4,"target":40.0,"fighter_ids":["a","b","c","d"],"values":{"a":10.1,"b":9.8,"c":10.0,"d":10.0}}'::jsonb
  );
  if v_score <> 99 then
    raise exception 'Decimal Hit the Number closest-under score must remain 99, received %', v_score;
  end if;

  select normalized_score, public_result
  into strict v_score, v_result
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    '{"pick_count":4,"target":40,"fighter_ids":["a","b","c","d"],"values":{"a":-5,"b":15,"c":15,"d":15}}'::jsonb
  );
  if v_score <> 100
    or (v_result->>'total')::numeric <> 40 then
    raise exception 'Signed Hit the Number grading failed: score %, result %', v_score, v_result;
  end if;
end;
$$;
