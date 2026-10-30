-- Oct 30 Football Feud: independently auditable, non-destructive scoring remedy.
-- Published boards and original attempts remain immutable. All public ranking
-- projections use the correction only after verifying the exact submitted text.
create table if not exists private.daily_challenge_score_corrections (
  attempt_id uuid primary key references private.daily_challenge_attempts(id),
  score_delta integer not null check (score_delta between 1 and 100),
  reason text not null check (length(reason) between 12 and 500),
  created_at timestamptz not null default now()
);
revoke all on private.daily_challenge_score_corrections from public, anon, authenticated;
drop trigger if exists daily_challenge_score_corrections_immutable on private.daily_challenge_score_corrections;
create trigger daily_challenge_score_corrections_immutable
  before update or delete on private.daily_challenge_score_corrections
  for each row execute function private.reject_daily_challenge_mutation();

-- Treat only the two proven misrecognized strings from the original
-- Oct-30 publication. All other Feud attempts and sports are unaffected.
with eligible as (
  select
    a.id as attempt_id,
    a.daily_challenge_id,
    a.profile_id,
    case when exists (
      select 1 from jsonb_array_elements(
        coalesce(p.submission_state #> '{engine_state,fastMoneyResults}','[]'::jsonb)
      ) r where r->>'questionId'='cfb-feud-r2-fast-alumni-on-saturdays'
        and lower(trim(r->>'submittedText'))='donate'
        and coalesce((r->>'points')::integer,0)=0
    ) then 4 else 0 end as donate_delta,
    case when exists (
      select 1 from jsonb_array_elements(
        coalesce(p.submission_state #> '{engine_state,fastMoneyResults}','[]'::jsonb)
      ) r where r->>'questionId'='cfb-feud-r2-fast-college-football-polls'
        and lower(trim(r->>'submittedText'))='wrong'
        and coalesce((r->>'points')::integer,0)=0
    ) then 1 else 0 end as ranking_delta
  from private.daily_challenge_attempts a
  join private.daily_challenges d on d.id=a.daily_challenge_id
  join private.daily_challenge_progress p
    on p.daily_challenge_id=a.daily_challenge_id and p.profile_id=a.profile_id
  where d.central_day=date '2026-10-30'
    and d.game_type='sports_feud'
    and d.schedule_version='football-daily-v22-higher-lower-oct27'
    and a.attempt_kind='official_first'
    and a.scoring_version='family-feud-score-v2'
    and p.public_state->>'phase'='complete'
)
insert into private.daily_challenge_score_corrections(attempt_id,score_delta,reason)
select attempt_id,donate_delta+ranking_delta,
  '2026-10-30 CFB Feud: credit exact Donate as Donate to athletics (+4), and Wrong as a ranking disagreement (+1); verified against saved zero-point answers.'
from eligible
where donate_delta+ranking_delta>0
on conflict (attempt_id) do nothing;

-- Correct the detailed completed result projection, without modifying
-- source answer actions, final submission evidence, or immutable attempts.
with corrections as (
 select a.daily_challenge_id,a.profile_id,c.score_delta,
        a.native_score as original_score,
        (
          select coalesce(jsonb_agg(
            case
              when v->>'question_id'='cfb-feud-r2-fast-alumni-on-saturdays'
                and lower(trim(v->>'submitted_answer'))='donate'
                and coalesce((v->>'points')::integer,0)=0
              then v || jsonb_build_object('points',4,'counted',true,'board_rank',5)
              when v->>'question_id'='cfb-feud-r2-fast-college-football-polls'
                and lower(trim(v->>'submitted_answer'))='wrong'
                and coalesce((v->>'points')::integer,0)=0
              then v || jsonb_build_object('points',1,'counted',true)
              else v
            end order by ord),'[]'::jsonb)
          from jsonb_array_elements(coalesce(p.public_state #> '{fast_money,results}','[]'::jsonb))
            with ordinality x(v,ord)
        ) as revised_results
 from private.daily_challenge_score_corrections c
 join private.daily_challenge_attempts a on a.id=c.attempt_id
 join private.daily_challenges d on d.id=a.daily_challenge_id
 join private.daily_challenge_progress p on p.daily_challenge_id=a.daily_challenge_id
   and p.profile_id=a.profile_id
 where d.central_day=date '2026-10-30' and d.game_type='sports_feud'
)
update private.daily_challenge_progress p
set public_state=jsonb_set(
       jsonb_set(
         jsonb_set(
           jsonb_set(p.public_state,'{hq_score}',
             to_jsonb(least(100,corrections.original_score+corrections.score_delta))),
           '{raw_points}',to_jsonb(least(100,corrections.original_score+corrections.score_delta))),
         '{fast_money,points}',
           to_jsonb(coalesce((p.public_state #>> '{fast_money,points}')::integer,0)+corrections.score_delta)),
       '{fast_money,results}',corrections.revised_results),
    updated_at=now()
from corrections
where p.daily_challenge_id=corrections.daily_challenge_id
  and p.profile_id=corrections.profile_id
  and p.public_state->>'phase'='complete'
  and (p.public_state->>'hq_score')::integer=corrections.original_score;

-- The history VIEW is the existing common source for daily leaderboards,
-- sport standings, weekly recaps, and personal/member history.
create or replace view private.daily_challenge_history as
 select
   daily.id as daily_challenge_id,
   attempt.profile_id,
   daily.central_day,
   daily.schedule_version,
   daily.game_type,
   least(100,attempt.native_score+coalesce(correction.score_delta,0))::integer as native_score,
   least(100,attempt.normalized_score+coalesce(correction.score_delta,0))::integer as normalized_score,
   attempt.completed_at,
   attempt.content_version,
   attempt.scoring_version,
   case when correction.score_delta is not null
     then jsonb_set(
         jsonb_set(attempt.public_result,'{score}',
           to_jsonb(least(100,attempt.native_score+correction.score_delta))),
         '{fast_money_points}',
         to_jsonb(coalesce((attempt.public_result->>'fast_money_points')::integer,0)+correction.score_delta))
       || jsonb_build_object('editorial_correction_points',correction.score_delta)
     else attempt.public_result end as public_result,
   'generalized'::text as source
 from private.daily_challenge_attempts attempt
 join private.daily_challenges daily on daily.id=attempt.daily_challenge_id
 left join private.daily_challenge_score_corrections correction
   on correction.attempt_id=attempt.id
 where attempt.attempt_kind='official_first'
 union all
 select
   null::uuid as daily_challenge_id,
   legacy.profile_id,
   legacy.day as central_day,
   'find-leader-v1'::text as schedule_version,
   'find_leader'::text as game_type,
   legacy.official_score::integer as native_score,
   (legacy.official_score*10)::integer as normalized_score,
   legacy.completed_at,
   'legacy-find-leader-content-v1'::text as content_version,
   'play-official-score-v1'::text as scoring_version,
   jsonb_build_object('legacy_find_leader',true,'best_score',legacy.best_score,
     'attempts',legacy.attempts,'updated_at',legacy.updated_at) as public_result,
   'legacy_find_leader'::text as source
 from find_leader_history legacy
 where not exists (
   select 1 from private.daily_challenge_attempts attempt
   join private.daily_challenges daily on daily.id=attempt.daily_challenge_id
   where attempt.attempt_kind='official_first' and attempt.profile_id=legacy.profile_id
     and daily.central_day=legacy.day and daily.game_type='find_leader'
 );

-- Server-only lookup used by the public Daily runtime after authentication.
-- No anonymous or member-level access to another player's adjustment.
create or replace function public.get_official_daily_score_correction(
 p_daily_challenge_id uuid,p_profile_id uuid
) returns integer
language plpgsql stable security definer set search_path=''
as $function$
declare v_delta integer;
begin
 if auth.role() is distinct from 'service_role' then
   raise exception 'service role required for daily score correction lookup';
 end if;
 select c.score_delta into v_delta
 from private.daily_challenge_score_corrections c
 join private.daily_challenge_attempts a on a.id=c.attempt_id
 where a.daily_challenge_id=p_daily_challenge_id and a.profile_id=p_profile_id
   and a.attempt_kind='official_first';
 return coalesce(v_delta,0);
end;
$function$;
revoke all on function public.get_official_daily_score_correction(uuid,uuid) from public,anon,authenticated;
grant execute on function public.get_official_daily_score_correction(uuid,uuid) to service_role;
