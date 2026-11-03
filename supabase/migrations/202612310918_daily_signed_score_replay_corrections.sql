-- Audited signed Daily score corrections. Original attempts are immutable.
alter table private.daily_challenge_score_corrections
 drop constraint daily_challenge_score_corrections_score_delta_check;
alter table private.daily_challenge_score_corrections
 add constraint daily_challenge_score_corrections_score_delta_check
 check (score_delta between -100 and 100 and score_delta <> 0);
alter table private.daily_challenge_score_corrections
 add column if not exists main_points_delta integer,
 add column if not exists fast_money_points_delta integer,
 add column if not exists board_score_delta integer,
 add column if not exists editorial_details jsonb not null default '{}'::jsonb;
create or replace view private.daily_challenge_history as
 SELECT daily.id AS daily_challenge_id,
    attempt.profile_id,
    daily.central_day,
    daily.schedule_version,
    daily.game_type,
    GREATEST(0, LEAST(100, attempt.native_score + COALESCE(correction.score_delta, 0))) AS native_score,
    GREATEST(0, LEAST(100, attempt.normalized_score + COALESCE(correction.score_delta, 0))) AS normalized_score,
    attempt.completed_at,
    attempt.content_version,
    attempt.scoring_version,
        CASE WHEN correction.score_delta IS NOT NULL THEN
 jsonb_set(attempt.public_result,'{score}'::text[],to_jsonb(greatest(0,least(100,attempt.native_score+correction.score_delta))))
 || CASE WHEN daily.game_type='sports_feud' THEN jsonb_build_object(
   'main_points',coalesce((attempt.public_result->>'main_points')::integer,0)+coalesce(correction.main_points_delta,0),
   'fast_money_points',coalesce((attempt.public_result->>'fast_money_points')::integer,0)+coalesce(correction.fast_money_points_delta,correction.score_delta))
 WHEN daily.game_type='average_fan' THEN jsonb_build_object(
   'board_score',coalesce((attempt.public_result->>'board_score')::integer,0)+coalesce(correction.board_score_delta,correction.score_delta))
 ELSE '{}'::jsonb END
 || jsonb_build_object('editorial_correction_points',correction.score_delta,'editorial_correction_details',correction.editorial_details)
 ELSE attempt.public_result END AS public_result,
    'generalized'::text AS source
   FROM private.daily_challenge_attempts attempt
     JOIN private.daily_challenges daily ON daily.id = attempt.daily_challenge_id
     LEFT JOIN private.daily_challenge_score_corrections correction ON correction.attempt_id = attempt.id
  WHERE attempt.attempt_kind = 'official_first'::text AND NOT (daily.schedule_version = 'nba-daily-launch-oct29-bar-trivia-v1'::text AND daily.central_day = '2026-10-29'::date)
UNION ALL
 SELECT NULL::uuid AS daily_challenge_id,
    legacy.profile_id,
    legacy.day AS central_day,
    'find-leader-v1'::text AS schedule_version,
    'find_leader'::text AS game_type,
    legacy.official_score::integer AS native_score,
    legacy.official_score * 10 AS normalized_score,
    legacy.completed_at,
    'legacy-find-leader-content-v1'::text AS content_version,
    'play-official-score-v1'::text AS scoring_version,
    jsonb_build_object('legacy_find_leader', true, 'best_score', legacy.best_score, 'attempts', legacy.attempts, 'updated_at', legacy.updated_at) AS public_result,
    'legacy_find_leader'::text AS source
   FROM find_leader_history legacy
  WHERE NOT (EXISTS ( SELECT 1
           FROM private.daily_challenge_attempts attempt
             JOIN private.daily_challenges daily ON daily.id = attempt.daily_challenge_id
          WHERE attempt.attempt_kind = 'official_first'::text AND NOT (daily.schedule_version = 'nba-daily-launch-oct29-bar-trivia-v1'::text AND daily.central_day = '2026-10-29'::date) AND attempt.profile_id = legacy.profile_id AND daily.central_day = legacy.day AND daily.game_type = 'find_leader'::text));
create or replace function public.get_official_daily_corrected_attempt(
 p_daily_challenge_id uuid,p_profile_id uuid
) returns jsonb
language plpgsql stable security definer set search_path=''
as $fn$
declare v_result jsonb;
begin
 if auth.role() is distinct from 'service_role' then
   raise exception 'service role required for daily correction lookup';
 end if;
 select jsonb_build_object('native_score',h.native_score,'normalized_score',h.normalized_score,'public_result',h.public_result)
 into v_result
 from private.daily_challenge_history h
 join private.daily_challenge_attempts a on a.daily_challenge_id=h.daily_challenge_id and a.profile_id=h.profile_id and a.attempt_kind='official_first'
 join private.daily_challenge_score_corrections c on c.attempt_id=a.id
 where h.daily_challenge_id=p_daily_challenge_id and h.profile_id=p_profile_id and h.source='generalized';
 return v_result;
end;
$fn$;
revoke all on function public.get_official_daily_corrected_attempt(uuid,uuid) from public,anon,authenticated;
grant execute on function public.get_official_daily_corrected_attempt(uuid,uuid) to service_role;
-- Nov 2 Football Average Fan: Tennessee is the Volunteers. One unsaved miss
-- remains at question 6, so the walk-away score is 68+2*6=80.
insert into private.daily_challenge_score_corrections(attempt_id,score_delta,board_score_delta,editorial_details,reason)
select a.id,5,5,
 '{"average_fan":[{"question_id":"average-fan:cfb:tradition:sailgating:short","answer":"Volunteers","correct":true}]}'::jsonb,
 'Nov 2 CFB Average Fan: Volunteers is Tennessee; verified saved Q8 answer, original 75, recalculated walk-away 80.'
from private.daily_challenge_attempts a
join private.daily_challenges d on d.id=a.daily_challenge_id
join private.daily_challenge_progress p on p.daily_challenge_id=d.id and p.profile_id=a.profile_id
where a.id='c5692c9a-65af-4d72-ba3a-a4ba4741a56f'::uuid
 and a.profile_id='58b30d66-f987-4efe-8a71-269c53b17cc8'::uuid
 and d.central_day=date '2026-11-02' and d.game_type='average_fan'
 and d.schedule_version='football-daily-v22-higher-lower-oct27'
 and a.attempt_kind='official_first' and a.normalized_score=75
 and exists(select 1 from jsonb_array_elements(p.public_state->'resolved') x
    where x#>>'{question,id}'='average-fan:cfb:tradition:sailgating:short'
      and x->>'player_answer'='Volunteers' and x->>'correct'='false' and x->>'saved'='false')
on conflict (attempt_id) do nothing;

-- Nov 1 NBA Feud complete replay: Birdman+2 displaces Jordan+2 (net zero),
-- Jalen Rose never won the NCAA title (-2), "Three" is a broadcast call (+1).
insert into private.daily_challenge_score_corrections
(attempt_id,score_delta,main_points_delta,fast_money_points_delta,editorial_details,reason)
select a.id,-1,-2,1,
 '{"feud_main":[{"board_id":"nba-feud-distinctive-looks","answer":"Birdman","accepted":true,"points":2,"matched":"Chris Andersen"},{"board_id":"nba-feud-distinctive-looks","answer":"Michael Jordan","excluded":true,"points":0},{"board_id":"nba-feud-ncaa-nba-winners","answer":"Jalen Rose","accepted":false,"points":0}],"feud_fast":[{"question_id":"nba-feud-nba-tv-broadcast","answer":"Three","points":1}]}'::jsonb,
 'Nov 1 NBA Feud: replay accepts Birdman and Three, rejects false Glen Rice match for Jalen Rose; main 31 and Fast 31 total 62.'
from private.daily_challenge_attempts a
join private.daily_challenges d on d.id=a.daily_challenge_id
join private.daily_challenge_progress p on p.daily_challenge_id=d.id and p.profile_id=a.profile_id
where a.id='7fc96c71-012f-471f-be5e-2b6ff1c2dc50'::uuid
 and a.profile_id='58b30d66-f987-4efe-8a71-269c53b17cc8'::uuid
 and d.central_day=date '2026-11-01' and d.game_type='sports_feud'
 and d.schedule_version='nba-daily-regular-v3-oct30-public'
 and a.attempt_kind='official_first' and a.normalized_score=63
 and exists(select 1 from jsonb_array_elements(p.submission_state#>'{engine_state,fastMoneyResults}') x
    where x->>'questionId'='nba-feud-nba-tv-broadcast' and x->>'submittedText'='Three' and (x->>'points')::integer=0)
 and exists(select 1 from jsonb_array_elements(p.submission_state#>'{engine_state,mainBoards}') b,
   jsonb_array_elements(b->'attempts') g where g->>'submittedText'='Birdman' and g->>'status'='rejected')
 and exists(select 1 from jsonb_array_elements(p.submission_state#>'{engine_state,mainBoards}') b,
   jsonb_array_elements(b->'attempts') g where g->>'submittedText'='Jalen Rose'
   and g->>'status'='accepted' and g->>'entityId'='nba-feud-ncaa-nba-winners:v23')
on conflict (attempt_id) do nothing;
