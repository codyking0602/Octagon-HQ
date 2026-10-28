-- Hotfix Sports Feud Daily publication scoring gate.
-- The September 23 launch publishes Sports Feud with family-feud-score-v2,
-- but publish_daily_challenge_setup still only accepted the generic v1 path.

do $patch$
declare
  v_signature constant regprocedure :=
    'public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
    or (p_game_type not in ('wavelength', 'blind_resume', 'keep_4_cut_4') and p_scoring_version = 'play-official-score-v1')
$old$;
  v_replacement constant text := $new$
    or (p_game_type = 'sports_feud' and p_scoring_version = 'family-feud-score-v2')
    or (
      p_game_type not in ('wavelength', 'blind_resume', 'keep_4_cut_4', 'sports_feud')
      and p_scoring_version = 'play-official-score-v1'
    )
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('p_game_type = ''sports_feud'' and p_scoring_version = ''family-feud-score-v2''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily publication scoring gate changed before Sports Feud hotfix';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('p_game_type = ''sports_feud'' and p_scoring_version = ''family-feud-score-v2''' in v_definition) = 0
    or position(
      'p_game_type not in (''wavelength'', ''blind_resume'', ''keep_4_cut_4'', ''sports_feud'')'
      in v_definition
    ) = 0 then
    raise exception 'Sports Feud Daily publication scoring gate hotfix did not apply exactly';
  end if;
end
$patch$;

notify pgrst, 'reload schema';
