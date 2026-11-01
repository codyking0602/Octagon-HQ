-- NBA GM V4 parity: newly started owner games reprice 1YR contracts once.
-- The salary earned from Year 2 is held in Year 3 (like Football GM).
-- Actual Year 3 ability still develops; V2/V3 historic saves are unchanged.
-- Run on a migrated isolated database; no persistent changes.
begin;
set local statement_timeout='120s';

do $nba_v4_one_time_extension$
declare
  v_draft jsonb:=jsonb_build_object('economyVersion',4,'developmentModelVersion',2,
    'phase','draft','seed','nba-v4-one-reprice-20261101');
  v_offseason jsonb:=jsonb_build_object('economyVersion',4,'developmentModelVersion',2,
    'phase','offseason','seed','nba-v4-one-reprice-20261101');
  v_legacy jsonb:=jsonb_build_object('economyVersion',3,'developmentModelVersion',2,
    'phase','offseason','seed','nba-v4-one-reprice-20261101');
  v_player record;
  v_year1 bigint;v_year2 bigint;v_year3 bigint;
  v_old_year3 bigint;v_old_expected bigint;
  v_players integer:=0;v_one_year integer:=0;v_three_year integer:=0;
  v_ability_changes integer:=0;
begin
  if not private.nba_gm_v4_salary_certified() then
    raise exception 'Contract catalog must be 330/330 source certified';end if;

  for v_player in
    select c.player_id,c.candidate_contract,c.provisional_average_salary,
           p.overall,p.salaries[1] as legacy_first
      from private.nba_gm_contract_candidates_2026_27 c
      join private.nba_gm_dev_players p on p.id=c.player_id
    order by c.player_id
  loop
    v_players:=v_players+1;
    v_year1:=private.nba_gm_v4_salary(v_offseason,v_player.player_id,1);
    v_year2:=private.nba_gm_v4_salary(v_offseason,v_player.player_id,2);
    v_year3:=private.nba_gm_v4_salary(v_offseason,v_player.player_id,3);
    if v_year1<>v_player.provisional_average_salary then
      raise exception 'V4 year-one source salary changed for %',v_player.player_id;end if;

    if v_player.candidate_contract='3YR' then
      v_three_year:=v_three_year+1;
      if v_year1<>v_year2 or v_year2<>v_year3 then
        raise exception '3YR not salary locked: %',v_player.player_id;end if;
    elsif v_player.candidate_contract='1YR' then
      v_one_year:=v_one_year+1;
      if v_year2<>v_year3 then
        raise exception 'V4 1YR repriced again for Year 3: % % %',
          v_player.player_id,v_year2,v_year3;end if;
      if private.nba_gm_v4_salary(v_draft,v_player.player_id,2)
         <>private.nba_gm_v4_salary(v_draft,v_player.player_id,3) then
        raise exception 'V4 draft forecast falsely differs in Year 3 for %',v_player.player_id;end if;
      if private.nba_gm_v3_grade(v_offseason,v_player.player_id,2)
         <>private.nba_gm_v3_grade(v_offseason,v_player.player_id,3) then
        v_ability_changes:=v_ability_changes+1;end if;
    else
      raise exception 'Unrecognized contract % for %',v_player.candidate_contract,v_player.player_id;
    end if;
  end loop;
  if v_players<>330 or v_one_year<1 or v_three_year<1 or v_ability_changes<1 then
    raise exception 'Incomplete contract or independent grade proof: %, %, %, %',
      v_players,v_one_year,v_three_year,v_ability_changes;end if;

  -- Explicit original V3 formula: V3 Year 3 still uses its own later
  -- ability and 12% market factor, preserving existing saved franchises.
  select greatest(2500000,
    round(p.salaries[1]*greatest(.66,least(2.0,
      power(1.105::numeric,private.nba_gm_v3_grade(v_legacy,p.id,3)-p.overall)*1.12))
      /100000)*100000)::bigint into v_old_expected
    from private.nba_gm_dev_players p where p.id='nba-gm-draft-normanpowell';
  v_old_year3:=private.nba_gm_v3_salary(v_legacy,'nba-gm-draft-normanpowell',3);
  if v_old_year3 is distinct from v_old_expected then
    raise exception 'Historic V3 Year-3 salary was altered: % vs %',v_old_year3,v_old_expected;end if;

  raise notice 'NBA GM one-reprice parity: % players (% 1YR, % 3YR), % independently changing Year-3 grades, original V3 preserved',
    v_players,v_one_year,v_three_year,v_ability_changes;
end;
$nba_v4_one_time_extension$;
rollback;
