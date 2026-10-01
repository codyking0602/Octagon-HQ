-- Repair the Average Fan Daily completion scoring gate.
-- Average Fan already has a dedicated grader and publication scoring version, but the
-- canonical pre-combo wrapper still rejected average-fan-score-v1 before routing to it.

do $patch$
declare
  v_signature constant regprocedure :=
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  elsif p_game_type = 'sports_feud' then
    if p_scoring_version <> 'family-feud-score-v2' then
      raise exception 'unsupported daily scoring version %', p_scoring_version;
    end if;
  elsif p_scoring_version <> 'play-official-score-v1' then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;
$old$;
  v_replacement constant text := $new$
  elsif p_game_type = 'sports_feud' then
    if p_scoring_version <> 'family-feud-score-v2' then
      raise exception 'unsupported daily scoring version %', p_scoring_version;
    end if;
  elsif p_game_type = 'average_fan' then
    if p_scoring_version <> 'average-fan-score-v1' then
      raise exception 'unsupported daily scoring version %', p_scoring_version;
    end if;
  elsif p_scoring_version <> 'play-official-score-v1' then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position(
    'p_game_type = ''average_fan'' then' || chr(10) ||
    '    if p_scoring_version <> ''average-fan-score-v1'''
    in v_definition
  ) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily scoring gate changed before Average Fan completion repair';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(
    'p_game_type = ''average_fan'' then' || chr(10) ||
    '    if p_scoring_version <> ''average-fan-score-v1'''
    in v_definition
  ) = 0 then
    raise exception 'Average Fan completion scoring gate repair did not apply exactly';
  end if;
end
$patch$;

notify pgrst, 'reload schema';
