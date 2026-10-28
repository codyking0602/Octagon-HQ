-- Future-only activation of the approved 2x Official Daily Higher or Lower weights.
-- Migration 407 installs the shared 2x10 server-authoritative grader first.
-- v20/v21 published and historical boards, attempts, scores and identities are immutable.
do $guard$
begin
  if private.daily_challenge_schedule_for_day(date '2026-10-26','football') <> 'football-daily-v21-locked-oct25'
     or private.daily_challenge_schedule_for_day(date '2026-10-27','ufc') <> 'ufc-daily-v21-48h-oct25'
     or private.daily_challenge_schedule_for_day(date '2026-11-01','nba') <> 'nba-daily-regular-v2-locked'
  then
    raise exception 'approved Higher or Lower cutover base schedules changed; re-audit canonical Daily ownership';
  end if;
  if exists (
    select 1 from private.daily_challenges d
    join private.daily_challenge_schedule_versions sv on sv.version=d.schedule_version
    where (sv.sport='football' and d.central_day >= date '2026-10-27')
       or (sv.sport='ufc' and d.central_day >= date '2026-10-29')
  ) then
    raise exception 'approved Higher or Lower cutover refused: future Daily board already published';
  end if;
end
$guard$;

insert into private.daily_challenge_schedule_versions(version,time_zone,anchor_day,starts_on,game_cycle,sport)
values
  ('football-daily-v22-higher-lower-oct27','America/Chicago',date '2026-10-27',date '2026-10-27',array[
    'wavelength',
    'average_fan',
    'bar_trivia',
    'sports_feud',
    'millionaire',
    'who_am_i',
    'average_fan',
    'find_leader',
    'millionaire',
    'higher_lower',
    'sports_feud',
    'wavelength',
    'hit_the_number',
    'bar_trivia',
    'average_fan',
    'sports_feud',
    'millionaire',
    'who_am_i',
    'find_leader',
    'bar_trivia',
    'average_fan',
    'wavelength',
    'millionaire',
    'sports_feud',
    'higher_lower',
    'who_am_i',
    'hit_the_number',
    'find_leader'
  ]::text[],'football'),
  ('ufc-daily-v22-higher-lower-oct29','America/Chicago',date '2026-10-29',date '2026-10-29',array[
    'hit_the_number',
    'find_leader',
    'bar_trivia',
    'average_fan',
    'millionaire',
    'higher_lower',
    'who_am_i',
    'sports_feud',
    'wavelength',
    'blind_resume',
    'average_fan',
    'find_leader',
    'millionaire',
    'bar_trivia',
    'hit_the_number',
    'sports_feud',
    'who_am_i',
    'average_fan',
    'millionaire',
    'wavelength',
    'higher_lower',
    'find_leader',
    'sports_feud',
    'bar_trivia',
    'blind_resume',
    'average_fan',
    'millionaire',
    'who_am_i',
    'wavelength',
    'sports_feud'
  ]::text[],'ufc');

-- v22 UFC games still publish once every 48 hours, not once per calendar day.
-- Resolve exactly from the immutable version's own anchor. v21 behavior stays intact.
create or replace function private.daily_challenge_expected_game(p_schedule_version text,p_day date)
returns text language plpgsql stable set search_path = '' as $fn$
declare v_schedule private.daily_challenge_schedule_versions;
  v_length integer; v_offset integer; v_index integer;
begin
  select * into v_schedule from private.daily_challenge_schedule_versions where version = p_schedule_version;
  if v_schedule.version is null then raise exception 'unknown daily schedule version %',p_schedule_version; end if;
  v_length := array_length(v_schedule.game_cycle, 1);
  if v_length is null or v_length = 0 then raise exception 'empty Daily schedule %',p_schedule_version; end if;
  if v_schedule.version in ('ufc-daily-v21-48h-oct25','ufc-daily-v22-higher-lower-oct29') then
    v_index := (private.daily_challenge_active_day(p_day,'ufc') - v_schedule.anchor_day) / 2;
    v_offset := ((v_index % v_length) + v_length) % v_length;
  else
    v_offset := case
      when v_schedule.sport = 'nba'
      then (((((p_day - v_schedule.anchor_day) / 2) % v_length) + v_length) % v_length)
      else (((p_day - v_schedule.anchor_day) % v_length) + v_length) % v_length
    end;
  end if;
  return v_schedule.game_cycle[v_offset + 1];
end
$fn$;

-- The actual canonical six-month publication dates must never collide, and
-- weights, 48-hour identities and the approved themed Football days stay fixed.
do $verify$
declare v_f text[]; v_u text[];v_n text[];v_day date;
  v_fgame text;v_ugame text;v_ngame text;
begin
  select game_cycle into strict v_f from private.daily_challenge_schedule_versions where version='football-daily-v22-higher-lower-oct27';
  select game_cycle into strict v_u from private.daily_challenge_schedule_versions where version='ufc-daily-v22-higher-lower-oct29';
  select game_cycle into strict v_n from private.daily_challenge_schedule_versions where version='nba-daily-regular-v2-locked';
  if cardinality(v_f)<>28 or cardinality(v_u)<>30 or cardinality(v_n)<>28 then
    raise exception 'Higher or Lower cycle lengths are incorrect';
  end if;
  if (select count(*) from unnest(v_f) g where g='higher_lower')<>2
    or (select count(*) from unnest(v_u) g where g='higher_lower')<>2
    or (select count(*) from unnest(v_n) g where g='higher_lower')<>2
    or (select count(*) from unnest(v_f) g where g='average_fan')<>4
    or (select count(*) from unnest(v_u) g where g='average_fan')<>4
    or (select count(*) from unnest(v_n) g where g='average_fan')<>4
  then raise exception 'approved weights changed';end if;
  if private.daily_challenge_expected_game(private.daily_challenge_schedule_for_day(date '2026-10-26','football'),date '2026-10-26')<>'millionaire'
     or private.daily_challenge_expected_game(private.daily_challenge_schedule_for_day(date '2026-11-27','football'),date '2026-11-27')<>'sports_feud'
     or private.daily_challenge_expected_game(private.daily_challenge_schedule_for_day(date '2026-12-07','football'),date '2026-12-07')<>'bar_trivia'
  then raise exception 'approved themed Football days drifted';end if;
  for v_day in select d::date from generate_series(date '2026-10-25',date '2027-04-24',interval '1 day') d loop
    v_fgame := private.daily_challenge_expected_game(private.daily_challenge_schedule_for_day(v_day,'football'),v_day);
    v_ugame := null;v_ngame := null;
    if private.daily_challenge_active_day(v_day,'ufc')=v_day then
      v_ugame := private.daily_challenge_expected_game(private.daily_challenge_schedule_for_day(v_day,'ufc'),v_day);
    end if;
    if v_day between date '2026-11-01' and date '2027-04-11'
       and private.daily_challenge_active_day(v_day,'nba')=v_day then
      v_ngame := private.daily_challenge_expected_game(private.daily_challenge_schedule_for_day(v_day,'nba'),v_day);
    end if;
    if v_fgame=v_ugame or v_fgame=v_ngame or v_ugame=v_ngame then
      raise exception 'same-game cross-sport collision %: % / % / %',v_day,v_fgame,v_ugame,v_ngame;
    end if;
  end loop;
end
$verify$;
