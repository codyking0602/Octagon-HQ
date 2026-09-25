-- Correct only deterministic Sep. 23 UFC Sports Feud Fast Money matcher misses.
-- These three submitted answers already mapped to candidates on the locked board:
-- LIB: "Habib" -> Khabib Nurmagomedov (8)
-- TEST2: "Khabib" -> Khabib Nurmagomedov (8)
-- TEST2: "Paddy" -> Paddy Pimblett (4)
--
-- Main-board misses are intentionally not rewritten here because accepting a prior
-- main-board guess would have changed subsequent gameplay opportunities.

create temporary table sports_feud_sep23_fast_money_corrections (
  normalized_name text not null,
  question_id text not null,
  submitted_answer text not null,
  points integer not null,
  entity_id text not null,
  accepted_as text not null,
  board_rank integer not null,
  match_kind text not null,
  primary key (normalized_name, question_id)
) on commit drop;

insert into sports_feud_sep23_fast_money_corrections
  (normalized_name, question_id, submitted_answer, points, entity_id, accepted_as, board_rank, match_kind)
values
  ('LIB', 'ufc-fast5-08-5', 'Habib', 8, 'ufc-fast5-08-5:a1', 'Khabib Nurmagomedov', 1, 'typo'),
  ('TEST2', 'ufc-fast5-08-5', 'Khabib', 8, 'ufc-fast5-08-5:a1', 'Khabib Nurmagomedov', 1, 'alias'),
  ('TEST2', 'ufc-fast2-07-4', 'Paddy', 4, 'ufc-fast2-07-4:a5', 'Paddy Pimblett', 5, 'first-name');

do $$
declare
  v_daily uuid;
  v_target_profiles integer;
  v_missing integer;
  v_bad integer;
begin
  select d.id
  into v_daily
  from private.daily_challenges d
  join private.daily_challenge_schedule_versions s on s.version=d.schedule_version
  where d.central_day=date '2026-09-23'
    and s.sport='ufc'
    and d.game_type='sports_feud'
  limit 1;

  if v_daily is null then
    return;
  end if;

  select count(distinct p.id)
  into v_target_profiles
  from sports_feud_sep23_fast_money_corrections c
  join public.profiles p on p.normalized_name=c.normalized_name
  join private.daily_challenge_attempts a
    on a.daily_challenge_id=v_daily
   and a.profile_id=p.id
   and a.attempt_kind='official_first';

  -- Fresh/local databases do not carry these production player rows.
  if v_target_profiles = 0 then
    return;
  end if;

  select count(*)
  into v_missing
  from sports_feud_sep23_fast_money_corrections c
  join public.profiles p on p.normalized_name=c.normalized_name
  join private.daily_challenge_attempts a
    on a.daily_challenge_id=v_daily
   and a.profile_id=p.id
   and a.attempt_kind='official_first'
  left join private.daily_challenge_progress prog
    on prog.daily_challenge_id=v_daily and prog.profile_id=p.id
  where prog.profile_id is null
     or not exists (
       select 1
       from jsonb_array_elements(coalesce(prog.public_state->'fast_money'->'results','[]'::jsonb)) r
       where r->>'question_id'=c.question_id
         and r->>'submitted_answer'=c.submitted_answer
         and coalesce((r->>'points')::integer,0) in (0,c.points)
     );

  if v_missing <> 0 then
    raise exception 'Sep. 23 deterministic Sports Feud correction evidence missing for % rows', v_missing;
  end if;

  select count(*)
  into v_bad
  from (
    select
      p.normalized_name,
      a.normalized_score
    from sports_feud_sep23_fast_money_corrections c
    join public.profiles p on p.normalized_name=c.normalized_name
    join private.daily_challenge_attempts a
      on a.daily_challenge_id=v_daily
     and a.profile_id=p.id
     and a.attempt_kind='official_first'
    group by p.normalized_name,a.normalized_score
  ) x
  where (x.normalized_name='LIB' and x.normalized_score not in (18,26))
     or (x.normalized_name='TEST2' and x.normalized_score not in (10,22));

  if v_bad <> 0 then
    raise exception 'Sep. 23 deterministic Sports Feud target scores changed before correction';
  end if;

  with profiles as (
    select
      p.id as profile_id,
      p.normalized_name,
      sum(c.points)::integer as add_points
    from sports_feud_sep23_fast_money_corrections c
    join public.profiles p on p.normalized_name=c.normalized_name
    join private.daily_challenge_attempts a
      on a.daily_challenge_id=v_daily
     and a.profile_id=p.id
     and a.attempt_kind='official_first'
    group by p.id,p.normalized_name
  ),
  transformed as (
    select
      prog.profile_id,
      prog.public_state,
      prog.submission_state,
      profiles.normalized_name,
      profiles.add_points,
      (
        select jsonb_agg(
          case
            when c.question_id is not null then
              r.value || jsonb_build_object(
                'points', c.points,
                'counted', true,
                'board_rank', c.board_rank,
                'accepted_as', c.accepted_as
              )
            else r.value
          end
          order by r.ordinality
        )
        from jsonb_array_elements(coalesce(prog.public_state->'fast_money'->'results','[]'::jsonb))
          with ordinality as r(value,ordinality)
        left join sports_feud_sep23_fast_money_corrections c
          on c.normalized_name=profiles.normalized_name
         and c.question_id=r.value->>'question_id'
         and c.submitted_answer=r.value->>'submitted_answer'
      ) as public_results,
      (
        select jsonb_agg(
          case
            when c.question_id is not null then
              r.value || jsonb_build_object(
                'points', c.points,
                'entityId', c.entity_id,
                'matchKind', c.match_kind
              )
            else r.value
          end
          order by r.ordinality
        )
        from jsonb_array_elements(coalesce(prog.submission_state->'engine_state'->'fastMoneyResults','[]'::jsonb))
          with ordinality as r(value,ordinality)
        left join sports_feud_sep23_fast_money_corrections c
          on c.normalized_name=profiles.normalized_name
         and c.question_id=r.value->>'questionId'
         and c.submitted_answer=r.value->>'submittedText'
      ) as engine_results
    from profiles
    join private.daily_challenge_progress prog
      on prog.daily_challenge_id=v_daily and prog.profile_id=profiles.profile_id
  )
  update private.daily_challenge_progress prog
  set public_state =
        transformed.public_state
        || jsonb_build_object(
          'hq_score', (transformed.public_state->>'hq_score')::integer + transformed.add_points,
          'raw_points', (transformed.public_state->>'raw_points')::integer + transformed.add_points,
          'score_correction', '2026-09-23-fast-money-natural-input-repair',
          'fast_money',
            (transformed.public_state->'fast_money')
            || jsonb_build_object(
              'points', (transformed.public_state->'fast_money'->>'points')::integer + transformed.add_points,
              'results', transformed.public_results
            )
        ),
      submission_state =
        jsonb_set(
          jsonb_set(
            transformed.submission_state,
            '{engine_state,fastMoneyResults}',
            coalesce(transformed.engine_results,'[]'::jsonb),
            false
          ),
          '{final_submission}',
          (transformed.submission_state->'final_submission')
          || jsonb_build_object(
            'native_score', (transformed.submission_state->'final_submission'->>'native_score')::integer + transformed.add_points,
            'normalized_score', (transformed.submission_state->'final_submission'->>'normalized_score')::integer + transformed.add_points,
            'fast_money_points', (transformed.submission_state->'final_submission'->>'fast_money_points')::integer + transformed.add_points,
            'score_correction', '2026-09-23-fast-money-natural-input-repair'
          ),
          false
        )
  from transformed
  where prog.daily_challenge_id=v_daily
    and prog.profile_id=transformed.profile_id
    and (prog.public_state->>'score_correction') is distinct from '2026-09-23-fast-money-natural-input-repair';

  execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
  begin
    with profiles as (
      select
        p.id as profile_id,
        p.normalized_name,
        sum(c.points)::integer as add_points
      from sports_feud_sep23_fast_money_corrections c
      join public.profiles p on p.normalized_name=c.normalized_name
      join private.daily_challenge_attempts a
        on a.daily_challenge_id=v_daily
       and a.profile_id=p.id
       and a.attempt_kind='official_first'
      group by p.id,p.normalized_name
    )
    update private.daily_challenge_attempts a
    set native_score=a.native_score+profiles.add_points,
        normalized_score=a.normalized_score+profiles.add_points,
        public_result=a.public_result || jsonb_build_object(
          'score', (a.public_result->>'score')::integer + profiles.add_points,
          'fast_money_points', (a.public_result->>'fast_money_points')::integer + profiles.add_points,
          'score_correction', '2026-09-23-fast-money-natural-input-repair'
        ),
        grading_evidence_snapshot=a.grading_evidence_snapshot || jsonb_build_object(
          'score_correction',
          jsonb_build_object(
            'reason','deterministic Fast Money natural inputs matched candidates already present on the locked Sep. 23 board',
            'added_points',profiles.add_points,
            'repair','2026-09-23-fast-money-natural-input-repair'
          )
        )
    from profiles
    where a.daily_challenge_id=v_daily
      and a.profile_id=profiles.profile_id
      and a.attempt_kind='official_first'
      and a.normalized_score = case profiles.normalized_name when 'LIB' then 18 when 'TEST2' then 10 end;
  exception when others then
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
end
$$;
