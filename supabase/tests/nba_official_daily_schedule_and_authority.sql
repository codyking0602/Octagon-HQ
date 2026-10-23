\set ON_ERROR_STOP on
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $test$
declare
  v_expected text[] := array['average_fan','sports_feud','millionaire','who_am_i','find_leader','wavelength','bar_trivia','hit_the_number','higher_lower','average_fan','sports_feud','millionaire','who_am_i','find_leader','wavelength','bar_trivia','average_fan','sports_feud','millionaire','hit_the_number','higher_lower','who_am_i','find_leader','wavelength','bar_trivia','average_fan','sports_feud','millionaire'];
  v_schedule private.daily_challenge_schedule_versions;
  v_grade record;
  v_submission jsonb;
  v_evidence jsonb;
  v_request jsonb;
begin
  select * into strict v_schedule from private.daily_challenge_schedule_versions where version='nba-daily-regular-v1';
  if v_schedule.sport <> 'nba' or v_schedule.game_cycle <> v_expected then raise exception 'NBA cycle invalid'; end if;
  if private.daily_challenge_expected_game(v_schedule.version,date '2026-11-01') <> 'average_fan'
    or private.daily_challenge_expected_game(v_schedule.version,date '2026-11-02') <> 'average_fan'
    or private.daily_challenge_expected_game(v_schedule.version,date '2026-11-03') <> 'sports_feud'
    or private.daily_challenge_expected_game(v_schedule.version,date '2026-11-17') <> 'higher_lower'
    or private.daily_challenge_schedule_for_day(date '2026-11-01','nba') <> v_schedule.version then
    raise exception 'NBA every-other-day schedule mapping invalid';
  end if;
  v_request := public.get_daily_challenge_materialization_request('nba','2026-11-02T19:00:00Z'::timestamptz);
  if v_request->>'central_day' <> '2026-11-01' or v_request->>'expected_game' <> 'average_fan' then
    raise exception 'NBA shared 48-hour Daily identity invalid';
  end if;
  v_submission := jsonb_build_object('answers',(
    select jsonb_agg(jsonb_build_object('question_id','q'||i,'choice',case when i<7 then 'higher' else 'lower' end))
    from generate_series(0,9) as i));
  v_evidence := jsonb_build_object('question_ids',(
    select jsonb_agg('q'||i) from generate_series(0,9) as i),
    'correct_choices',(
    select jsonb_agg('higher') from generate_series(0,9) as i));
  select * into v_grade from private.grade_daily_challenge('higher_lower','play-official-score-v1',v_submission,v_evidence);
  if v_grade.native_score <> 7 or v_grade.normalized_score <> 70 then raise exception 'NBA Higher/Lower scorer incorrect'; end if;
  if private.daily_challenge_expected_game('football-daily-v18-average-fan-oct1',date '2026-10-01') <> 'average_fan'
     or private.daily_challenge_expected_game('play-rotation-v18-average-fan-oct1',date '2026-10-01') <> 'average_fan' then
    raise exception 'Existing Football/UFC calendar changed';
  end if;
end;
$test$;
rollback;
