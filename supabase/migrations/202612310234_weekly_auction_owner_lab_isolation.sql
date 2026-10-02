-- Keep owner-only Weekly Auction playthrough weeks isolated from live maintenance.
-- Lab weeks deliberately use historical timestamps so their submit/resolve controls can
-- exercise the production engines. Live traffic must never auto-resolve those shadow weeks.

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
$$;
revoke all on function private.maintain_football_weekly_auction(timestamptz)
  from public,anon,authenticated;

do $weekly_owner_lab_isolation_contract$
begin
  if not exists(
    select 1
    from pg_proc procedure
    join pg_namespace namespace on namespace.oid=procedure.pronamespace
    where namespace.nspname='private'
      and procedure.proname='maintain_football_weekly_auction'
      and pg_get_functiondef(procedure.oid) like '%participant.source=''owner_lab''%'
  ) then
    raise exception 'Weekly Auction live maintenance must exclude owner lab weeks';
  end if;
end;
$weekly_owner_lab_isolation_contract$;
