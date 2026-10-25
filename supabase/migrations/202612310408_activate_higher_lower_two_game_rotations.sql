-- Future-only activation after the merged v21 cadence and verified SQL two-board grader.
-- Preserve all existing boards/attempts. A second 28-day Football half-cycle
-- avoids the three forced collisions of a 28/30/28 three-sport pattern.
do $guard$
begin
 if private.daily_challenge_schedule_for_day(date '2026-10-26','football') <> 'football-daily-v21-locked-oct25'
    or private.daily_challenge_schedule_for_day(date '2026-10-27','ufc') <> 'ufc-daily-v21-48h-oct25'
    or private.daily_challenge_schedule_for_day(date '2026-11-01','nba') <> 'nba-daily-regular-v2-locked' then
   raise exception 'Higher or Lower activation base cadence changed; inspect current canonical schedule';
 end if;
 if exists(
   select 1 from private.daily_challenges c
   join private.daily_challenge_schedule_versions v on v.version=c.schedule_version
   where (v.sport='football' and c.central_day>=date '2026-10-27')
      or (v.sport='ufc' and c.central_day>=date '2026-10-29')
 ) then
   raise exception 'Higher or Lower activation refuses to replace already published future boards';
 end if;
end
$guard$;

insert into private.daily_challenge_schedule_versions(version,time_zone,anchor_day,starts_on,game_cycle,sport)
values
 ('football-daily-v22-higher-lower-2x-oct25','America/Chicago',date '2026-10-25',date '2026-10-27',array[
    'higher_lower',
    'millionaire',
    'who_am_i',
    'average_fan',
    'wavelength',
    'sports_feud',
    'bar_trivia',
    'hit_the_number',
    'millionaire',
    'average_fan',
    'who_am_i',
    'find_leader',
    'sports_feud',
    'wavelength',
    'higher_lower',
    'bar_trivia',
    'millionaire',
    'average_fan',
    'find_leader',
    'who_am_i',
    'sports_feud',
    'hit_the_number',
    'wavelength',
    'millionaire',
    'average_fan',
    'bar_trivia',
    'find_leader',
    'sports_feud',
    'higher_lower',
    'average_fan',
    'who_am_i',
    'millionaire',
    'wavelength',
    'sports_feud',
    'bar_trivia',
    'average_fan',
    'millionaire',
    'find_leader',
    'who_am_i',
    'wavelength',
    'hit_the_number',
    'sports_feud',
    'higher_lower',
    'bar_trivia',
    'millionaire',
    'average_fan',
    'find_leader',
    'who_am_i',
    'sports_feud',
    'hit_the_number',
    'wavelength',
    'millionaire',
    'average_fan',
    'bar_trivia',
    'find_leader',
    'sports_feud'
 ]::text[],'football'),
 ('ufc-daily-v22-higher-lower-2x-oct25','America/Chicago',date '2026-10-25',date '2026-10-29',array[
    'find_leader',
    'sports_feud',
    'bar_trivia',
    'millionaire',
    'hit_the_number',
    'average_fan',
    'who_am_i',
    'blind_resume',
    'wavelength',
    'millionaire',
    'find_leader',
    'sports_feud',
    'bar_trivia',
    'higher_lower',
    'average_fan',
    'millionaire',
    'who_am_i',
    'sports_feud',
    'wavelength',
    'hit_the_number',
    'find_leader',
    'average_fan',
    'bar_trivia',
    'millionaire',
    'blind_resume',
    'sports_feud',
    'who_am_i',
    'higher_lower',
    'average_fan',
    'wavelength'
 ]::text[],'ufc');

-- v21 UFC stays immutable; both future UFC versions need two-day index math.
create or replace function private.daily_challenge_expected_game(p_schedule_version text,p_day date)
returns text language plpgsql stable set search_path = '' as $fn$
declare v_schedule private.daily_challenge_schedule_versions;
  v_length integer; v_offset integer; v_index integer;
begin
  select * into v_schedule from private.daily_challenge_schedule_versions where version = p_schedule_version;
  if v_schedule.version is null then raise exception 'unknown daily schedule version %',p_schedule_version; end if;
  v_length := array_length(v_schedule.game_cycle, 1);
  if v_length is null or v_length = 0 then raise exception 'empty Daily schedule %',p_schedule_version; end if;
  if v_schedule.version in ('ufc-daily-v21-48h-oct25','ufc-daily-v22-higher-lower-2x-oct25') then
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
end;
$fn$;

-- Fail closed on frequency, themed date, public NBA boundary and collisions.
do $verify$
declare v_f text[];v_u text[];v_day date;v_fg text;v_ug text;v_ng text;v_uver text;
begin
 select game_cycle into strict v_f from private.daily_challenge_schedule_versions where version='football-daily-v22-higher-lower-2x-oct25';
 select game_cycle into strict v_u from private.daily_challenge_schedule_versions where version='ufc-daily-v22-higher-lower-2x-oct25';
 if cardinality(v_f)<>56 or cardinality(v_u)<>30 then raise exception 'invalid Higher or Lower cycle lengths'; end if;
 if (select count(*) from unnest(v_f) g where g='average_fan')<>8
   or (select count(*) from unnest(v_f) g where g='higher_lower')<>4
   or (select count(*) from unnest(v_f) g where g='hit_the_number')<>4
   or (select count(*) from unnest(v_u) g where g='average_fan')<>4
   or (select count(*) from unnest(v_u) g where g='higher_lower')<>2
   or (select count(*) from unnest(v_u) g where g='hit_the_number')<>2
 then raise exception 'approved 4x/2x Daily weights drifted';end if;
 if private.daily_challenge_schedule_for_day(date '2026-10-26','football') <> 'football-daily-v21-locked-oct25'
   or private.daily_challenge_schedule_for_day(date '2026-10-27','football') <> 'football-daily-v22-higher-lower-2x-oct25'
   or private.daily_challenge_schedule_for_day(date '2026-10-27','ufc') <> 'ufc-daily-v21-48h-oct25'
   or private.daily_challenge_schedule_for_day(date '2026-10-29','ufc') <> 'ufc-daily-v22-higher-lower-2x-oct25'
 then raise exception 'future-only schedule version cutover drift';end if;
 if private.daily_challenge_expected_game('football-daily-v22-higher-lower-2x-oct25',date '2026-11-27') <> 'sports_feud'
   or private.daily_challenge_expected_game('football-daily-v22-higher-lower-2x-oct25',date '2026-12-07') <> 'bar_trivia'
 then raise exception 'approved holiday-themed Football Daily was displaced';end if;
 for v_day in select d::date from generate_series(date '2026-10-25',date '2027-04-24',interval '1 day') d loop
   v_fg := private.daily_challenge_expected_game(private.daily_challenge_schedule_for_day(v_day,'football'),v_day);
   v_ug:=null;v_ng:=null;
   if private.daily_challenge_active_day(v_day,'ufc')=v_day then
     v_uver:=private.daily_challenge_schedule_for_day(v_day,'ufc');
     v_ug:=private.daily_challenge_expected_game(v_uver,v_day);
   end if;
   if v_day between date '2026-11-01' and date '2027-04-10'
     and private.daily_challenge_active_day(v_day,'nba')=v_day then
     v_ng:=private.daily_challenge_expected_game('nba-daily-regular-v2-locked',v_day);
   end if;
   if v_fg is not distinct from v_ug or v_fg is not distinct from v_ng or (v_ug is not null and v_ug is not distinct from v_ng) then
     raise exception 'cross-sport Higher or Lower Daily collision on %',v_day;
   end if;
 end loop;
end
$verify$;
