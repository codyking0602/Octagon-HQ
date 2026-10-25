\set ON_ERROR_STOP on
begin;
select set_config('request.jwt.claim.role','service_role',true);

do $test$
declare v_day date;v_sport text;v_start date;v_version text;v_len integer;
  v_game text;v_football text;v_ufc text;v_nba text;
  v_counts integer[] := array[0,0,0]; v_dup integer:=0;
  v_old jsonb;v_new jsonb;v_cycle text[];
begin
  if private.daily_challenge_schedule_for_day(date '2026-10-24','ufc') <> 'play-rotation-v20-resume-v18-oct3'
    or private.daily_challenge_schedule_for_day(date '2026-10-24','football') <> 'football-daily-v20-resume-v18-oct3'
  then raise exception 'historical Daily schedules were changed';end if;

  foreach v_sport in array array['football','ufc','nba']::text[] loop
    v_version := case v_sport when 'football' then 'football-daily-v21-locked-oct25'
      when 'ufc' then 'ufc-daily-v21-48h-oct25' else 'nba-daily-regular-v2-locked' end;
    select game_cycle into strict v_cycle from private.daily_challenge_schedule_versions where version=v_version;
    v_len := cardinality(v_cycle);
    if v_len <> case when v_sport='football' then 26 else 28 end
      or (select count(*) from unnest(v_cycle) g where g='average_fan')<>4
      or (select count(*) from unnest(v_cycle) g where g='sports_feud')<>4
      or (select count(*) from unnest(v_cycle) g where g='millionaire')<>4
    then raise exception '% cycle weights changed',v_sport;end if;
    if v_sport<>'nba' and ('higher_lower'=any(v_cycle)
      or (select count(*) from unnest(v_cycle) g where g='hit_the_number')<>2)
    then raise exception '% unfinished game or Hit the Number weight altered',v_sport;end if;
    if v_sport='nba' and (select count(*) from unnest(v_cycle) g where g='higher_lower')<>2
    then raise exception 'NBA Higher/Lower weight changed';end if;
    for v_game in select distinct unnest(v_cycle) loop
      declare v_appearance integer[];v_gap integer;v_expected numeric;v_unit integer;
      begin
        select array_agg(slot.i order by slot.i) into v_appearance
          from unnest(v_cycle) with ordinality slot(game,i) where slot.game=v_game;
        v_unit:=case when v_sport='football' then 1 else 2 end;
        v_expected:=(v_len*v_unit)::numeric/cardinality(v_appearance);
        for i in 1..cardinality(v_appearance) loop
          v_gap:=v_unit*(case when i=cardinality(v_appearance) then v_appearance[1]+v_len
            else v_appearance[i+1] end - v_appearance[i]);
          if abs(v_gap-v_expected)>5 then
            raise exception '% % spacing gap % exceeds intended %',v_sport,v_game,v_gap,v_expected;
          end if;
        end loop;
      end;
    end loop;
  end loop;

  for v_day in select d::date from generate_series(date '2026-10-25',date '2027-04-24',interval '1 day') d loop
    v_football:=private.daily_challenge_expected_game(
      private.daily_challenge_schedule_for_day(v_day,'football'),v_day);
    v_counts[1]:=v_counts[1]+1;
    v_ufc:=null;v_nba:=null;
    if private.daily_challenge_active_day(v_day,'ufc')=v_day then
      v_counts[2]:=v_counts[2]+1;
      v_ufc:=private.daily_challenge_expected_game(
        private.daily_challenge_schedule_for_day(v_day,'ufc'),v_day);
    end if;
    if v_day between date '2026-11-01' and date '2027-04-11'
      and private.daily_challenge_active_day(v_day,'nba')=v_day then
      v_counts[3]:=v_counts[3]+1;
      v_nba:=private.daily_challenge_expected_game(
        private.daily_challenge_schedule_for_day(v_day,'nba'),v_day);
    end if;
    if v_football = v_ufc or v_football = v_nba or v_ufc = v_nba then
      raise exception 'cross-sport game collision on %: % / % / %',v_day,v_football,v_ufc,v_nba;
    end if;
    if v_day between date '2026-11-01' and date '2027-04-11'
      and v_nba is not null and v_ufc is not null then raise exception 'UFC/NBA date collision %',v_day;end if;
  end loop;
  if v_counts<>array[182,91,81] then raise exception 'six-month cadence totals changed: %',v_counts;end if;
  v_old:=public.get_daily_challenge_materialization_request('ufc','2026-10-25T20:00:00Z'::timestamptz);
  v_new:=public.get_daily_challenge_materialization_request('ufc','2026-10-26T20:00:00Z'::timestamptz);
  if v_old->>'central_day'<>'2026-10-25' or v_new->>'central_day'<>'2026-10-25'
    or v_old->>'schedule_version'<>v_new->>'schedule_version'
    or v_old->>'expected_game'<>v_new->>'expected_game' then
    raise exception 'UFC retry must resolve exactly the same 48-hour board: % / %',v_old,v_new;
  end if;
  v_old:=public.get_daily_challenge_materialization_request('nba','2026-11-01T20:00:00Z'::timestamptz);
  v_new:=public.get_daily_challenge_materialization_request('nba','2026-11-02T20:00:00Z'::timestamptz);
  if v_old->>'central_day'<>'2026-11-01' or v_old->>'schedule_version'<>v_new->>'schedule_version'
    or v_old->>'expected_game'<>v_new->>'expected_game' then raise exception 'NBA retry identity drift';end if;
  if private.daily_challenge_active_day(date '2026-11-01','ufc')<>date '2026-10-31'
     or private.daily_challenge_active_day(date '2026-11-01','nba')<>date '2026-11-01'
     or private.daily_challenge_active_day(date '2027-04-12','nba')<>date '2027-04-11'
  then raise exception 'UFC/NBA release, DST or regular-season close drifted';end if;
  if not exists(select 1 from pg_trigger where tgname='enforce_future_daily_publication_cadence' and not tgisinternal)
  then raise exception 'publication cadence gate missing';end if;
end;
$test$;
-- A repeated materialization must resolve one immutable board identity, while
-- attempting to create an extra board on the intervening day fails closed.
do $publication$
declare v_first jsonb;v_retry jsonb;v_rejected boolean:=false; v_fallback_rejected boolean:=false;
begin
  v_first:=public.publish_daily_challenge_setup(
    date '2026-10-25','ufc-daily-v21-48h-oct25','find_leader',
    'cadence-proof:ufc:2026-10-25','cadence-proof-v1','daily-two-game-average-score-v1',
    '{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,null);
  v_retry:=public.publish_daily_challenge_setup(
    date '2026-10-25','ufc-daily-v21-48h-oct25','find_leader',
    'cadence-proof:ufc:2026-10-25','cadence-proof-v1','daily-two-game-average-score-v1',
    '{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,null);
  if v_first->>'id' is null or v_first->>'id' is distinct from v_retry->>'id' then
    raise exception 'Daily publication retry created a different identity';
  end if;
  begin
    perform public.publish_daily_challenge_setup(
      date '2026-10-26','ufc-daily-v21-48h-oct25','find_leader',
      'cadence-proof:ufc:2026-10-26','cadence-proof-v1','daily-two-game-average-score-v1',
      '{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,null);
  exception when others then v_rejected:=true;
  end;
  if not v_rejected then raise exception 'UFC off-day publication was allowed';end if;
  begin
    perform public.publish_daily_challenge_setup(
      date '2026-10-25','football-daily-v21-locked-oct25','find_leader',
      'cadence-proof:football:fallback','cadence-proof-v1','play-official-score-v1',
      '{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'synthetic fallback');
  exception when others then v_fallback_rejected:=true;
  end;
  if not v_fallback_rejected then raise exception 'unapproved fallback replaced the locked game';end if;
end;
$publication$;
rollback;
\echo 'Locked three-sport Daily cadence, weight, spacing, history and idempotency proofs passed.'
