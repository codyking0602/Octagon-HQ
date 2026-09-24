-- Replace the temporary September 24 Daily insertion with the approved weighted rotations.
--
-- Preference weights:
--   UFC (30 days):
--     Find the Leader 5 / Wavelength 5 / Millionaire 5 /
--     Sports Feud 4 / Who Am I 4 / Blind Resume 4 / Hit the Number 3
--   Football (26 days):
--     Find the Leader 5 / Wavelength 5 / Millionaire 5 /
--     Sports Feud 4 / Who Am I 4 / Hit the Number 3
--
-- Approved staggered opening:
--   9/24: UFC Sports Feud / Football Millionaire
--   9/25: UFC Who Am I   / Football Sports Feud
--   9/26: UFC Millionaire / Football Who Am I
--
-- Existing September 23 Sports Feud rows/results stay immutable. The multiple schedule
-- versions below intentionally supersede the future-only v169 cutovers at their existing
-- starts_on boundaries without deleting or rewriting those immutable schedule identities.
do $schedule$
declare
  v_cutover constant date := date '2026-09-24';

  v_ufc_sep24 constant text := 'play-rotation-v14-weighted-sep24';
  v_ufc_sep25 constant text := 'play-rotation-v15-weighted-sep25';
  v_ufc_sep27 constant text := 'play-rotation-v16-weighted-sep27';

  v_football_sep24 constant text := 'football-daily-v15-weighted-sep24';
  v_football_sep25 constant text := 'football-daily-v16-weighted-sep25';

  v_ufc_cycle constant text[] := array[
    'sports_feud',
    'who_am_i',
    'millionaire',
    'find_leader',
    'wavelength',
    'blind_resume',
    'hit_the_number',
    'millionaire',
    'sports_feud',
    'find_leader',
    'wavelength',
    'who_am_i',
    'blind_resume',
    'millionaire',
    'hit_the_number',
    'find_leader',
    'sports_feud',
    'wavelength',
    'blind_resume',
    'who_am_i',
    'millionaire',
    'find_leader',
    'hit_the_number',
    'wavelength',
    'sports_feud',
    'blind_resume',
    'who_am_i',
    'millionaire',
    'wavelength',
    'find_leader'
  ]::text[];

  v_football_cycle constant text[] := array[
    'millionaire',
    'sports_feud',
    'who_am_i',
    'wavelength',
    'find_leader',
    'millionaire',
    'sports_feud',
    'who_am_i',
    'wavelength',
    'hit_the_number',
    'find_leader',
    'millionaire',
    'sports_feud',
    'wavelength',
    'find_leader',
    'who_am_i',
    'millionaire',
    'hit_the_number',
    'wavelength',
    'find_leader',
    'sports_feud',
    'millionaire',
    'wavelength',
    'who_am_i',
    'find_leader',
    'hit_the_number'
  ]::text[];
begin
  if private.daily_challenge_central_day(now()) is distinct from date '2026-09-23' then
    raise exception 'weighted Daily rotation cutover must deploy on September 23 Central';
  end if;

  -- Prove the temporary v169 future schedule is still the thing being superseded.
  if private.daily_challenge_schedule_for_day(date '2026-09-24', 'ufc')
      is distinct from 'play-rotation-v11-sep24-millionaire-insert'
    or private.daily_challenge_schedule_for_day(date '2026-09-25', 'ufc')
      is distinct from 'play-rotation-v12-sep25-weekend-desync'
    or private.daily_challenge_schedule_for_day(date '2026-09-27', 'ufc')
      is distinct from 'play-rotation-v13-sep27-shifted'
    or private.daily_challenge_schedule_for_day(date '2026-09-24', 'football')
      is distinct from 'football-daily-v13-sep24-millionaire-insert'
    or private.daily_challenge_schedule_for_day(date '2026-09-25', 'football')
      is distinct from 'football-daily-v14-sep25-shifted' then
    raise exception 'future Daily schedule changed before weighted rotation cutover';
  end if;

  if exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    where daily.central_day >= v_cutover
      and schedule.sport in ('ufc', 'football')
  ) then
    raise exception 'refusing weighted rotation cutover because future Daily content is already materialized';
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version in (
      v_ufc_sep24, v_ufc_sep25, v_ufc_sep27,
      v_football_sep24, v_football_sep25
    )
  ) then
    raise exception 'weighted Daily schedule identity already exists';
  end if;

  if coalesce(array_length(v_ufc_cycle, 1), 0) <> 30
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'millionaire') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'sports_feud') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'hit_the_number') <> 3
    or 'keep_4_cut_4' = any(v_ufc_cycle)
    or 'blind_rank_5' = any(v_ufc_cycle) then
    raise exception 'approved UFC weighted cycle mix is invalid';
  end if;

  if coalesce(array_length(v_football_cycle, 1), 0) <> 26
    or (select count(*) from unnest(v_football_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'millionaire') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'sports_feud') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'hit_the_number') <> 3
    or 'blind_resume' = any(v_football_cycle)
    or 'keep_4_cut_4' = any(v_football_cycle)
    or 'blind_rank_5' = any(v_football_cycle) then
    raise exception 'approved Football weighted cycle mix is invalid';
  end if;

  -- Reuse the same anchored cycle at each prior future boundary. This lets the immutable
  -- v169 schedule rows remain in place while ensuring the weighted sequence wins resolution.
  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values
    (v_ufc_sep24, 'America/Chicago', v_cutover, date '2026-09-24', v_ufc_cycle, 'ufc'),
    (v_ufc_sep25, 'America/Chicago', v_cutover, date '2026-09-25', v_ufc_cycle, 'ufc'),
    (v_ufc_sep27, 'America/Chicago', v_cutover, date '2026-09-27', v_ufc_cycle, 'ufc'),
    (v_football_sep24, 'America/Chicago', v_cutover, date '2026-09-24', v_football_cycle, 'football'),
    (v_football_sep25, 'America/Chicago', v_cutover, date '2026-09-25', v_football_cycle, 'football');

  if private.daily_challenge_schedule_for_day(date '2026-09-24', 'ufc') is distinct from v_ufc_sep24
    or private.daily_challenge_expected_game(v_ufc_sep24, date '2026-09-24') is distinct from 'sports_feud'
    or private.daily_challenge_schedule_for_day(date '2026-09-25', 'ufc') is distinct from v_ufc_sep25
    or private.daily_challenge_expected_game(v_ufc_sep25, date '2026-09-25') is distinct from 'who_am_i'
    or private.daily_challenge_expected_game(v_ufc_sep25, date '2026-09-26') is distinct from 'millionaire'
    or private.daily_challenge_schedule_for_day(date '2026-09-27', 'ufc') is distinct from v_ufc_sep27
    or private.daily_challenge_expected_game(v_ufc_sep27, date '2026-09-27') is distinct from 'find_leader' then
    raise exception 'UFC weighted rotation did not become canonical';
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-24', 'football') is distinct from v_football_sep24
    or private.daily_challenge_expected_game(v_football_sep24, date '2026-09-24') is distinct from 'millionaire'
    or private.daily_challenge_schedule_for_day(date '2026-09-25', 'football') is distinct from v_football_sep25
    or private.daily_challenge_expected_game(v_football_sep25, date '2026-09-25') is distinct from 'sports_feud'
    or private.daily_challenge_expected_game(v_football_sep25, date '2026-09-26') is distinct from 'who_am_i'
    or private.daily_challenge_expected_game(v_football_sep25, date '2026-09-27') is distinct from 'wavelength' then
    raise exception 'Football weighted rotation did not become canonical';
  end if;

  -- The first full 30 days stay intentionally staggered across sports wherever both cycles
  -- have an active slot; later drift is natural because the cycles are different lengths.
  if exists (
    select 1
    from generate_series(0, 29) as series(offset_days)
    where v_ufc_cycle[(offset_days % 30) + 1]
      = v_football_cycle[(offset_days % 26) + 1]
  ) then
    raise exception 'approved stagger unexpectedly aligns a game in the first 30 days';
  end if;
end
$schedule$;
