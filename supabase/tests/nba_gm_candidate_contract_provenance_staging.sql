-- Staged NBA source data must not activate NBA GM gameplay or assert certification.
begin;
do $test$
declare n bigint; v bigint; unresolved bigint;
begin
 select count(*), count(*) filter(where independently_verified),
        count(*) filter(where candidate_contract is null)
 into n,v,unresolved from private.nba_gm_contract_candidates_2026_27;
 if n <> 330 then raise exception 'Expected 330 staged NBA GM candidate records, got %',n; end if;
 if v <> 0 then raise exception 'Provisional source records must never claim independent verification'; end if;
 if unresolved < 0 or unresolved > 330 then raise exception 'Invalid unresolved term census'; end if;
 if exists (
   select 1 from private.nba_gm_contract_candidates_2026_27 c
   left join private.nba_gm_dev_players p on p.id=c.player_id
   where p.id is null or p.name <> c.player_name or p.team_code <> c.game_team_code
     or p.salaries[1] <> c.prior_salary
 ) then raise exception 'Staged audit has changed identities, teams, or legacy prices';end if;
 if exists (
   select 1 from private.nba_gm_contract_candidates_2026_27
   where actual_end_season is not null and candidate_contract <>
     case when substring(actual_end_season,1,4)::int >= 2028 then '3YR' else '1YR' end
 ) then raise exception 'Staged game terms do not match option-inclusive signed-through years';end if;
end
$test$;
rollback;
