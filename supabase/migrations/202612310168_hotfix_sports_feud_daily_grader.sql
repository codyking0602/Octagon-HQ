-- Sports Feud publishes with family-feud-score-v2. The launch migration wired
-- the Sports Feud grader branch but the canonical pre-combo scoring-version gate
-- still rejected that identity before the branch could run.
do $sports_feud_grader_gate$
declare
  v_signature constant regprocedure :=
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  elsif p_scoring_version <> 'play-official-score-v1' then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;
$old$;
  v_replacement constant text := $new$
  elsif p_game_type = 'sports_feud' then
    if p_scoring_version <> 'family-feud-score-v2' then
      raise exception 'unsupported daily scoring version %', p_scoring_version;
    end if;
  elsif p_scoring_version <> 'play-official-score-v1' then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('p_game_type = ''sports_feud'' then' in v_definition) = 0
    or position('grade_sports_feud_daily' in v_definition) = 0 then
    raise exception 'Sports Feud grader branch is missing before scoring-gate hotfix';
  end if;

  if position('p_scoring_version <> ''family-feud-score-v2''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily grader scoring-version gate changed before Sports Feud hotfix';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('p_game_type = ''sports_feud'' then' in v_definition) = 0
    or position('p_scoring_version <> ''family-feud-score-v2''' in v_definition) = 0
    or position('grade_sports_feud_daily' in v_definition) = 0 then
    raise exception 'Sports Feud Daily grader scoring gate hotfix did not apply exactly';
  end if;
end
$sports_feud_grader_gate$;
