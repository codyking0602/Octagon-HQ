-- Owner-only full-week playthrough for Best NFL Team-Seasons Since 2000.
-- Uses shadow Tuesday weeks and the same production normal-bid, resolver,
-- Wildcard/Reaping, autofill, and final-scoring functions. Competition state is
-- isolated from live weeks and Reaping bankroll adjustments are removed after
-- the simulated finale is captured.

create table if not exists private.football_weekly_nfl_team_season_lab_runs (
  owner_profile_id uuid primary key references public.profiles(id) on delete cascade,
  run_number integer not null check (run_number between 1 and 2000),
  lab_week_start date not null unique,
  current_day integer not null check (current_day between 1 and 8),
  final_payloads jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
revoke all on private.football_weekly_nfl_team_season_lab_runs from public,anon,authenticated;

create table if not exists private.football_weekly_nfl_team_season_lab_seats (
  owner_profile_id uuid not null
    references private.football_weekly_nfl_team_season_lab_runs(owner_profile_id)
    on delete cascade,
  seat_index integer not null check (seat_index between 1 and 5),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  primary key(owner_profile_id,seat_index),
  unique(owner_profile_id,profile_id)
);
revoke all on private.football_weekly_nfl_team_season_lab_seats from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_lab_owner()
returns uuid
language sql
stable security definer
set search_path=''
as $$
  select private.football_weekly_superteam_lab_owner();
$$;
revoke all on function private.football_weekly_nfl_team_season_lab_owner()
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_lab_week_start(
  p_run_number integer
)
returns date
language sql
immutable
set search_path=''
as $$
  select date '1900-01-02' + ((greatest(p_run_number,1)-1)*7);
$$;
revoke all on function private.football_weekly_nfl_team_season_lab_week_start(integer)
  from public,anon,authenticated;

create or replace function private.reset_football_weekly_nfl_team_season_lab(
  p_owner uuid
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_old_week date;
  v_run_number integer;
  v_week_start date;
  v_seat integer:=1;
  v_candidate record;
begin
  select lab_week_start,run_number
  into v_old_week,v_run_number
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=p_owner
  for update;

  if not found then
    v_run_number:=1;
    v_week_start:=private.football_weekly_nfl_team_season_lab_week_start(v_run_number);
    insert into private.football_weekly_nfl_team_season_lab_runs(
      owner_profile_id,run_number,lab_week_start,current_day,final_payloads
    ) values (
      p_owner,v_run_number,v_week_start,1,null
    );
  else
    if v_old_week is not null then
      delete from private.football_weekly_auction_bankroll_adjustments
      where source_week_start=v_old_week;
      delete from private.football_weekly_auction_weeks
      where week_start=v_old_week;
    end if;

    v_run_number:=case when v_run_number>=2000 then 1 else v_run_number+1 end;
    v_week_start:=private.football_weekly_nfl_team_season_lab_week_start(v_run_number);

    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_week_start;
    delete from private.football_weekly_auction_weeks
    where week_start=v_week_start;

    update private.football_weekly_nfl_team_season_lab_runs
    set run_number=v_run_number,
        lab_week_start=v_week_start,
        current_day=1,
        final_payloads=null,
        updated_at=now()
    where owner_profile_id=p_owner;

    delete from private.football_weekly_nfl_team_season_lab_seats
    where owner_profile_id=p_owner;
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(v_week_start,'nfl-best-team-seasons-since-2000');

  perform private.materialize_football_weekly_nfl_team_season_week(v_week_start);

  insert into private.football_weekly_nfl_team_season_lab_seats(
    owner_profile_id,seat_index,profile_id
  ) values (p_owner,1,p_owner);

  for v_candidate in
    with recent as (
      select
        participant.profile_id,
        max(participant.week_start) as last_week
      from private.football_weekly_auction_participants participant
      join public.profiles profile on profile.id=participant.profile_id
      where participant.week_start>=date '2026-09-15'
        and participant.profile_id<>p_owner
        and profile.normalized_name not like 'TEST%'
      group by participant.profile_id
    )
    select recent.profile_id
    from recent
    join public.profiles profile on profile.id=recent.profile_id
    order by recent.last_week desc,lower(profile.display_name),recent.profile_id
    limit 4
  loop
    v_seat:=v_seat+1;
    insert into private.football_weekly_nfl_team_season_lab_seats(
      owner_profile_id,seat_index,profile_id
    ) values (p_owner,v_seat,v_candidate.profile_id);
  end loop;

  if v_seat<5 then
    for v_candidate in
      select profile.id as profile_id
      from public.profiles profile
      where profile.id<>p_owner
        and profile.normalized_name not like 'TEST%'
        and not exists(
          select 1
          from private.football_weekly_nfl_team_season_lab_seats seat
          where seat.owner_profile_id=p_owner
            and seat.profile_id=profile.id
        )
      order by profile.created_at,profile.id
      limit (5-v_seat)
    loop
      v_seat:=v_seat+1;
      insert into private.football_weekly_nfl_team_season_lab_seats(
        owner_profile_id,seat_index,profile_id
      ) values (p_owner,v_seat,v_candidate.profile_id);
    end loop;
  end if;

  if v_seat<>5 then
    raise exception 'NFL team-season Playthrough Lab needs five available profiles';
  end if;

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  select
    v_week_start,
    seat.profile_id,
    ((v_week_start::timestamp at time zone 'America/Chicago')-interval '1 minute'),
    'owner_lab'
  from private.football_weekly_nfl_team_season_lab_seats seat
  where seat.owner_profile_id=p_owner;

  if (
    select count(*)
    from private.football_weekly_auction_board board
    where board.week_start=v_week_start and board.day_index=1
  )<>4 then
    raise exception 'NFL team-season Playthrough Lab opening board must contain four cards';
  end if;
end;
$$;
revoke all on function private.reset_football_weekly_nfl_team_season_lab(uuid)
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_lab_state(
  p_owner uuid,p_seat_index integer
)
returns jsonb
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_profile uuid;
  v_at timestamptz;
  v_state jsonb;
  v_final jsonb;
  v_seats jsonb;
  v_submitted_count integer;
begin
  if p_seat_index not between 1 and 5 then
    raise exception 'Lab seat must be between 1 and 5';
  end if;

  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=p_owner;

  if v_run.owner_profile_id is null then
    raise exception 'NFL team-season Playthrough Lab is not initialized';
  end if;

  select seat.profile_id into v_profile
  from private.football_weekly_nfl_team_season_lab_seats seat
  where seat.owner_profile_id=p_owner and seat.seat_index=p_seat_index;

  if v_profile is null then
    raise exception 'NFL team-season Playthrough Lab seat is unavailable';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'seat_index',seat.seat_index,
    'profile_id',seat.profile_id,
    'display_name',profile.display_name,
    'submitted_today',case
      when v_run.current_day between 1 and 6 then exists(
        select 1
        from private.football_weekly_auction_daily_entries entry
        where entry.week_start=v_run.lab_week_start
          and entry.day_index=v_run.current_day
          and entry.profile_id=seat.profile_id
      )
      when v_run.current_day=7 then exists(
        select 1
        from private.football_weekly_nfl_team_season_wildcard_submissions submission
        where submission.week_start=v_run.lab_week_start
          and submission.profile_id=seat.profile_id
      )
      else true
    end,
    'owned_count',(
      select count(*)::integer
      from private.football_weekly_auction_awards award
      where award.week_start=v_run.lab_week_start
        and award.profile_id=seat.profile_id
        and award.day_index between 1 and 6
    ),
    'bankroll',
      private.football_weekly_auction_starting_bankroll(
        v_run.lab_week_start,seat.profile_id,50
      )-coalesce((
        select sum(award.winning_bid)::integer
        from private.football_weekly_auction_awards award
        where award.week_start=v_run.lab_week_start
          and award.profile_id=seat.profile_id
          and award.day_index between 1 and 6
      ),0)
  ) order by seat.seat_index),'[]'::jsonb)
  into v_seats
  from private.football_weekly_nfl_team_season_lab_seats seat
  join public.profiles profile on profile.id=seat.profile_id
  where seat.owner_profile_id=p_owner;

  if v_run.current_day between 1 and 7 then
    v_at:=(
      (v_run.lab_week_start+(v_run.current_day-1))::date+time '12:00'
    ) at time zone 'America/Chicago';

    if v_run.current_day=7 then
      perform private.materialize_football_weekly_nfl_team_season_wildcard(
        v_run.lab_week_start
      );
    end if;

    v_state:=private.get_football_weekly_nfl_team_season_state(
      v_run.lab_week_start,v_profile,v_at
    );

    if v_run.current_day between 1 and 6 then
      select count(*)::integer into v_submitted_count
      from private.football_weekly_auction_daily_entries entry
      where entry.week_start=v_run.lab_week_start
        and entry.day_index=v_run.current_day;
    else
      select count(*)::integer into v_submitted_count
      from private.football_weekly_nfl_team_season_wildcard_submissions submission
      where submission.week_start=v_run.lab_week_start;
    end if;

    v_final:=null;
  else
    v_submitted_count:=5;
    v_state:=null;
    v_final:=v_run.final_payloads->p_seat_index::text;
  end if;

  return jsonb_build_object(
    'available',true,
    'subject_key','nfl-best-team-seasons-since-2000',
    'run_number',v_run.run_number,
    'lab_week_start',v_run.lab_week_start,
    'day_index',v_run.current_day,
    'completed',v_run.current_day=8,
    'submitted_count',v_submitted_count,
    'seat_index',p_seat_index,
    'seats',v_seats,
    'state',v_state,
    'final',v_final
  );
end;
$$;
revoke all on function private.football_weekly_nfl_team_season_lab_state(uuid,integer)
  from public,anon,authenticated;

create or replace function public.get_my_football_weekly_nfl_team_season_lab(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare v_owner uuid;
begin
  v_owner:=private.football_weekly_nfl_team_season_lab_owner();

  if not exists(
    select 1
    from private.football_weekly_nfl_team_season_lab_runs
    where owner_profile_id=v_owner
  ) then
    perform private.reset_football_weekly_nfl_team_season_lab(v_owner);
  end if;

  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.get_my_football_weekly_nfl_team_season_lab(integer)
  from public,anon;
grant execute on function public.get_my_football_weekly_nfl_team_season_lab(integer)
  to authenticated;

create or replace function public.reset_my_football_weekly_nfl_team_season_lab()
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare v_owner uuid;
begin
  v_owner:=private.football_weekly_nfl_team_season_lab_owner();
  perform private.reset_football_weekly_nfl_team_season_lab(v_owner);
  return private.football_weekly_nfl_team_season_lab_state(v_owner,1);
end;
$$;
revoke all on function public.reset_my_football_weekly_nfl_team_season_lab()
  from public,anon;
grant execute on function public.reset_my_football_weekly_nfl_team_season_lab()
  to authenticated;

create or replace function public.submit_my_football_weekly_nfl_team_season_lab_bids(
  p_seat_index integer,p_bids jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_profile uuid;
  v_submit_at timestamptz;
begin
  v_owner:=private.football_weekly_nfl_team_season_lab_owner();

  if p_seat_index not between 1 and 5 then
    raise exception 'Lab seat must be between 1 and 5';
  end if;

  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner;

  if v_run.owner_profile_id is null or v_run.current_day not between 1 and 6 then
    raise exception 'NFL team-season Playthrough Lab is not on a normal auction day';
  end if;

  select seat.profile_id into v_profile
  from private.football_weekly_nfl_team_season_lab_seats seat
  where seat.owner_profile_id=v_owner and seat.seat_index=p_seat_index;

  v_submit_at:=(
    (v_run.lab_week_start+(v_run.current_day-1))::date+time '12:00'
  ) at time zone 'America/Chicago';

  perform private.submit_football_weekly_nfl_team_season_bids_for_profile(
    v_run.lab_week_start,v_run.current_day,v_profile,p_bids,v_submit_at
  );

  update private.football_weekly_nfl_team_season_lab_runs
  set updated_at=now()
  where owner_profile_id=v_owner;

  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.submit_my_football_weekly_nfl_team_season_lab_bids(integer,jsonb)
  from public,anon;
grant execute on function public.submit_my_football_weekly_nfl_team_season_lab_bids(integer,jsonb)
  to authenticated;

create or replace function public.submit_my_football_weekly_nfl_team_season_lab_wildcard(
  p_seat_index integer,p_entries integer,p_rankings jsonb
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_profile uuid;
  v_submit_at timestamptz;
  v_rankings text[];
begin
  v_owner:=private.football_weekly_nfl_team_season_lab_owner();

  if p_seat_index not between 1 and 5 then
    raise exception 'Lab seat must be between 1 and 5';
  end if;
  if p_rankings is null or jsonb_typeof(p_rankings)<>'array' then
    raise exception 'Wildcard rankings must be an array';
  end if;

  select coalesce(array_agg(value order by ordinal),array[]::text[])
  into v_rankings
  from jsonb_array_elements_text(p_rankings) with ordinality ranked(value,ordinal);

  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner;

  if v_run.owner_profile_id is null or v_run.current_day<>7 then
    raise exception 'NFL team-season Playthrough Lab is not on Wildcard Day';
  end if;

  select seat.profile_id into v_profile
  from private.football_weekly_nfl_team_season_lab_seats seat
  where seat.owner_profile_id=v_owner and seat.seat_index=p_seat_index;

  v_submit_at:=(
    (v_run.lab_week_start+6)::date+time '12:00'
  ) at time zone 'America/Chicago';

  perform private.submit_football_weekly_nfl_team_season_wildcard(
    v_run.lab_week_start,v_profile,p_entries,v_rankings,v_submit_at
  );

  update private.football_weekly_nfl_team_season_lab_runs
  set updated_at=now()
  where owner_profile_id=v_owner;

  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.submit_my_football_weekly_nfl_team_season_lab_wildcard(integer,integer,jsonb)
  from public,anon;
grant execute on function public.submit_my_football_weekly_nfl_team_season_lab_wildcard(integer,integer,jsonb)
  to authenticated;

create or replace function public.advance_my_football_weekly_nfl_team_season_lab(
  p_seat_index integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_owner uuid;
  v_run private.football_weekly_nfl_team_season_lab_runs%rowtype;
  v_entries integer;
  v_card_count integer;
  v_awards integer;
  v_resolve_at timestamptz;
  v_next_at timestamptz;
  v_seat record;
  v_payloads jsonb:='{}'::jsonb;
begin
  v_owner:=private.football_weekly_nfl_team_season_lab_owner();

  if p_seat_index not between 1 and 5 then
    raise exception 'Lab seat must be between 1 and 5';
  end if;

  select * into v_run
  from private.football_weekly_nfl_team_season_lab_runs
  where owner_profile_id=v_owner
  for update;

  if v_run.owner_profile_id is null then
    raise exception 'NFL team-season Playthrough Lab is not initialized';
  end if;

  if v_run.current_day=8 then
    return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
  end if;

  if v_run.current_day between 1 and 6 then
    select count(*)::integer into v_entries
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_run.lab_week_start
      and entry.day_index=v_run.current_day;

    if v_entries<>5 then
      raise exception 'Submit all five simulated seats before resolving this day';
    end if;

    select min(board.lock_at)+interval '1 second'
    into v_resolve_at
    from private.football_weekly_auction_board board
    where board.week_start=v_run.lab_week_start
      and board.day_index=v_run.current_day;

    perform private.resolve_football_weekly_nfl_team_season_day(
      v_run.lab_week_start,v_run.current_day,v_resolve_at
    );

    v_card_count:=private.football_weekly_auction_cards_for_day(
      v_run.lab_week_start,v_run.current_day
    );

    select count(*)::integer into v_awards
    from private.football_weekly_auction_awards award
    where award.week_start=v_run.lab_week_start
      and award.day_index=v_run.current_day;

    if v_awards<>v_card_count then
      raise exception 'NFL team-season Playthrough Lab day did not fully resolve';
    end if;

    if v_run.current_day<6 then
      update private.football_weekly_nfl_team_season_lab_runs
      set current_day=v_run.current_day+1,updated_at=now()
      where owner_profile_id=v_owner;

      v_next_at:=(
        (v_run.lab_week_start+v_run.current_day)::date+time '12:00'
      ) at time zone 'America/Chicago';

      perform private.materialize_football_weekly_nfl_team_season_day(
        v_run.lab_week_start,v_run.current_day+1,v_next_at
      );
    else
      update private.football_weekly_nfl_team_season_lab_runs
      set current_day=7,updated_at=now()
      where owner_profile_id=v_owner;

      perform private.materialize_football_weekly_nfl_team_season_wildcard(
        v_run.lab_week_start
      );
    end if;
  else
    select count(*)::integer into v_entries
    from private.football_weekly_nfl_team_season_wildcard_submissions submission
    where submission.week_start=v_run.lab_week_start;

    if v_entries<>5 then
      raise exception 'Submit Wildcard decisions for all five simulated seats before resolving';
    end if;

    select max(board.lock_at)+interval '1 second'
    into v_resolve_at
    from private.football_weekly_nfl_team_season_wildcard_board board
    where board.week_start=v_run.lab_week_start;

    perform private.resolve_football_weekly_nfl_team_season_wildcard(
      v_run.lab_week_start,v_resolve_at
    );
    perform private.finalize_football_weekly_nfl_team_season_week(
      v_run.lab_week_start,v_resolve_at+interval '1 second'
    );

    if (
      select count(*)
      from private.football_weekly_auction_results result
      where result.week_start=v_run.lab_week_start
    )<>5 then
      raise exception 'NFL team-season Playthrough Lab finalizer did not produce five results';
    end if;

    for v_seat in
      select seat.seat_index,seat.profile_id
      from private.football_weekly_nfl_team_season_lab_seats seat
      where seat.owner_profile_id=v_owner
      order by seat.seat_index
    loop
      v_payloads:=v_payloads || jsonb_build_object(
        v_seat.seat_index::text,
        private.football_weekly_nfl_team_season_final_payload(
          v_run.lab_week_start,v_seat.profile_id
        )
      );
    end loop;

    delete from private.football_weekly_auction_results
    where week_start=v_run.lab_week_start;

    -- The wheel result remains in the shadow run for review, but its simulated
    -- next-week bankroll consequence must never leak into any real competition.
    delete from private.football_weekly_auction_bankroll_adjustments
    where source_week_start=v_run.lab_week_start;

    update private.football_weekly_nfl_team_season_lab_runs
    set current_day=8,
        final_payloads=v_payloads,
        updated_at=now()
    where owner_profile_id=v_owner;
  end if;

  return private.football_weekly_nfl_team_season_lab_state(v_owner,p_seat_index);
end;
$$;
revoke all on function public.advance_my_football_weekly_nfl_team_season_lab(integer)
  from public,anon;
grant execute on function public.advance_my_football_weekly_nfl_team_season_lab(integer)
  to authenticated;

-- Production maintainer must never resolve a shadow-lab board just because its
-- historical lock timestamp is in the past.
do $exclude_nfl_team_season_lab_from_maintainer$
declare
  d text;
  n text;
begin
  d:=pg_get_functiondef('private.maintain_football_weekly_auction(timestamptz)'::regprocedure);
  n:=replace(
    d,
    'where not exists(
      select 1
      from private.football_weekly_superteam_lab_runs lab
      where lab.lab_week_start=board.week_start
    )',
    'where not exists(
      select 1
      from private.football_weekly_superteam_lab_runs lab
      where lab.lab_week_start=board.week_start
    )
    and not exists(
      select 1
      from private.football_weekly_nfl_team_season_lab_runs nfl_lab
      where nfl_lab.lab_week_start=board.week_start
    )'
  );
  n:=replace(
    n,
    'and not exists(
        select 1
        from private.football_weekly_superteam_lab_runs lab
        where lab.lab_week_start=week.week_start
      )',
    'and not exists(
        select 1
        from private.football_weekly_superteam_lab_runs lab
        where lab.lab_week_start=week.week_start
      )
      and not exists(
        select 1
        from private.football_weekly_nfl_team_season_lab_runs nfl_lab
        where nfl_lab.lab_week_start=week.week_start
      )'
  );
  if n=d then
    raise exception 'NFL team-season lab maintainer exclusion patch drifted';
  end if;
  execute n;
end
$exclude_nfl_team_season_lab_from_maintainer$;

do $nfl_team_season_lab_contract$
begin
  if private.football_weekly_nfl_team_season_lab_week_start(1)<>date '1900-01-02'
    or extract(isodow from private.football_weekly_nfl_team_season_lab_week_start(1))<>2
  then
    raise exception 'NFL team-season Playthrough Lab shadow calendar drifted';
  end if;
end
$nfl_team_season_lab_contract$;
