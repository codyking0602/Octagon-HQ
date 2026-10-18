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
  if public.nba_futures_lock_at(2026)<>timestamptz '2026-10-30 16:00:00+00' then
    raise exception 'NBA Futures lock has moved'; end if;
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
\echo 'NBA Futures 2026 frozen lines, lock and drafts passed.'
