-- Hotfix Average Fan Daily publication scoring gate.
-- The October 1 launch publishes Average Fan with average-fan-score-v1,
-- but publish_daily_challenge_setup did not admit that game-specific scoring version.

do $patch$
declare
  v_signature constant regprocedure :=
    'public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
    or (p_game_type = 'sports_feud' and p_scoring_version = 'family-feud-score-v2')
    or (
      p_game_type not in ('wavelength', 'blind_resume', 'keep_4_cut_4', 'sports_feud')
      and p_scoring_version = 'play-official-score-v1'
    )
$old$;
  v_replacement constant text := $new$
    or (p_game_type = 'sports_feud' and p_scoring_version = 'family-feud-score-v2')
    or (p_game_type = 'average_fan' and p_scoring_version = 'average-fan-score-v1')
    or (
      p_game_type not in ('wavelength', 'blind_resume', 'keep_4_cut_4', 'sports_feud', 'average_fan')
      and p_scoring_version = 'play-official-score-v1'
    )
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position(
    'p_game_type = ''average_fan'' and p_scoring_version = ''average-fan-score-v1'''
    in v_definition
  ) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily publication scoring gate changed before Average Fan hotfix';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(
    'p_game_type = ''average_fan'' and p_scoring_version = ''average-fan-score-v1'''
    in v_definition
  ) = 0
    or position(
      'p_game_type not in (''wavelength'', ''blind_resume'', ''keep_4_cut_4'', ''sports_feud'', ''average_fan'')'
      in v_definition
    ) = 0 then
    raise exception 'Average Fan Daily publication scoring gate hotfix did not apply exactly';
  end if;
end
$patch$;

notify pgrst, 'reload schema';
