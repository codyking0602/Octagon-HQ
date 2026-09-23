do $test$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,text)'::regprocedure::oid
  ) into v_definition;

  if position(
    'p_game_type = ''sports_feud'' and p_scoring_version = ''family-feud-score-v2'''
    in v_definition
  ) = 0 then
    raise exception 'Sports Feud Daily scoring version is not accepted by the canonical publisher';
  end if;

  if position(
    'p_game_type not in (''wavelength'', ''blind_resume'', ''keep_4_cut_4'', ''sports_feud'')'
    in v_definition
  ) = 0 then
    raise exception 'Sports Feud Daily still falls through the generic v1 scoring gate';
  end if;
end
$test$;
