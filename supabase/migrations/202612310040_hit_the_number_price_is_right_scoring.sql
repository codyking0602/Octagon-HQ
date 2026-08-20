-- Align the one authoritative official Daily Hit the Number grader with the
-- canonical Price Is Right score buckets used by the game engine. Patch the
-- existing grader in place so there is still one scoring owner.
do $$
declare
  v_definition text := pg_get_functiondef(
    'private.grade_daily_challenge(text,text,jsonb,jsonb)'::regprocedure
  );
  v_expected text := $old$
    normalized_score := case
      when v_status = 'perfect' then 100
      when v_status = 'bust' then greatest(
        0,
        least(100, round(75 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)
      )
      else greatest(
        0,
        least(100, round(100 - (50 * v_distance / (v_target::numeric / v_pick_count)))::integer)
      )
    end;
$old$;
  v_replacement text := $new$
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
$new$;
begin
  if position(v_expected in v_definition) = 0 then
    raise exception 'Canonical Daily Hit the Number grader no longer matches the expected scoring shape.';
  end if;

  execute replace(v_definition, v_expected, v_replacement);

  v_definition := pg_get_functiondef(
    'private.grade_daily_challenge(text,text,jsonb,jsonb)'::regprocedure
  );
  if position(v_replacement in v_definition) = 0
    or position(v_expected in v_definition) > 0
  then
    raise exception 'Canonical Daily Hit the Number Price Is Right scoring patch did not apply exactly.';
  end if;
end;
$$;

-- Exercise the canonical grader itself at the three bucket boundaries. These
-- assertions fail the migration if server scoring ever stops matching the game.
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
  if v_score <> 74 then
    raise exception 'Hit the Number closest-bust Daily score must cap at 74, received %', v_score;
  end if;
end;
$$;
