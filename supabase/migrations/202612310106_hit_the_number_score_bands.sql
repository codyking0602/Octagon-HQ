-- Tighten shared Hit the Number Bob Barker scoring bands.
-- Perfect remains 100. Every legal under-target result remains above every bust,
-- but under-target attempts now span 50-99 and busts span 0-49.
do $$
declare
  v_entry_definition text := pg_get_functiondef(
    'private.grade_daily_challenge(text,text,jsonb,jsonb)'::regprocedure
  );
  v_definition text := pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure
  );
  v_expected text := $old$
    normalized_score := case
      when v_status = 'perfect' then 100
      when v_status = 'bust' then greatest(
        0,
        least(74, round(75 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)
      )
      else greatest(
        75,
        least(99, round(100 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)
      )
    end;
$old$;
  v_replacement text := $new$
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
$new$;
begin
  if position('private.grade_daily_challenge_pre_combo' in v_entry_definition) = 0 then
    raise exception 'Canonical Daily grader no longer delegates historical scoring to the expected owner.';
  end if;

  if position(v_expected in v_definition) = 0 then
    raise exception 'Daily Hit the Number scoring owner no longer matches the expected 75/74 scoring shape.';
  end if;

  execute replace(v_definition, v_expected, v_replacement);

  v_definition := pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure
  );
  if position(v_replacement in v_definition) = 0
    or position(v_expected in v_definition) > 0
  then
    raise exception 'Daily Hit the Number 50/49 scoring patch did not apply exactly.';
  end if;
end;
$$;

-- Exercise the canonical Daily scoring entry point at the new bucket boundaries.
do $$
declare
  v_score integer;
  v_submission constant jsonb := '{"selected_ids":["a","b","c","d"]}'::jsonb;
  v_base_evidence constant jsonb := '{"pick_count":4,"target":1000,"fighter_ids":["a","b","c","d"]}'::jsonb;
begin
  select normalized_score
  into strict v_score
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    v_base_evidence || '{"values":{"a":250,"b":250,"c":250,"d":250}}'::jsonb
  );
  if v_score <> 100 then
    raise exception 'Hit the Number exact-target Daily score must be 100, received %', v_score;
  end if;

  select normalized_score
  into strict v_score
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    v_base_evidence || '{"values":{"a":250,"b":250,"c":250,"d":249}}'::jsonb
  );
  if v_score <> 99 then
    raise exception 'Hit the Number closest-under Daily score must cap at 99, received %', v_score;
  end if;

  select normalized_score
  into strict v_score
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    v_base_evidence || '{"values":{"a":250,"b":250,"c":250,"d":251}}'::jsonb
  );
  if v_score <> 49 then
    raise exception 'Hit the Number closest-bust Daily score must cap at 49, received %', v_score;
  end if;

  select normalized_score
  into strict v_score
  from private.grade_daily_challenge(
    'hit_the_number',
    'play-official-score-v1',
    v_submission,
    v_base_evidence || '{"values":{"a":1,"b":1,"c":1,"d":1}}'::jsonb
  );
  if v_score <> 50 then
    raise exception 'Hit the Number under-target Daily floor must be 50, received %', v_score;
  end if;
end;
$$;
