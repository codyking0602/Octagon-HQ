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
end $$;
rollback;
\echo 'NBA Futures 2026 frozen lines, lock and drafts passed.'
