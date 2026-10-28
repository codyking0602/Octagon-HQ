-- Supersede the September 19 Millionaire launch schedules with the exact approved
-- no-Daily-Double rotations. Schedule identities are immutable, so this creates
-- new versions at the same cutover timestamp; created_at ordering makes them canonical.

do $fix$
declare
  v_cutover constant date := date '2026-09-19';
  v_ufc_version constant text := 'play-rotation-v9-millionaire-no-double';
  v_football_version constant text := 'football-daily-v11-millionaire-no-double';
  v_ufc_cycle constant text[] := array[
    'millionaire',
    'find_leader','wavelength','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','millionaire','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','blind_resume','millionaire','hit_the_number','who_am_i',
    'find_leader','wavelength','blind_resume','hit_the_number','who_am_i','millionaire',
    'find_leader','wavelength'
  ]::text[];
  v_football_cycle constant text[] := array[
    'millionaire',
    'find_leader','wavelength','hit_the_number','who_am_i',
    'find_leader','wavelength','millionaire','hit_the_number','who_am_i',
    'find_leader','wavelength','hit_the_number','millionaire','who_am_i',
    'find_leader','wavelength','hit_the_number','who_am_i','millionaire',
    'find_leader','wavelength'
  ]::text[];
begin
  if exists (
    select 1
    from private.daily_challenge_attempts attempt
    join private.daily_challenges daily on daily.id = attempt.daily_challenge_id
    where daily.central_day >= v_cutover
      and daily.schedule_version in (
        'play-rotation-v8-millionaire',
        'football-daily-v10-millionaire',
        v_ufc_version,
        v_football_version
      )
  ) then
    raise exception 'cannot replace the September 19+ rotation after an official attempt exists';
  end if;

  if coalesce(array_length(v_ufc_cycle, 1), 0) <> 26
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'keep_4_cut_4') <> 0 then
    raise exception 'corrected UFC Millionaire Daily cycle mix is invalid';
  end if;

  if coalesce(array_length(v_football_cycle, 1), 0) <> 22
    or (select count(*) from unnest(v_football_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game in ('blind_resume','keep_4_cut_4')) <> 0 then
    raise exception 'corrected Football Millionaire Daily cycle mix is invalid';
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions
    where version in (v_ufc_version, v_football_version)
  ) then
    raise exception 'corrected Millionaire Daily schedule identities already exist';
  end if;

  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values
    (v_ufc_version, 'America/Chicago', v_cutover, v_cutover, v_ufc_cycle, 'ufc'),
    (v_football_version, 'America/Chicago', v_cutover, v_cutover, v_football_cycle, 'football');

  if private.daily_challenge_schedule_for_day(v_cutover, 'ufc') is distinct from v_ufc_version
    or private.daily_challenge_expected_game(v_ufc_version, v_cutover) is distinct from 'millionaire'
    or private.daily_challenge_schedule_for_day(v_cutover, 'football') is distinct from v_football_version
    or private.daily_challenge_expected_game(v_football_version, v_cutover) is distinct from 'millionaire' then
    raise exception 'corrected September 19 Millionaire schedules did not become canonical';
  end if;
end
$fix$;
