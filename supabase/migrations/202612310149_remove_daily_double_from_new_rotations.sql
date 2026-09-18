-- Correct the September 19 Millionaire launch cycles before the cutover day.
-- Daily Double remains available historically but is not scheduled in either new cycle.

do $fix$
declare
  v_cutover constant date := date '2026-09-19';
  v_ufc_version constant text := 'play-rotation-v8-millionaire';
  v_football_version constant text := 'football-daily-v10-millionaire';
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
      and daily.schedule_version in (v_ufc_version, v_football_version)
  ) then
    raise exception 'cannot correct Millionaire Daily rotation after a September 19+ attempt exists';
  end if;

  -- Prematerialized future boards are safe to discard before anyone has played them.
  delete from private.daily_challenges daily
  where daily.central_day >= v_cutover
    and daily.schedule_version in (v_ufc_version, v_football_version);

  update private.daily_challenge_schedule_versions
  set game_cycle = v_ufc_cycle
  where version = v_ufc_version
    and sport = 'ufc';

  if not found then
    raise exception 'UFC Millionaire schedule identity is missing';
  end if;

  update private.daily_challenge_schedule_versions
  set game_cycle = v_football_cycle
  where version = v_football_version
    and sport = 'football';

  if not found then
    raise exception 'Football Millionaire schedule identity is missing';
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

  if private.daily_challenge_schedule_for_day(v_cutover, 'ufc') is distinct from v_ufc_version
    or private.daily_challenge_expected_game(v_ufc_version, v_cutover) is distinct from 'millionaire'
    or private.daily_challenge_schedule_for_day(v_cutover, 'football') is distinct from v_football_version
    or private.daily_challenge_expected_game(v_football_version, v_cutover) is distinct from 'millionaire' then
    raise exception 'September 19 Millionaire debut changed while correcting the rotations';
  end if;
end
$fix$;
