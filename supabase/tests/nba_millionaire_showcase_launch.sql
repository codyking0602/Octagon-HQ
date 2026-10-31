\set ON_ERROR_STOP on
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $test$
declare
 v_daily private.daily_challenges;
 v_setup private.daily_challenge_setups;
 v_question jsonb;
 v_run jsonb;
 v_choice text;
 v_expected_ids text[] := ARRAY[
  'nba-millionaire-q1-18','nba-millionaire-q2-10',
  'nba-millionaire-q3-02','nba-millionaire-q4-19',
  'nba-millionaire-q5-09','nba-millionaire-q6-02',
  'nba-millionaire-q7-12','nba-millionaire-q8-01'];
 v_expected_answers text[] := ARRAY['C','A','D','B','A','D','C','B'];
 v_index integer;
begin
 select * into strict v_daily from private.daily_challenges
 where central_day=date '2026-10-29'
   and schedule_version='nba-daily-launch-oct29-millionaire-v1';
 select * into strict v_setup from private.daily_challenge_setups
 where id=v_daily.setup_id;
 if v_daily.game_type <> 'millionaire' or v_setup.game_type <> 'millionaire'
    or v_setup.public_setup->>'league' <> 'nba'
    or v_setup.public_setup->>'host_number' <> '3'
    or v_setup.reveal_setup->>'host_number' <> '3'
    or v_setup.public_setup->>'time_bank_ms' <> '120000'
    or jsonb_array_length(v_setup.public_setup->'questions') <> 8
    or jsonb_array_length(v_setup.private_setup_evidence->'run') <> 8
    or v_setup.public_setup->'initial_state'->>'status' <> 'playing'
    or v_setup.public_setup->'initial_state'->>'score' <> '0'
    or v_setup.private_setup_evidence->>'proof' is distinct from
        v_setup.private_grading_evidence->>'proof' then
    raise exception 'NBA Millionaire 3 official setup contract invalid';
 end if;
 for v_index in 1..8 loop
   v_question := v_setup.public_setup->'questions'->(v_index-1);
   v_run := v_setup.private_setup_evidence->'run'->(v_index-1);
   v_choice := v_expected_answers[v_index];
   if v_question->>'id' <> v_expected_ids[v_index]
     or v_run->>'id' <> v_expected_ids[v_index]
     or v_run->>'correctChoiceId' <> v_choice
     or v_question ? 'correctChoiceId'
     or v_question ? 'explanation'
     or v_question ? 'statSheet'
     or jsonb_array_length(v_question->'choices') <> 4
     or (select count(distinct x.value->>'text')
         from jsonb_array_elements(v_question->'choices') x) <> 4
     or jsonb_array_length(v_run->'fiftyFifty'->'removalChoiceIds') <> 2
     or jsonb_array_length(v_run->'fiftyFifty'->'survivorChoiceIds') <> 2
     or not (v_run->'fiftyFifty'->'survivorChoiceIds' ? v_choice)
     or (v_index=8 and (v_run->>'statSheet') is not null)
     or (v_index<8 and length(coalesce(v_run->>'statSheet',''))<20)
   then raise exception 'NBA Millionaire source, lifeline, answer or disclosure failure at Q%',v_index;
   end if;
 end loop;
 if private.daily_challenge_schedule_for_day(date '2026-10-29','nba')
    <> 'nba-daily-launch-oct29-millionaire-v1'
    or private.daily_challenge_schedule_for_day(date '2026-10-31','nba')
    <> 'nba-daily-launch-oct29-millionaire-v1'
    or private.daily_challenge_schedule_for_day(date '2026-11-01','nba')
    <> 'nba-daily-regular-v3-oct30-public'
    or private.daily_challenge_schedule_for_day(date '2026-10-30','football')
    <> 'football-daily-v22-higher-lower-oct27'
 then raise exception 'NBA Millionaire showcase changed another daily calendar'; end if;
 if exists(select 1 from private.daily_challenge_history
   where central_day=date '2026-10-29'
     and schedule_version='nba-daily-launch-oct29-bar-trivia-v1')
 then raise exception 'Retired NBA public launch scores remain visible';end if;
 if exists(select 1 from private.daily_challenge_attempts
   where daily_challenge_id=v_daily.id)
 then raise exception 'New NBA Millionaire opening board must start with zero scores';end if;
end;
$test$;
rollback;
\echo 'NBA Millionaire 3 source, grading, privacy, host and score reset verified.'
