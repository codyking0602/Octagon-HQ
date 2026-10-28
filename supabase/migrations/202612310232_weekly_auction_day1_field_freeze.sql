-- Freeze Weekly Auction participation after Day 1 while preserving elastic hidden supply.
-- CFB Superteam may still scale future unrevealed boards from its reserve pool.
-- It must never reopen participant enrollment after the first board locks.

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
  v_subject text;
  v_join_lock_at timestamptz;
  v_field_locked_at timestamptz;
  v_capacity integer;
  v_current integer;
begin
  if p_profile_id is null then return false; end if;

  if exists (
    select 1
    from public.profiles profile
    where profile.id=p_profile_id
      and profile.normalized_name='TEST2'
  ) then
    return false;
  end if;

  if exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.profile_id=p_profile_id
  ) then
    return true;
  end if;

  select week.subject_key,week.field_locked_at
  into v_subject,v_field_locked_at
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;

  if v_subject is null then return false; end if;

  -- Every Weekly Auction freezes its competitor field at the Day 1 lock.
  -- Elastic CFB supply affects hidden future cards only, never who may join.
  select min(board.lock_at) into v_join_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=p_week_start
    and board.day_index=1;

  if v_join_lock_at is null
    or v_field_locked_at is not null
    or p_at>=v_join_lock_at
  then
    return false;
  end if;

  -- Capacity protection still applies while the Day 1 join window is open.
  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(p_week_start,p_at);
    select count(*)::integer into v_current
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start;

    if v_current>=v_capacity then return false; end if;
  end if;

  insert into private.football_weekly_auction_participants(
    week_start,profile_id,locked_at,source
  )
  values (p_week_start,p_profile_id,p_at,'day_1_join')
  on conflict(week_start,profile_id) do nothing;

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
  v_subject text;
  v_join_lock_at timestamptz;
  v_due record;
  v_week record;
  v_wild_lock timestamptz;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then return; end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  -- Field membership freezes at the first board lock for every subject.
  -- CFB Superteam's elastic reserve remains available only to future boards.
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

  for v_due in
    select board.week_start,board.day_index
    from private.football_weekly_auction_board board
    where not (
      v_subject='nfl-best-team-seasons-since-2000'
      and board.day_index=7
    )
    group by board.week_start,board.day_index
    having min(board.lock_at)<=p_at
       and (
         select count(*)
         from private.football_weekly_auction_awards award
         where award.week_start=board.week_start
           and award.day_index=board.day_index
       ) < private.football_weekly_auction_cards_for_day(board.week_start,board.day_index)
    order by board.week_start,board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(v_due.week_start,v_due.day_index,p_at);
  end loop;

  -- Sweep every unresolved NFL Team-Seasons finale whose Day 7 has begun,
  -- including the prior calendar week after Tuesday rollover.
  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and week.subject_key='nfl-best-team-seasons-since-2000'
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

  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and week.subject_key<>'nfl-best-team-seasons-since-2000'
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=week.week_start
      )=private.football_weekly_auction_cards_per_week(week.week_start)
  loop
    perform private.finalize_football_weekly_auction_week(v_week.week_start,p_at);
  end loop;
end;
$$;
revoke all on function private.maintain_football_weekly_auction(timestamptz)
  from public,anon,authenticated;

do $weekly_day1_field_lock_contract$
begin
  if exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.source='elastic_join'
      and participant.locked_at>=(
        select min(board.lock_at)
        from private.football_weekly_auction_board board
        where board.week_start=participant.week_start
          and board.day_index=1
      )
      and participant.week_start>date '2026-09-29'
  ) then
    raise exception 'Future Weekly Auction fields must not admit post-Day-1 elastic joins';
  end if;
end;
$weekly_day1_field_lock_contract$;
