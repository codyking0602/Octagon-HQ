-- Average-window provenance only. Never route prototype contracts to live RPCs.
begin;
do $audit$
declare n int; complete int; unresolved int; expected bigint;
begin
  select count(*),count(*) filter (where average_game_salary is not null),
    count(*) filter (where average_game_salary is null)
    into n,complete,unresolved
    from private.nba_gm_three_season_salary_window_2026_27;
  if n<>330 then raise exception 'NBA GM salary-window audit requires 330 identities: %',n;end if;
  if complete<258 then raise exception 'Initial independently unverified source coverage unexpectedly lost: %',complete;end if;
  if complete+unresolved<>330 then raise exception 'Average source coverage invalid';end if;
  select average_game_salary into expected from private.nba_gm_three_season_salary_window_2026_27
    where player_id='nba-gm-draft-victorwembanyama';
  if expected<>35782749 then raise exception 'Wembanyama signed 3-year mean incorrect: %',expected;end if;
  if exists (
    select 1 from private.nba_gm_three_season_salary_window_2026_27 a
    join private.nba_gm_contract_candidates_2026_27 c on c.player_id=a.player_id
    where a.signed_seasons_in_game_window<>least(3,greatest(1,substring(c.actual_end_season,1,4)::int-2025))
       or (a.average_game_salary is not null and a.average_game_salary<>
           round((c.candidate_salary+coalesce(a.real_salary_2027_28,0)+
                    coalesce(a.real_salary_2028_29,0))::numeric/a.signed_seasons_in_game_window)::bigint)
  ) then raise exception 'NBA GM salary average inconsistent with real source-window math';end if;
  if exists (select 1 from private.nba_gm_three_season_salary_window_2026_27
    where average_game_salary is null and independently_verified)
  then raise exception 'Incomplete salary cannot be independently verified';end if;
  if unresolved>0 and private.nba_gm_v4_salary_certified() then
    raise exception 'V4 game must fail closed while any real future salary is unknown';end if;
end $audit$;
rollback;
