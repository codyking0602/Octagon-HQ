begin;
do $$
declare n integer;
begin
  select count(*) into n from public.nba_futures_win_lines where season=2026;
  if n<>30 then raise exception 'NBA win-total bank must have 30 teams, got %',n; end if;
  if (select count(*) from public.nba_futures_win_lines
      where season=2026 and conference='East')<>15 then raise exception 'East must have 15 teams'; end if;
  if (select win_total from public.nba_futures_win_lines where team_id='OKC' and season=2026)<>62.5
    or (select win_total from public.nba_futures_win_lines where team_id='DAL' and season=2026)<>34.5 then
    raise exception 'NBA frozen odds values changed'; end if;
  if public.nba_futures_lock_at(2026)<>timestamptz '2026-10-20 19:00:00+00' then
    raise exception 'NBA Futures lock has moved'; end if;
  -- Deadline stays the published Oct 20, but the server does not lock
  -- automatically. A trusted operator can explicitly set the manual flag.
  if not exists(select 1 from public.nba_futures_lock_control where season=2026) then
    raise exception 'NBA manual lock control missing';
  end if;
  update public.nba_futures_lock_control set manually_locked=false where season=2026;
  if public.nba_futures_is_locked(2026) then
    raise exception 'NBA Futures should stay open until manually locked';
  end if;
  update public.nba_futures_lock_control set manually_locked=true where season=2026;
  if not public.nba_futures_is_locked(2026) then
    raise exception 'NBA Futures manual close must take effect';
  end if;
  if position('now()>=public.nba_futures_lock_at' in
    pg_get_functiondef('public.save_nba_futures(integer,jsonb)'::regprocedure))>0
    or position('now()>=public.nba_futures_lock_at' in
    pg_get_functiondef('public.get_nba_futures(integer)'::regprocedure))>0 then
    raise exception 'NBA Futures may not check the calendar deadline for permissions';
  end if;
  update public.nba_futures_lock_control set manually_locked=false where season=2026;
  perform public.validate_nba_futures('{"winTotals":{"OKC":"over"},"playoffTeams":[],"conferenceFinalists":[],"finalsTeams":[],"oneSeeds":[]}'::jsonb);
  if public.nba_futures_complete('{"winTotals":{}}'::jsonb) then
    raise exception 'incomplete NBA Futures must remain pending'; end if;
  -- The complete 55-pick card must not require the retired seed, Cup, ROY or MIP fields.
  if not public.nba_futures_complete((
    with choices as (
      select team_id,conference,row_number() over(partition by conference order by team_id) as rank
      from public.nba_futures_win_lines where season=2026
    )
    select jsonb_build_object(
      'winTotals', (select jsonb_object_agg(team_id,'over') from choices),
      'playoffTeams', (select jsonb_agg(team_id) from choices where rank<=8),
      'conferenceFinalists', (select jsonb_agg(team_id) from choices where rank<=2),
      'finalsTeams', (select jsonb_agg(team_id) from choices where rank=1),
      'champion', (select team_id from choices where conference='East' and rank=1),
      'mvp','Example MVP','dpoy','Example DPOY'
    )
  )) then
    raise exception '55-pick NBA card should be complete without retired prediction categories'; end if;
end $$;
rollback;
\echo 'NBA Futures 2026 frozen lines, manual lock and drafts passed.'
