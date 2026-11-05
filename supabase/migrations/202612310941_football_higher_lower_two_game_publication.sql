-- November 5 Football Daily incident: canonical Higher or Lower is published
-- with the two-game average scoring contract, but the shared publication gate
-- still lists only Find the Leader, Wavelength, and Hit the Number. Preserve
-- the existing grader, identity, RLS, and every other sport's publication rules.
do $patch$
declare
  v_signature constant regprocedure :=
    'public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,text)'::regprocedure;
  v_definition text;
  v_original constant text := 'p_game_type in (''wavelength'', ''find_leader'', ''hit_the_number'')';
  v_repaired constant text := 'p_game_type in (''wavelength'', ''find_leader'', ''hit_the_number'', ''higher_lower'')';
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(v_repaired in v_definition) = 0 then
    if position(v_original in v_definition) = 0 then
      raise exception 'Football Higher or Lower Daily publication gate changed; refusing unsafe patch';
    end if;
    execute replace(v_definition, v_original, v_repaired);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(v_repaired in v_definition) = 0
    or position('p_scoring_version = ''daily-two-game-average-score-v1''' in v_definition) = 0 then
    raise exception 'Football Higher or Lower two-game scoring gate was not repaired';
  end if;
end
$patch$;

notify pgrst, 'reload schema';
