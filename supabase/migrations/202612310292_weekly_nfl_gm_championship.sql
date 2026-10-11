-- NFL GM official featured week: October 13–19, 2026.
create table if not exists private.football_weekly_gm_entries (
 week_start date not null default date '2026-10-13',
 profile_id uuid not null references public.profiles(id) on delete cascade,
 scenario text not null check(scenario in ('elite','young')),
 seed text not null,
 state jsonb,
 revision integer not null default 0,
 result jsonb,
 score numeric(5,1) check(score between 0 and 100),
 started_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 completed_at timestamptz,
 primary key(week_start,profile_id,scenario),
 check(state is null or (jsonb_typeof(state)='object' and octet_length(state::text)<750000)),
 check(result is null or jsonb_typeof(result)='object'),
 check((completed_at is null and score is null and result is null)
    or (completed_at is not null and score is not null and result is not null))
);
alter table private.football_weekly_gm_entries enable row level security;
revoke all on private.football_weekly_gm_entries from public,anon,authenticated;
create index if not exists football_weekly_gm_result_idx on private.football_weekly_gm_entries(week_start,completed_at,score desc);

create or replace function public.get_weekly_football_gm()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
 v_profile uuid:=auth.uid();
 v_open timestamptz:=timestamp '2026-10-13 00:00' at time zone 'America/Chicago';
 v_close timestamptz:=timestamp '2026-10-20 00:00' at time zone 'America/Chicago';
begin
 if v_profile is null then raise exception 'sign in required'; end if;
 return jsonb_build_object(
  'week_start','2026-10-13','opens_at',v_open,'closes_at',v_close,
  'is_open',now()>=v_open and now()<v_close,
  'entries',coalesce((select jsonb_agg(jsonb_build_object(
    'scenario',e.scenario,'seed',e.seed,'revision',e.revision,'state',e.state,
    'completed_at',e.completed_at,'score',e.score) order by e.scenario)
    from private.football_weekly_gm_entries e
    where e.week_start=date '2026-10-13' and e.profile_id=v_profile),'[]'::jsonb),
  'standings',coalesce((
    select jsonb_agg(to_jsonb(s) order by s.total desc,s.completed desc,s.display_name)
    from (
     select p.id as profile_id,p.display_name,
       max(e.score) filter(where e.scenario='elite') as elite_score,
       max(e.score) filter(where e.scenario='young') as young_score,
       coalesce(sum(e.score),0)::numeric as total,
       count(e.completed_at)::integer as completed,
       (max(e.result::text) filter(where e.scenario='elite'))::jsonb as elite_result,
       (max(e.result::text) filter(where e.scenario='young'))::jsonb as young_result
     from private.football_weekly_gm_entries e join public.profiles p on p.id=e.profile_id
     where e.week_start=date '2026-10-13'
       and not private.football_weekly_auction_is_reserved_test_profile(p.id)
     group by p.id,p.display_name
    ) s
  ),'[]'::jsonb)
 );
end; $$;
revoke all on function public.get_weekly_football_gm() from public,anon;
grant execute on function public.get_weekly_football_gm() to authenticated;

create or replace function public.start_weekly_football_gm(p_scenario text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_profile uuid:=auth.uid(); v_entry private.football_weekly_gm_entries%rowtype;
begin
 if v_profile is null then raise exception 'sign in required'; end if;
 if p_scenario not in ('elite','young') or p_scenario is null then raise exception 'invalid GM challenge'; end if;
 if now()< (timestamp '2026-10-13 00:00' at time zone 'America/Chicago')
  or now()>=(timestamp '2026-10-20 00:00' at time zone 'America/Chicago') then
   raise exception 'Weekly GM entries are closed'; end if;
 insert into private.football_weekly_gm_entries(week_start,profile_id,scenario,seed)
 values(date '2026-10-13',v_profile,p_scenario,
   extensions.gen_random_uuid()::text||':weekly-gm-'||p_scenario||':gmdev1')
 on conflict(week_start,profile_id,scenario) do nothing;
 select * into v_entry from private.football_weekly_gm_entries
 where week_start=date '2026-10-13' and profile_id=v_profile and scenario=p_scenario;
 return jsonb_build_object('scenario',v_entry.scenario,'seed',v_entry.seed,
  'revision',v_entry.revision,'state',v_entry.state,'completed_at',v_entry.completed_at,'score',v_entry.score);
end; $$;
revoke all on function public.start_weekly_football_gm(text) from public,anon;
grant execute on function public.start_weekly_football_gm(text) to authenticated;

create or replace function public.save_weekly_football_gm(
 p_scenario text,p_expected_revision integer,p_state jsonb,p_result jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_profile uuid:=auth.uid();
 v_entry private.football_weekly_gm_entries%rowtype;
 v_phase text; v_spin integer; v_prev_spin integer;
 v_expected_qb text; v_score numeric;
begin
 if v_profile is null then raise exception 'sign in required'; end if;
 if p_scenario not in ('elite','young') or p_scenario is null then raise exception 'invalid GM challenge'; end if;
 select * into v_entry from private.football_weekly_gm_entries
 where week_start=date '2026-10-13' and profile_id=v_profile and scenario=p_scenario for update;
 if not found then raise exception 'official attempt has not been started'; end if;
 if v_entry.state is not distinct from p_state
   and (v_entry.result is not distinct from p_result or v_entry.completed_at is not null) then
  return jsonb_build_object('scenario',v_entry.scenario,'seed',v_entry.seed,
   'revision',v_entry.revision,'state',v_entry.state,'completed_at',v_entry.completed_at,'score',v_entry.score);
 end if;
 if now()< (timestamp '2026-10-13 00:00' at time zone 'America/Chicago')
    or now()>=(timestamp '2026-10-20 00:00' at time zone 'America/Chicago') then
  raise exception 'Weekly GM submissions are closed'; end if;
 if v_entry.completed_at is not null then raise exception 'official result is final'; end if;
 if p_expected_revision is distinct from v_entry.revision then
  raise exception 'GM progress changed in another session. Reload the official run.'; end if;
 if p_state is null or jsonb_typeof(p_state)<>'object' or octet_length(p_state::text)>=750000
    or p_state->>'seed' is distinct from v_entry.seed
    or p_state->>'version'<>'football-gm-v11-seeded-development' then
  raise exception 'invalid official GM snapshot'; end if;
 v_phase:=p_state->>'phase'; v_spin:=(p_state->>'spinIndex')::integer;
 if v_phase not in ('draft','year1','offseason','years23','final')
    or v_spin not between 1 and 7
    or jsonb_typeof(p_state->'roster')<>'array'
    or jsonb_typeof(p_state->'finalRoster')<>'array'
    or jsonb_array_length(p_state->'roster')>7
    or jsonb_array_length(p_state->'finalRoster')>7 then
  raise exception 'invalid GM progress'; end if;
 v_expected_qb:=case when p_scenario='elite' then 'BUF|QB|joshallen' else 'NYG|QB|jaxsondart' end;
 if v_entry.state is null then
   if v_phase<>'draft' or v_spin<>1
      or jsonb_array_length(p_state->'roster')<>1
      or p_state->'roster'->0->>'playerId'<>v_expected_qb then
    raise exception 'official run must start with assigned QB'; end if;
 else
   v_prev_spin:=(v_entry.state->>'spinIndex')::integer;
   if v_spin<v_prev_spin or v_spin>v_prev_spin+1
      or (v_entry.state->>'phase'='final' and v_phase<>'final') then
    raise exception 'official GM progress cannot be rewound'; end if;
 end if;
 if v_phase='final' then
   if v_spin<>7 or jsonb_array_length(p_state->'roster')<>7
      or jsonb_array_length(p_state->'finalRoster')<>7
      or jsonb_array_length(coalesce(p_state->'resolvedSeasons','[]'::jsonb))<>3
      or p_result is null or jsonb_typeof(p_result)<>'object'
      or jsonb_array_length(coalesce(p_result->'seasons','[]'::jsonb))<>3
      or jsonb_array_length(coalesce(p_result->'roster','[]'::jsonb))<>7 then
    raise exception 'incomplete franchise cannot be submitted'; end if;
   v_score:=round(((p_result->>'rosterManagementScore')::numeric*0.90
     +(p_result->>'resumeScore')::numeric*0.10),1);
   if v_score not between 0 and 100
      or abs(v_score-(p_result->>'score')::numeric)>0.001 then
    raise exception 'GM score does not match 90/10 formula'; end if;
 elsif p_result is not null then
   raise exception 'results allowed only for complete franchises';
 end if;
 update private.football_weekly_gm_entries
 set state=p_state,result=p_result,score=v_score,
   revision=revision+1,updated_at=now(),
   completed_at=case when v_phase='final' then now() else null end
 where week_start=date '2026-10-13' and profile_id=v_profile and scenario=p_scenario
 returning * into v_entry;
 return jsonb_build_object('scenario',v_entry.scenario,'seed',v_entry.seed,
   'revision',v_entry.revision,'state',v_entry.state,
   'completed_at',v_entry.completed_at,'score',v_entry.score);
end; $$;
revoke all on function public.save_weekly_football_gm(text,integer,jsonb,jsonb) from public,anon;
grant execute on function public.save_weekly_football_gm(text,integer,jsonb,jsonb) to authenticated;

-- Skip materializing Auction only during the Oct 13 GM Featured week.
CREATE OR REPLACE FUNCTION private.maintain_football_weekly_auction(p_at timestamp with time zone DEFAULT now())
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_week_start date;
  v_subject text;
  v_join_lock_at timestamptz;
  v_due record;
  v_week record;
  v_wild_lock timestamptz;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then return; end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  if v_week_start <> date '2026-10-13' then
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  -- Field membership freezes at the first board lock for every live subject.
  -- CFB Superteam's elastic reserve affects hidden future cards only.
  select min(board.lock_at) into v_join_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=v_week_start
    and board.day_index=1;

  if v_join_lock_at is null then
    raise exception 'Weekly Auction join boundary is incomplete';
  end if;

  if p_at>=v_join_lock_at then
    update private.football_weekly_auction_weeks week
    set field_locked_at=coalesce(week.field_locked_at,v_join_lock_at)
    where week.week_start=v_week_start;
  end if;

  end if;

  -- Resolve normal live auction days only. Owner labs resolve explicitly from
  -- their own controls and must never be advanced by unrelated production traffic.
  for v_due in
    select board.week_start,board.day_index
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_weeks due_week
      on due_week.week_start=board.week_start
    where not exists(
      select 1
      from private.football_weekly_auction_participants participant
      where participant.week_start=board.week_start
        and participant.source='owner_lab'
    )
      and not (
        due_week.subject_key='nfl-best-team-seasons-since-2000'
        and board.day_index=7
      )
    group by board.week_start,board.day_index
    having min(board.lock_at)<=p_at
       and (
         select count(*)
         from private.football_weekly_auction_awards award
         where award.week_start=board.week_start
           and award.day_index=board.day_index
       ) < private.football_weekly_auction_cards_for_day(
         board.week_start,board.day_index
       )
    order by board.week_start,board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(
      v_due.week_start,v_due.day_index,p_at
    );
  end loop;

  -- Sweep unresolved live NFL Team-Seasons finales across Tuesday rollover.
  -- Owner lab weeks are intentionally excluded so Day 7 remains pending until
  -- the owner explicitly presses RESOLVE DAY 7.
  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and week.subject_key='nfl-best-team-seasons-since-2000'
      and not exists(
        select 1
        from private.football_weekly_auction_participants participant
        where participant.week_start=week.week_start
          and participant.source='owner_lab'
      )
      and p_at>=((week.week_start+6)::timestamp at time zone 'America/Chicago')
    order by week.week_start
  loop
    perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week.week_start);

    select max(lock_at) into v_wild_lock
    from private.football_weekly_nfl_team_season_wildcard_board
    where week_start=v_week.week_start;

    if v_wild_lock is not null and p_at>=v_wild_lock then
      perform private.resolve_football_weekly_nfl_team_season_wildcard(
        v_week.week_start,p_at
      );
      perform private.finalize_football_weekly_nfl_team_season_week(
        v_week.week_start,p_at
      );
    end if;
  end loop;

  -- Finalize other live Weekly Auction subjects, while keeping all owner labs
  -- under their explicit playthrough controls.
  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and week.subject_key<>'nfl-best-team-seasons-since-2000'
      and not exists(
        select 1
        from private.football_weekly_auction_participants participant
        where participant.week_start=week.week_start
          and participant.source='owner_lab'
      )
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=week.week_start
      )=private.football_weekly_auction_cards_per_week(week.week_start)
  loop
    perform private.finalize_football_weekly_auction_week(v_week.week_start,p_at);
  end loop;
end;
$function$

