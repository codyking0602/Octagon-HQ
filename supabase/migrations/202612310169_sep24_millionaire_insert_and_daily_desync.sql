-- One-time September 24 Millionaire encore for both Daily products.
-- Preserve the existing Sports Feud-era cadence by shifting every previously scheduled
-- September 24+ game one calendar day later. Desynchronize the shared Friday/Saturday
-- Find the Leader + Wavelength pair by swapping only UFC September 25/26.
--
-- Result:
--   9/24: Millionaire / Millionaire
--   9/25: UFC Wavelength / Football Find the Leader
--   9/26: UFC Find the Leader / Football Wavelength
--   9/27+: resume each prior Sports Feud cycle one day later.
do $schedule$
declare
  v_cutover constant date := date '2026-09-24';
  v_ufc_source constant text := 'play-rotation-v10-sports-feud';
  v_football_source constant text := 'football-daily-v12-sports-feud';

  v_ufc_insert constant text := 'play-rotation-v11-sep24-millionaire-insert';
  v_ufc_weekend constant text := 'play-rotation-v12-sep25-weekend-desync';
  v_ufc_shifted constant text := 'play-rotation-v13-sep27-shifted';

  v_football_insert constant text := 'football-daily-v13-sep24-millionaire-insert';
  v_football_shifted constant text := 'football-daily-v14-sep25-shifted';

  v_ufc_shifted_cycle constant text[] := array[
    'blind_resume','hit_the_number','who_am_i','millionaire',
    'find_leader','wavelength','sports_feud','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','millionaire','blind_resume','sports_feud','hit_the_number',
    'who_am_i','find_leader','wavelength','blind_resume','millionaire','hit_the_number',
    'sports_feud','who_am_i','find_leader','wavelength','millionaire','sports_feud',
    'find_leader','wavelength'
  ]::text[];

  v_football_shifted_cycle constant text[] := array[
    'find_leader','wavelength','hit_the_number','who_am_i','millionaire',
    'find_leader','wavelength','sports_feud','hit_the_number','who_am_i',
    'find_leader','wavelength','millionaire','hit_the_number','sports_feud','who_am_i',
    'find_leader','wavelength','hit_the_number','who_am_i','millionaire',
    'sports_feud','find_leader','wavelength','millionaire','sports_feud'
  ]::text[];
begin
  -- The one-time Sep 23 deployment window is now historical. Keep this migration
  -- replayable for fresh-database verification; the source-identity and
  -- already-materialized-content guards below remain the production safety boundary.

  if private.daily_challenge_schedule_for_day(date '2026-09-23', 'ufc') is distinct from v_ufc_source
    or private.daily_challenge_expected_game(v_ufc_source, date '2026-09-23') is distinct from 'sports_feud'
    or private.daily_challenge_schedule_for_day(date '2026-09-23', 'football') is distinct from v_football_source
    or private.daily_challenge_expected_game(v_football_source, date '2026-09-23') is distinct from 'sports_feud' then
    raise exception 'September 23 Sports Feud schedule identity changed before the Millionaire insertion';
  end if;

  if exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    where daily.central_day >= v_cutover
      and schedule.sport in ('ufc', 'football')
  ) then
    raise exception 'refusing September 24 insertion because future Daily content is already materialized';
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version in (
      v_ufc_insert, v_ufc_weekend, v_ufc_shifted,
      v_football_insert, v_football_shifted
    )
  ) then
    raise exception 'September 24 Daily schedule identities already exist';
  end if;

  if coalesce(array_length(v_ufc_shifted_cycle, 1), 0) <> 30
    or (select count(*) from unnest(v_ufc_shifted_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc_shifted_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc_shifted_cycle) game where game = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc_shifted_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_ufc_shifted_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc_shifted_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_ufc_shifted_cycle) game where game = 'sports_feud') <> 4 then
    raise exception 'shifted UFC Sports Feud cycle mix is invalid';
  end if;

  if coalesce(array_length(v_football_shifted_cycle, 1), 0) <> 26
    or (select count(*) from unnest(v_football_shifted_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_football_shifted_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_football_shifted_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_football_shifted_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football_shifted_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_football_shifted_cycle) game where game = 'sports_feud') <> 4 then
    raise exception 'shifted Football Sports Feud cycle mix is invalid';
  end if;

  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values
    (v_ufc_insert, 'America/Chicago', date '2026-09-24', date '2026-09-24', array['millionaire']::text[], 'ufc'),
    (v_football_insert, 'America/Chicago', date '2026-09-24', date '2026-09-24', array['millionaire']::text[], 'football'),

    -- One-time weekend desync: Friday UFC Wavelength, Saturday UFC Find the Leader.
    (v_ufc_weekend, 'America/Chicago', date '2026-09-25', date '2026-09-25',
      array['wavelength','find_leader']::text[], 'ufc'),

    -- Resume the old UFC cycle on Sunday at the game originally scheduled for Saturday.
    (v_ufc_shifted, 'America/Chicago', date '2026-09-27', date '2026-09-27',
      v_ufc_shifted_cycle, 'ufc'),

    -- Football simply resumes Friday at the game originally scheduled for Thursday.
    (v_football_shifted, 'America/Chicago', date '2026-09-25', date '2026-09-25',
      v_football_shifted_cycle, 'football');

  if private.daily_challenge_schedule_for_day(date '2026-09-24', 'ufc') is distinct from v_ufc_insert
    or private.daily_challenge_expected_game(v_ufc_insert, date '2026-09-24') is distinct from 'millionaire'
    or private.daily_challenge_schedule_for_day(date '2026-09-24', 'football') is distinct from v_football_insert
    or private.daily_challenge_expected_game(v_football_insert, date '2026-09-24') is distinct from 'millionaire' then
    raise exception 'September 24 Millionaire insertion did not become canonical';
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-25', 'ufc') is distinct from v_ufc_weekend
    or private.daily_challenge_expected_game(v_ufc_weekend, date '2026-09-25') is distinct from 'wavelength'
    or private.daily_challenge_expected_game(v_ufc_weekend, date '2026-09-26') is distinct from 'find_leader'
    or private.daily_challenge_schedule_for_day(date '2026-09-25', 'football') is distinct from v_football_shifted
    or private.daily_challenge_expected_game(v_football_shifted, date '2026-09-25') is distinct from 'find_leader'
    or private.daily_challenge_expected_game(v_football_shifted, date '2026-09-26') is distinct from 'wavelength' then
    raise exception 'September 25/26 Daily desynchronization is invalid';
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-27', 'ufc') is distinct from v_ufc_shifted
    or private.daily_challenge_expected_game(v_ufc_shifted, date '2026-09-27') is distinct from 'blind_resume'
    or private.daily_challenge_expected_game(v_ufc_shifted, date '2026-09-30') is distinct from 'millionaire'
    or private.daily_challenge_expected_game(v_football_shifted, date '2026-09-29') is distinct from 'millionaire' then
    raise exception 'shifted cadence did not preserve the already-scheduled Millionaire slots';
  end if;
end
$schedule$;
