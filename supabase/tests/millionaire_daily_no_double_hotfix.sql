do $test$
declare
  v_cutover constant date := date '2026-09-19';
  v_ufc private.daily_challenge_schedule_versions%rowtype;
  v_football private.daily_challenge_schedule_versions%rowtype;
begin
  select * into strict v_ufc
  from private.daily_challenge_schedule_versions
  where version = 'play-rotation-v8-millionaire';

  select * into strict v_football
  from private.daily_challenge_schedule_versions
  where version = 'football-daily-v10-millionaire';

  if array_length(v_ufc.game_cycle, 1) <> 26
    or (select count(*) from unnest(v_ufc.game_cycle) g where g = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc.game_cycle) g where g = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc.game_cycle) g where g = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) g where g = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) g where g = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) g where g = 'millionaire') <> 4
    or 'keep_4_cut_4' = any(v_ufc.game_cycle) then
    raise exception 'UFC post-hotfix rotation is wrong';
  end if;

  if array_length(v_football.game_cycle, 1) <> 22
    or (select count(*) from unnest(v_football.game_cycle) g where g = 'find_leader') <> 5
    or (select count(*) from unnest(v_football.game_cycle) g where g = 'wavelength') <> 5
    or (select count(*) from unnest(v_football.game_cycle) g where g = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_football.game_cycle) g where g = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football.game_cycle) g where g = 'millionaire') <> 4
    or 'keep_4_cut_4' = any(v_football.game_cycle)
    or 'blind_resume' = any(v_football.game_cycle) then
    raise exception 'Football post-hotfix rotation is wrong';
  end if;

  if private.daily_challenge_expected_game(v_ufc.version, v_cutover) <> 'millionaire'
    or private.daily_challenge_expected_game(v_football.version, v_cutover) <> 'millionaire' then
    raise exception 'September 19 must remain Millionaire for both sports';
  end if;
end
$test$;
