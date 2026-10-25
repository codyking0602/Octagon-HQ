-- SQL contract after migration 408: future-only three-sport v22 Higher/Lower.
do $test$
declare v_f text[]; v_u text[]; v_day date; v_cnt integer:=0;
begin
 select game_cycle into strict v_f from private.daily_challenge_schedule_versions where version='football-daily-v22-higher-lower-2x-oct25';
 select game_cycle into strict v_u from private.daily_challenge_schedule_versions where version='ufc-daily-v22-higher-lower-2x-oct25';
 if cardinality(v_f)<>56 or cardinality(v_u)<>30 then raise exception 'v22 cycle lengths drift';end if;
 if (select count(*) from unnest(v_f) x where x='higher_lower')<>4
  or (select count(*) from unnest(v_u) x where x='higher_lower')<>2 then raise exception 'v22 Higher/Lower weights drift';end if;
 for v_day in select d::date from generate_series(date '2026-10-25',date '2027-04-24',interval '1 day') d loop
  if private.daily_challenge_expected_game(private.daily_challenge_schedule_for_day(v_day,'football'),v_day)='higher_lower' then v_cnt:=v_cnt+1;end if;
 end loop;
 if v_cnt<>12 then raise exception 'actual Football Higher or Lower appearances drift: %',v_cnt;end if;
 if private.daily_challenge_expected_game('ufc-daily-v22-higher-lower-2x-oct25',date '2026-11-20')<>'higher_lower'
  or private.daily_challenge_expected_game('football-daily-v22-higher-lower-2x-oct25',date '2026-11-08')<>'higher_lower'
  then raise exception 'Higher/Lower official date identity drift';end if;
end
$test$;
