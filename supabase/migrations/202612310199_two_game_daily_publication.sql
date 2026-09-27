-- Allow the canonical two-game Daily scoring contract through the existing
-- immutable Daily publication guard. Keep all other publisher validation intact.

do $patch$
declare
  v_definition text;
  v_needle text := E'  if not (\n    (p_game_type = ''wavelength'' and p_scoring_version in (''play-official-score-v1'', ''play-official-score-v2''))';
  v_replacement text := E'  if not (\n    (p_game_type in (''wavelength'', ''find_leader'', ''hit_the_number'')\n      and p_scoring_version = ''daily-two-game-average-score-v1'')\n    or (p_game_type = ''wavelength'' and p_scoring_version in (''play-official-score-v1'', ''play-official-score-v2''))';
begin
  select pg_get_functiondef(
    'public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,text)'::regprocedure
  )
  into v_definition;

  if position('daily-two-game-average-score-v1' in v_definition) > 0 then
    return;
  end if;

  if position(v_needle in v_definition) = 0 then
    raise exception 'publish_daily_challenge_setup scoring guard changed before two-game publication cutover';
  end if;

  v_definition := replace(v_definition, v_needle, v_replacement);
  execute v_definition;

  select pg_get_functiondef(
    'public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,text)'::regprocedure
  )
  into v_definition;

  if position('daily-two-game-average-score-v1' in v_definition) = 0
    or position('''wavelength'', ''find_leader'', ''hit_the_number''' in v_definition) = 0 then
    raise exception 'two-game Daily publication scoring contract did not activate';
  end if;
end
$patch$;
