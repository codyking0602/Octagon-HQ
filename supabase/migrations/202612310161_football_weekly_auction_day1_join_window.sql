-- Keep the Weekly Auction field open through Day 1.
-- A player joins the week's field the first time they enter the Weekly Auction
-- (or hit the Football Daily gate) before the Day 1 lock. The field freezes
-- when Day 1 locks at midnight CT. There is no carry-forward roster.

create or replace function private.materialize_football_weekly_auction_participants(
  p_week_start date
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if p_week_start < date '2026-09-15' then
    return;
  end if;
  if extract(isodow from p_week_start) <> 2 then
    raise exception 'Football Weekly Auction participant field must start Tuesday';
  end if;
  if not exists (
    select 1
    from private.football_weekly_auction_weeks week
    where week.week_start=p_week_start
  ) then
    raise exception 'Football Weekly Auction week % must exist before participants can join',p_week_start;
  end if;

  -- Intentionally no-op. Membership is opt-in during Day 1 and is frozen by
  -- maintain_football_weekly_auction when the Day 1 board locks.
end;
$$;
revoke all on function private.materialize_football_weekly_auction_participants(date)
  from public,anon,authenticated;

create or replace function private.ensure_football_weekly_auction_participant(
  p_week_start date,
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns boolean
language plpgsql
security definer
set search_path=''
as $$
declare
  v_day1_lock_at timestamptz;
  v_field_locked_at timestamptz;
begin
  if p_profile_id is null then
    return false;
  end if;

  select
    week.field_locked_at,
    (
      select min(board.lock_at)
      from private.football_weekly_auction_board board
      where board.week_start=week.week_start
        and board.day_index=1
    )
  into v_field_locked_at,v_day1_lock_at
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_day1_lock_at is null then
    return false;
  end if;

  if v_field_locked_at is null and p_at < v_day1_lock_at then
    insert into private.football_weekly_auction_participants(
      week_start,profile_id,locked_at,source
    )
    values (
      p_week_start,p_profile_id,p_at,'day_1_join'
    )
    on conflict(week_start,profile_id) do nothing;
  end if;

  return exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.profile_id=p_profile_id
  );
end;
$$;
revoke all on function private.ensure_football_weekly_auction_participant(date,uuid,timestamptz)
  from public,anon,authenticated;

create or replace function private.maintain_football_weekly_auction(
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_day1_lock_at timestamptz;
  v_due record;
  v_week record;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return;
  end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  select min(board.lock_at)
  into v_day1_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=v_week_start
    and board.day_index=1;

  if v_day1_lock_at is null then
    raise exception 'Weekly Auction Day 1 board is incomplete';
  end if;

  if p_at>=v_day1_lock_at then
    update private.football_weekly_auction_weeks week
    set field_locked_at=coalesce(week.field_locked_at,v_day1_lock_at)
    where week.week_start=v_week_start;
  end if;

  for v_due in
    select board.week_start,board.day_index
    from private.football_weekly_auction_board board
    group by board.week_start,board.day_index
    having min(board.lock_at)<=p_at
       and (
         select count(*)
         from private.football_weekly_auction_awards award
         where award.week_start=board.week_start
           and award.day_index=board.day_index
       ) < private.football_weekly_auction_cards_per_day(board.week_start)
    order by board.week_start,board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(v_due.week_start,v_due.day_index,p_at);
  end loop;

  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=week.week_start
      ) = private.football_weekly_auction_cards_per_week(week.week_start)
  loop
    perform private.finalize_football_weekly_auction_week(v_week.week_start,p_at);
  end loop;
end;
$$;
revoke all on function private.maintain_football_weekly_auction(timestamptz)
  from public,anon,authenticated;

create or replace function public.football_weekly_auction_daily_gate(
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_day_index integer;
  v_required boolean;
  v_field_locked boolean;
begin
  if p_profile_id is null then
    raise exception 'profile required';
  end if;
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return jsonb_build_object('required',false,'available',false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day_index:=private.football_weekly_auction_day_index(p_at,v_week_start);
  perform private.ensure_football_weekly_auction_participant(v_week_start,p_profile_id,p_at);

  select week.field_locked_at is not null
  into v_field_locked
  from private.football_weekly_auction_weeks week
  where week.week_start=v_week_start;

  if not exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start
      and participant.profile_id=p_profile_id
  ) then
    return jsonb_build_object(
      'required',false,
      'available',false,
      'field_locked',true,
      'week_start',v_week_start,
      'day_index',v_day_index,
      'eligible_week_start',v_week_start+7
    );
  end if;

  select not exists(
    select 1
    from private.football_weekly_auction_daily_entries entry
    where entry.week_start=v_week_start
      and entry.day_index=v_day_index
      and entry.profile_id=p_profile_id
  )
  into v_required;

  return jsonb_build_object(
    'required',v_required,
    'available',true,
    'field_locked',v_field_locked,
    'week_start',v_week_start,
    'day_index',v_day_index
  );
end;
$$;
revoke all on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  from public,anon,authenticated;
grant execute on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  to service_role;

create or replace function public.get_my_football_weekly_auction(
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_subject text;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.ensure_football_weekly_auction_participant(v_week_start,v_profile,p_at);

  select subject_key
  into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='nfl-build-qb' then
    return private.get_my_football_weekly_build_qb(p_at);
  end if;

  return private.get_my_football_weekly_auction_cfb(p_at)
    || jsonb_build_object(
      'subject_key',
      coalesce(v_subject,'cfb-best-teams-since-2000')
    );
end;
$$;
revoke all on function public.get_my_football_weekly_auction(timestamptz)
  from public,anon;
grant execute on function public.get_my_football_weekly_auction(timestamptz)
  to authenticated;

create or replace function public.submit_my_football_weekly_auction_bids(
  p_bids jsonb,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_subject text;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.ensure_football_weekly_auction_participant(v_week_start,v_profile,p_at);

  select subject_key
  into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='nfl-build-qb' then
    return private.submit_my_football_weekly_build_qb_bids(p_bids,p_at);
  end if;

  return private.submit_my_football_weekly_auction_bids_cfb(p_bids,p_at);
end;
$$;
revoke all on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  from public,anon;
grant execute on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  to authenticated;

-- The Sep 22 NFL week was already frozen at the old Tuesday-start boundary.
-- It is still Day 1 when this migration ships, so rebuild that field from actual
-- Day 1 entrants and reopen it through the real Day 1 lock.
do $repair_sep22_field$
declare
  v_day1_lock_at timestamptz;
begin
  select min(board.lock_at)
  into v_day1_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=date '2026-09-22'
    and board.day_index=1;

  if v_day1_lock_at is not null and now()<v_day1_lock_at then
    delete from private.football_weekly_auction_participants participant
    where participant.week_start=date '2026-09-22'
      and not exists(
        select 1
        from private.football_weekly_auction_daily_entries entry
        where entry.week_start=participant.week_start
          and entry.day_index=1
          and entry.profile_id=participant.profile_id
      );

    update private.football_weekly_auction_weeks
    set field_locked_at=null
    where week_start=date '2026-09-22';
  end if;
end;
$repair_sep22_field$;

do $day1_join_window_contract$
declare
  v_maintain text;
  v_get text;
  v_submit text;
  v_gate text;
begin
  v_maintain:=pg_get_functiondef(
    'private.maintain_football_weekly_auction(timestamp with time zone)'::regprocedure::oid
  );
  v_get:=pg_get_functiondef(
    'public.get_my_football_weekly_auction(timestamp with time zone)'::regprocedure::oid
  );
  v_submit:=pg_get_functiondef(
    'public.submit_my_football_weekly_auction_bids(jsonb,timestamp with time zone)'::regprocedure::oid
  );
  v_gate:=pg_get_functiondef(
    'public.football_weekly_auction_daily_gate(uuid,timestamp with time zone)'::regprocedure::oid
  );

  if position('NFL Build a QB Weekly requires exactly six locked participants' in v_maintain)>0 then
    raise exception 'Weekly Auction still hard-locks NFL Build a QB to six preselected participants';
  end if;
  if position('p_at>=v_day1_lock_at' in v_maintain)=0 then
    raise exception 'Weekly Auction field does not freeze at the Day 1 board lock';
  end if;
  if position('ensure_football_weekly_auction_participant' in v_get)=0
    or position('ensure_football_weekly_auction_participant' in v_submit)=0
    or position('ensure_football_weekly_auction_participant' in v_gate)=0
  then
    raise exception 'Weekly Auction Day 1 join path is not wired across gate/get/submit';
  end if;
end;
$day1_join_window_contract$;
